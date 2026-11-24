/* Domínio do CRM: etapas, origens, tipos de atividade e chaves de armazenamento. */

/** Etapas do funil, em ordem. `probability` é o padrão sugerido ao mover o negócio. */
export const STAGES = [
  { key: "prosp", label: "Prospecção", probability: 10, color: "var(--stage-1)" },
  { key: "qual", label: "Qualificação", probability: 25, color: "var(--stage-2)" },
  { key: "prop", label: "Proposta enviada", probability: 50, color: "var(--stage-3)" },
  { key: "neg", label: "Negociação", probability: 75, color: "var(--stage-4)" },
  { key: "ganho", label: "Ganho", probability: 100, color: "var(--won)" },
  { key: "perdido", label: "Perdido", probability: 0, color: "var(--lost)" },
];

export const STAGE_BY_KEY = Object.fromEntries(STAGES.map((s) => [s.key, s]));
export const OPEN_STAGE_KEYS = ["prosp", "qual", "prop", "neg"];
export const isOpenStage = (key) => OPEN_STAGE_KEYS.includes(key);

export const ORIGINS = [
  "Site / formulário",
  "Google Ads",
  "Instagram",
  "LinkedIn",
  "Indicação",
  "Evento",
  "Prospecção ativa",
  "WhatsApp",
];

export const ACTIVITY_TYPES = ["Ligação", "Reunião", "E-mail", "WhatsApp", "Tarefa"];

export const LOSS_REASONS = [
  "Preço",
  "Escolheu um concorrente",
  "Sem orçamento",
  "Sem resposta do cliente",
  "Momento inadequado",
  "Outro",
];

export const ACTIVITY_FILTERS = [
  { value: "", label: "Todas as atividades" },
  { value: "late", label: "Atrasadas" },
  { value: "today", label: "Para hoje" },
  { value: "none", label: "Sem próxima atividade" },
];

export const AVATAR_COLORS = ["#0E6B66", "#3B5B92", "#8A5A9E", "#B46A3C", "#4F7A3A", "#9A4B5A"];

export const STORAGE_KEYS = { deals: "crm-deals", view: "crm-view" };
