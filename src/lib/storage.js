/**
 * Camada de persistência. Duas implementações com a mesma interface
 * (start / save / remove / stop), escolhidas em useDeals:
 *
 * - createLocalRepository: modo demonstração. Usa o banco da conta Claude
 *   (quando a página roda lá) ou o localStorage do navegador.
 * - createSupabaseRepository: usuário autenticado. PostgreSQL no Supabase,
 *   com RLS e sincronização em tempo real entre abas e dispositivos.
 */
import { STORAGE_KEYS } from "../config/crm.js";
import { safeStorage, debounce } from "./format.js";
import { normalizeDeal } from "./deals.js";
import { dealToRow, logToRow, rowToDeal } from "./dealMapper.js";

const SYNC_TIMEOUT_MS = 10000;

/* =========================================================================
   Modo demonstração
   ========================================================================= */
export function createLocalRepository({ onDeals, onStatus, onReady = () => {} }) {
  let deals = safeStorage.get(STORAGE_KEYS.deals, []).map(normalizeDeal);
  let collection = null;
  let mode = "local";

  const publish = () => onDeals(deals);
  const persistLocal = () => safeStorage.set(STORAGE_KEYS.deals, deals);

  async function connectToAccount() {
    const api = typeof window !== "undefined" ? window.claude : null;
    if (!api?.use) return onReady();
    const [db, user] = await Promise.all([api.use("db"), api.use("user")]);
    if (!db || !user) return onReady();

    collection = db.collection(`data/users/${await user.id()}/deals`);
    let received = false;
    const timer = setTimeout(() => {
      if (received) return;
      onStatus("offline");
      onReady();
    }, SYNC_TIMEOUT_MS);

    collection.onSnapshot(
      (snapshot) => {
        received = true;
        clearTimeout(timer);
        const docs = snapshot.docs || snapshot || [];
        deals = docs.map((doc) =>
          normalizeDeal({ id: doc.id, ...(typeof doc.data === "function" ? doc.data() : doc.data || doc) })
        );
        mode = "account";
        onStatus("account");
        publish();
        onReady();
      },
      () => {
        received = true;
        clearTimeout(timer);
        onStatus("offline");
        onReady();
      }
    );
  }

  return {
    kind: "local",
    start() {
      onStatus("local");
      publish();
      connectToAccount().catch(() => {
        onStatus("offline");
        onReady();
      });
    },
    stop() {},
    async save(deal) {
      if (mode === "account") {
        const { id, ...data } = deal;
        await collection.doc(id).set(data);
        return;
      }
      const exists = deals.some((d) => d.id === deal.id);
      deals = exists ? deals.map((d) => (d.id === deal.id ? deal : d)) : [...deals, deal];
      persistLocal();
      publish();
    },
    async remove(id) {
      if (mode === "account") {
        await collection.doc(id).delete();
        return;
      }
      deals = deals.filter((d) => d.id !== id);
      persistLocal();
      publish();
    },
  };
}

/** Negócios guardados no navegador (para oferecer a importação para a nuvem). */
export const readLocalDeals = () => safeStorage.get(STORAGE_KEYS.deals, []).map(normalizeDeal);
export const clearLocalDeals = () => safeStorage.set(STORAGE_KEYS.deals, []);

/* =========================================================================
   Supabase (usuário autenticado)
   ========================================================================= */
const DEAL_COLUMNS =
  "id, titulo, etapa, motivo_perda, valor, prob, fechamento, resp, origem, empresa, cnpj, contato, cargo, email, tel, cidade, atv_tipo, atv_data, atv_desc, updated_at";

/** Erro do banco → mensagem em português para o usuário. */
export function describeDbError(error) {
  const message = error?.message || "";
  if (/fetch|network|Failed to fetch/i.test(message)) return "Sem conexão com o servidor. Verifique sua internet.";
  if (/JWT|token|not authorized|permission denied|row-level security/i.test(message)) return "Sua sessão expirou. Entre novamente.";
  if (/motivo_obrigatorio/.test(message)) return "Informe o motivo da perda.";
  if (/violates check constraint/i.test(message)) return "Algum valor está fora do permitido. Revise o formulário.";
  return "Não foi possível salvar no servidor. Tente novamente.";
}

export function createSupabaseRepository({ supabase, userId, onDeals, onStatus, onReady = () => {} }) {
  let deals = [];
  let channel = null;
  let stopped = false;

  const publish = () => !stopped && onDeals(deals);

  async function load() {
    const [dealsRes, logsRes] = await Promise.all([
      supabase.from("deals").select(DEAL_COLUMNS).order("updated_at", { ascending: false }),
      supabase.from("deal_logs").select("id, deal_id, text, created_at"),
    ]);
    if (dealsRes.error) throw dealsRes.error;
    if (logsRes.error) throw logsRes.error;

    const logsByDeal = new Map();
    for (const log of logsRes.data) {
      if (!logsByDeal.has(log.deal_id)) logsByDeal.set(log.deal_id, []);
      logsByDeal.get(log.deal_id).push(log);
    }
    deals = dealsRes.data.map((row) => rowToDeal(row, logsByDeal.get(row.id)));
    publish();
  }

  // Alterações feitas em outra aba ou dispositivo: recarrega (agrupando eventos próximos).
  const reloadSoon = debounce(() => load().catch(() => onStatus("offline")), 400);

  /** Aplica a mudança na tela na hora e desfaz se o servidor recusar. */
  async function optimistic(next, request) {
    const previous = deals;
    deals = next;
    publish();
    onStatus("syncing");
    try {
      await request();
      onStatus("cloud");
    } catch (error) {
      deals = previous;
      publish();
      onStatus("cloud");
      throw new Error(describeDbError(error));
    }
  }

  return {
    kind: "supabase",
    async start() {
      onStatus("syncing");
      try {
        await load();
        onStatus("cloud");
      } catch {
        onStatus("offline");
      }
      onReady();
      channel = supabase
        .channel(`deals-${userId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "deals", filter: `owner_id=eq.${userId}` }, reloadSoon)
        .on("postgres_changes", { event: "*", schema: "public", table: "deal_logs", filter: `owner_id=eq.${userId}` }, reloadSoon)
        .subscribe();
    },

    stop() {
      stopped = true;
      if (channel) supabase.removeChannel(channel);
    },

    save(deal) {
      const exists = deals.some((d) => d.id === deal.id);
      const next = exists ? deals.map((d) => (d.id === deal.id ? deal : d)) : [deal, ...deals];
      return optimistic(next, async () => {
        const { error } = await supabase.from("deals").upsert(dealToRow(deal));
        if (error) throw error;
        if (deal.log.length) {
          // Histórico é só de inclusão; o id fixo torna o envio idempotente (inclusive no "Desfazer").
          const { error: logError } = await supabase
            .from("deal_logs")
            .upsert(deal.log.map((entry) => logToRow(entry, deal.id)), { onConflict: "id", ignoreDuplicates: true });
          if (logError) throw logError;
        }
      });
    },

    async saveMany(list) {
      const next = [...list, ...deals.filter((d) => !list.some((n) => n.id === d.id))];
      return optimistic(next, async () => {
        const { error } = await supabase.from("deals").upsert(list.map(dealToRow));
        if (error) throw error;
        const logs = list.flatMap((deal) => deal.log.map((entry) => logToRow(entry, deal.id)));
        if (logs.length) {
          const { error: logError } = await supabase.from("deal_logs").upsert(logs, { onConflict: "id", ignoreDuplicates: true });
          if (logError) throw logError;
        }
      });
    },

    remove(id) {
      return optimistic(
        deals.filter((d) => d.id !== id),
        async () => {
          // O histórico sai junto (on delete cascade).
          const { error } = await supabase.from("deals").delete().eq("id", id);
          if (error) throw error;
        }
      );
    },
  };
}
