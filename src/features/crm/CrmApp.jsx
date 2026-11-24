import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { STAGES, STAGE_BY_KEY, STORAGE_KEYS } from "../../config/crm.js";
import { safeStorage, todayISO, pluralize } from "../../lib/format.js";
import { computeMetrics, filterDeals, sortDeals, applyStageChange, responsiblesOf, dealsToCsv } from "../../lib/deals.js";
import { createSampleDeals } from "../../lib/samples.js";
import { useDeals } from "../../hooks/useDeals.js";
import { useToday } from "../../hooks/useToday.js";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts.js";
import { useAuth } from "../../hooks/useAuth.js";
import { readLocalDeals, clearLocalDeals } from "../../lib/storage.js";
import { useToast } from "../../components/ui/Toast.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Brand } from "../../components/ui/Brand.jsx";
import { Dialog } from "../../components/ui/Dialog.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { Avatar } from "../../components/ui/Avatar.jsx";
import { ThemeToggle } from "../../components/ui/ThemeToggle.jsx";
import { AuthModal } from "../auth/AuthModal.jsx";
import { Summary } from "./Summary.jsx";
import { Toolbar, EMPTY_FILTERS } from "./Toolbar.jsx";
import { Dashboard } from "./Dashboard.jsx";
import { Board } from "./Board.jsx";
import { DealTable } from "./DealTable.jsx";
import { DealPanel } from "./DealPanel.jsx";
import { ActivityLegend } from "./ActivityBadge.jsx";

const VIEWS = [
  { key: "board", label: "Funil" },
  { key: "list", label: "Lista" },
  { key: "dashboard", label: "Painel" },
];
const SYNC_LABELS = {
  local: "Modo demonstração: salvo neste navegador",
  account: "Salvo na sua conta, visível só para você",
  cloud: "Salvo na nuvem",
  syncing: "Sincronizando…",
  offline: "Sem conexão com o servidor",
};
const SHORTCUTS = [
  ["N", "Novo negócio"],
  ["/", "Buscar"],
  ["F", "Ver funil"],
  ["L", "Ver lista"],
  ["P", "Ver painel com gráficos"],
  ["Shift + ← →", "Mover negócio selecionado de etapa"],
  ["Esc", "Fechar painel ou janela"],
  ["?", "Mostrar atalhos"],
];

// Resolvido sob demanda (e nunca no build, onde não existe window).
let downloadsPromise;
const getDownloads = () => {
  if (!downloadsPromise) {
    const api = typeof window !== "undefined" ? window.claude : null;
    downloadsPromise = api?.use ? api.use("downloads").catch(() => null) : Promise.resolve(null);
  }
  return downloadsPromise;
};

/** Esqueleto exibido enquanto os dados da conta são carregados. */
function BoardSkeleton() {
  return (
    <div className="skeleton-board" aria-hidden="true">
      {STAGES.map((stage, col) => (
        <div className="skeleton-column" key={stage.key}>
          <span className="skeleton" style={{ width: "60%", height: 14, margin: "6px 6px 10px" }} />
          {Array.from({ length: col % 3 === 0 ? 2 : 1 }, (_, i) => (
            <div className="skeleton-card" key={i}>
              <span className="skeleton" style={{ width: "85%", height: 12 }} />
              <span className="skeleton" style={{ width: "55%", height: 10 }} />
              <span className="skeleton" style={{ width: "40%", height: 12, marginTop: 8 }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CrmApp({ onNavigate }) {
  const auth = useAuth();
  const { user, login, register, logout } = auth;
  const cloud = auth.mode === "cloud";
  // Com Supabase, espera a sessão ser restaurada antes de escolher onde ler os dados.
  const { deals, status, ready, save, remove, saveMany } = useDeals(cloud ? user?.id : undefined, { enabled: !auth.loading });
  const toast = useToast();
  const today = useToday();
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null
  const [importOffer, setImportOffer] = useState(null); // negócios do navegador para levar à nuvem

  const [view, setViewState] = useState(() => safeStorage.get(STORAGE_KEYS.view, "board"));
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState({ key: "etapa", direction: "asc" });
  const [panel, setPanel] = useState(null); // { key, deal, overrides }
  const [dialog, setDialog] = useState(null); // "shortcuts" | null
  const searchRef = useRef(null);
  useEffect(() => {
    getDownloads();
  }, []);

  // Título e descrição próprios da demonstração; restaura os da apresentação ao sair.
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    const previous = { title: document.title, description: meta?.content };
    document.title = "Demonstração do CRM | Fluxo";
    meta?.setAttribute("content", "Use o CRM Fluxo com dados de exemplo: funil de vendas, lista, painel com gráficos e cadastro de negócios.");
    return () => {
      document.title = previous.title;
      if (meta && previous.description) meta.setAttribute("content", previous.description);
    };
  }, []);
  const closePanelRef = useRef(() => {});

  /* ---------- dados derivados ---------- */
  // `today` entra nas dependências para recalcular alertas após a meia-noite.
  const metrics = useMemo(() => computeMetrics(deals), [deals, today]); // eslint-disable-line react-hooks/exhaustive-deps
  const visible = useMemo(() => filterDeals(deals, filters), [deals, filters, today]); // eslint-disable-line react-hooks/exhaustive-deps
  const sorted = useMemo(() => sortDeals(visible, sort), [visible, sort]);
  const responsibles = useMemo(() => responsiblesOf(deals), [deals]);

  /* ---------- ações ---------- */
  const setView = (next) => {
    setViewState(next);
    safeStorage.set(STORAGE_KEYS.view, next);
  };

  const openDeal = useCallback(
    (deal = null, overrides) =>
      setPanel({ key: Date.now(), deal, overrides: deal ? overrides : { resp: user?.name.split(" ")[0], ...overrides } }),
    [user]
  );

  const { cancelRecovery } = auth;
  const closeAuth = useCallback(
    (signedIn, mode) => {
      setAuthModal(null);
      if (mode === "recovery") {
        cancelRecovery();
        toast("Senha alterada. Você já está conectado.", { type: "success" });
      } else if (signedIn) {
        const first = signedIn.name.split(" ")[0];
        toast(mode === "register" ? `Conta criada. Bem-vindo, ${first}!` : `Bem-vindo de volta, ${first}!`, { type: "success" });
      }
    },
    [toast, cancelRecovery]
  );

  // Ao entrar na nuvem pela primeira vez, oferece trazer os negócios do modo demonstração.
  useEffect(() => {
    if (!cloud || !user || !ready) return;
    const local = readLocalDeals();
    const remoteIds = new Set(deals.map((d) => d.id));
    const pending = local.filter((d) => !remoteIds.has(d.id));
    setImportOffer(pending.length ? pending : null);
  }, [cloud, user, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const importLocal = async () => {
    const list = importOffer;
    setImportOffer(null);
    try {
      await saveMany(list.map((d) => ({ ...d, updated: Date.now() })));
      clearLocalDeals();
      toast(`${pluralize(list.length, "negócio importado", "negócios importados")} para a sua conta`, { type: "success" });
    } catch (error) {
      setImportOffer(list);
      toast(error.message, { type: "error" });
    }
  };
  const closePanel = useCallback(() => setPanel(null), []);

  const handleSave = async (deal, { isNew }) => {
    await save(deal);
    toast(isNew ? "Negócio criado" : "Negócio salvo", { type: "success" });
  };

  const handleDelete = async (deal) => {
    closePanel();
    try {
      await remove(deal.id);
      toast("Negócio excluído", { actionLabel: "Desfazer", onAction: () => save(deal) });
    } catch (error) {
      toast(error?.message || "Não foi possível excluir o negócio.", { type: "error" });
    }
  };

  const moveDeal = async (dealOrId, stageKey) => {
    const deal = typeof dealOrId === "string" ? deals.find((d) => d.id === dealOrId) : dealOrId;
    if (!deal || deal.etapa === stageKey) return;
    if (stageKey === "perdido") return openDeal(deal, { etapa: "perdido" });
    try {
      await save({ ...applyStageChange(deal, stageKey), updated: Date.now() });
      toast(`Movido para ${STAGE_BY_KEY[stageKey].label}`, { actionLabel: "Desfazer", onAction: () => save(deal) });
    } catch (error) {
      toast(error?.message || "Não foi possível mover o negócio. Tente novamente.", { type: "error" });
    }
  };

  const loadSamples = async () => {
    try {
      await saveMany(createSampleDeals());
      toast("Exemplos carregados", { type: "success" });
    } catch (error) {
      toast(error.message, { type: "error" });
    }
  };

  const exportCsv = async () => {
    if (!visible.length) return toast("Não há negócios para exportar.");
    const csv = dealsToCsv(visible);
    const label = pluralize(visible.length, "negócio exportado", "negócios exportados");
    const downloads = await getDownloads();
    if (downloads) {
      try {
        await downloads.save({ filename: `fluxo-negocios-${todayISO()}.csv`, data: csv });
        return toast(label, { type: "success" });
      } catch {
        /* recusado: tenta copiar */
      }
    }
    try {
      await navigator.clipboard.writeText(csv);
      toast(`CSV copiado (${label}). Cole em uma planilha.`, { type: "success" });
    } catch {
      toast("Não foi possível exportar neste navegador.", { type: "error" });
    }
  };

  const toggleSort = (key) =>
    setSort((s) => ({ key, direction: s.key === key && s.direction === "asc" ? "desc" : "asc" }));

  /* ---------- teclado ---------- */
  useKeyboardShortcuts(
    {
      n: () => openDeal(),
      "/": () => searchRef.current?.focus(),
      f: () => setView("board"),
      l: () => setView("list"),
      p: () => setView("dashboard"),
      "?": () => setDialog("shortcuts"),
    },
    !panel && !dialog && !authModal && !auth.recovering
  );
  useKeyboardShortcuts({ escape: () => closePanelRef.current() }, Boolean(panel));

  /* ---------- conteúdo principal ---------- */
  const loading = !ready && !deals.length;

  const emptyState = (
    <div className="empty card">
      <div className="empty__art" aria-hidden="true">
        <Icon name="board" size={22} />
      </div>
      <h2>Seu funil está vazio</h2>
      <p>Cadastre o primeiro negócio ou carregue exemplos para conhecer o sistema.</p>
      <div className="empty__actions">
        <Button variant="ghost" onClick={loadSamples}>Carregar exemplos</Button>
        <Button icon="plus" onClick={() => openDeal()}>Novo negócio</Button>
      </div>
    </div>
  );

  let dealsView;
  if (!visible.length) {
    dealsView = (
      <div className="empty card">
        <h3>Nenhum negócio encontrado</h3>
        <p>Nenhum resultado para a busca e os filtros atuais.</p>
        <div className="empty__actions">
          <Button variant="ghost" onClick={() => setFilters(EMPTY_FILTERS)}>Limpar filtros</Button>
        </div>
      </div>
    );
  } else if (view === "board") {
    dealsView = <Board deals={visible} onOpen={openDeal} onMove={moveDeal} query={filters.query} />;
  } else if (view === "list") {
    dealsView = <DealTable deals={sorted} sort={sort} onSort={toggleSort} onOpen={openDeal} query={filters.query} />;
  } else {
    dealsView = <Dashboard deals={visible} today={today} />;
  }

  return (
    <div className="app-shell">
      <div className="page-backdrop page-backdrop--fixed" aria-hidden="true" />
      <header className="app-header glass">
        <div className="container app-header__inner">
          <Brand
            onClick={(event) => {
              event.preventDefault();
              onNavigate("home");
            }}
          />
          <div className="segmented" role="group" aria-label="Modo de visualização dos negócios">
            {VIEWS.map(({ key, label }) => (
              <button key={key} type="button" aria-pressed={view === key} onClick={() => setView(key)}>
                {view === key && <motion.span layoutId="view-pill" className="segmented__pill" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                <span>{label}</span>
              </button>
            ))}
          </div>
          <ThemeToggle />
          <Button variant="ghost" icon="keyboard" className="hide-sm" onClick={() => setDialog("shortcuts")} aria-label="Atalhos de teclado" title="Atalhos de teclado" />
          <Button variant="ghost" icon="download" onClick={exportCsv} title="Exportar CSV" aria-label="Exportar CSV">
            <span className="hide-sm">Exportar</span>
          </Button>
          <Button icon="plus" onClick={() => openDeal()} aria-label="Novo negócio">
            <span className="hide-xs">Novo negócio</span>
          </Button>
          {user ? (
            <div className="user-chip">
              <Avatar name={user.name} size={28} />
              <span className="user-chip__name hide-sm">{user.name.split(" ")[0]}</span>
              <button
                type="button"
                className="icon-btn"
                onClick={async () => {
                  await logout();
                  toast("Você saiu da conta.");
                }}
                aria-label={`Sair da conta de ${user.name}`}
                title="Sair"
              >
                <Icon name="logout" size={15} />
              </button>
            </div>
          ) : (
            <Button variant="ghost" icon="user" onClick={() => setAuthModal("login")} aria-label="Entrar ou criar conta">
              <span className="hide-sm">Entrar</span>
            </Button>
          )}
        </div>
      </header>

      <main id="conteudo" className="container app-main" tabIndex={-1}>
        {loading ? (
          <div className="summary" aria-busy="true">
            <h1 className="sr-only">Carregando negócios</h1>
            <span className="skeleton" style={{ width: 280, height: 38 }} />
            <div className="skeleton-metrics">
              {[0, 1, 2, 3].map((i) => <span key={i} className="skeleton" />)}
            </div>
          </div>
        ) : (
          <Summary metrics={metrics} onShowLate={() => setFilters({ ...EMPTY_FILTERS, activity: "late" })} />
        )}

        {cloud && !user && !auth.loading && (
          <aside className="notice-bar" aria-label="Modo demonstração">
            <Icon name="user" size={16} />
            <p><strong>Modo demonstração.</strong> Os dados ficam só neste navegador. Entre para salvar na nuvem e acessar de qualquer dispositivo.</p>
            <Button size="sm" onClick={() => setAuthModal("login")}>Entrar</Button>
          </aside>
        )}
        {importOffer && (
          <aside className="notice-bar notice-bar--accent" aria-label="Importar dados do navegador">
            <Icon name="download" size={16} />
            <p>Encontramos {pluralize(importOffer.length, "negócio salvo", "negócios salvos")} neste navegador. Quer levar para a sua conta?</p>
            <div className="notice-bar__actions">
              <Button size="sm" variant="ghost" onClick={() => setImportOffer(null)}>Agora não</Button>
              <Button size="sm" onClick={importLocal}>Importar</Button>
            </div>
          </aside>
        )}

        {loading && <BoardSkeleton />}
        {!loading && !deals.length && emptyState}
        {deals.length > 0 && (
          <section className="deals" aria-labelledby="deals-title">
            <h2 id="deals-title" className="sr-only">
              {view === "board" ? "Negócios por etapa do funil" : view === "list" ? "Lista de negócios" : "Painel de relatórios"}
            </h2>
            <Toolbar
              ref={searchRef}
              filters={filters}
              deals={deals}
              responsibles={responsibles}
              onChange={setFilters}
              resultCount={visible.length}
            />
            {/* Só animação de entrada ao trocar de visão: uma saída com espera ("wait")
                travava junto com as animações de layout dos cartões. */}
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {dealsView}
            </motion.div>
          </section>
        )}

        <div className="status-row">
          {deals.length > 0 && <ActivityLegend />}
          <p className="status-row__sync" role="status">{SYNC_LABELS[status]}</p>
        </div>
      </main>

      <DealPanel
        session={panel}
        responsibles={responsibles}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={closePanel}
        closeRef={closePanelRef}
      />

      <AuthModal
        open={Boolean(authModal) || auth.recovering}
        initialMode={auth.recovering ? "recovery" : authModal || "login"}
        cloud={cloud}
        onClose={closeAuth}
        onLogin={login}
        onRegister={register}
        onResetPassword={auth.resetPassword}
        onUpdatePassword={auth.updatePassword}
      />

      <Dialog open={dialog === "shortcuts"} title="Atalhos de teclado" onClose={() => setDialog(null)}>
        <dl className="shortcuts">
          {SHORTCUTS.map(([key, text]) => (
            <div key={key}>
              <dt><kbd>{key}</kbd></dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
        <p className="dialog__note">As etapas seguem esta ordem: {STAGES.map((s) => s.label).join(", ")}.</p>
      </Dialog>
    </div>
  );
}
