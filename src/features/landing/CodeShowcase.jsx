import { useState } from "react";

/* Trechos reais do projeto, resumidos, para mostrar a organização do código. */
const SAMPLES = [
  {
    id: "hook",
    label: "Hook de dados",
    file: "src/hooks/useDeals.js",
    code: `export function useDeals() {
  const [deals, setDeals] = useState([]);
  const [status, setStatus] = useState("local");
  const repo = useRef(null);

  if (!repo.current) {
    repo.current = createDealRepository({
      onDeals: setDeals,
      onStatus: setStatus,
    });
  }

  useEffect(() => repo.current.start(), []);
  return { deals, status, save, remove };
}`,
  },
  {
    id: "validation",
    label: "Validação",
    file: "src/lib/validation.js",
    code: `const RULES = {
  titulo: (v, all) => !v && !all.empresa
    ? "Informe o título do negócio ou a empresa." : "",
  cnpj: (v) => v && !isValidCnpj(v)
    ? "CNPJ inválido. Confira os 14 dígitos." : "",
  email: (v) => v && !isValidEmail(v)
    ? "Digite um e-mail válido." : "",
  motivoPerda: (v, all) =>
    all.etapa === "perdido" && !v
      ? "Escolha o motivo da perda." : "",
};`,
  },
  {
    id: "tree",
    label: "Estrutura",
    file: "src/",
    code: `src/
├─ components/ui/   Button, Field, Dialog, Toast…
├─ features/
│  ├─ crm/          Board, DealTable, DealPanel…
│  └─ landing/      Hero, Features, About…
├─ hooks/           useDeals, useDealForm,
│                   useFocusTrap, useKeyboardShortcuts
├─ lib/             regras, validação, CSV, storage
├─ config/          etapas, origens, dados do site
└─ styles/          tokens, base, componentes`,
  },
];

export function CodeShowcase() {
  const [active, setActive] = useState(SAMPLES[0].id);
  const sample = SAMPLES.find((s) => s.id === active);

  return (
    <div className="code-card">
      <div className="code-card__tabs" role="tablist" aria-label="Exemplos de código">
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            role="tab"
            id={`tab-${s.id}`}
            aria-selected={s.id === active}
            aria-controls="code-panel"
            onClick={() => setActive(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="code-card__file">{sample.file}</div>
      <pre id="code-panel" role="tabpanel" aria-labelledby={`tab-${sample.id}`} tabIndex={0}>
        <code>{sample.code}</code>
      </pre>
    </div>
  );
}
