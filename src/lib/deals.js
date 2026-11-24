/* Regras de negócio: normalização, métricas, filtros, ordenação e exportação. */
import { STAGES, STAGE_BY_KEY, OPEN_STAGE_KEYS, isOpenStage } from "../config/crm.js";
import { todayISO, createUuid } from "./format.js";

const LEGACY_STATUS = { lead: "prosp", neg: "neg", cli: "ganho", ina: "perdido" };
const STAGE_ORDER = Object.fromEntries(STAGES.map((s, i) => [s.key, i]));

/** Garante o formato atual, inclusive para registros de versões anteriores. */
export function normalizeDeal(raw) {
  const deal = { ...raw };
  if (!deal.etapa && deal.status) deal.etapa = LEGACY_STATUS[deal.status] || "prosp";
  if (!STAGE_BY_KEY[deal.etapa]) deal.etapa = "prosp";
  if (!deal.titulo) deal.titulo = deal.nome || deal.empresa || "Negócio";
  if (!deal.contato && deal.nome) deal.contato = deal.nome;
  if (deal.prob == null || deal.prob === "") deal.prob = STAGE_BY_KEY[deal.etapa].probability;
  deal.valor = Number(deal.valor) || 0;
  deal.prob = Number(deal.prob) || 0;
  deal.log = (Array.isArray(deal.log) ? deal.log : []).map((entry) => (entry.id ? entry : { ...entry, id: createUuid() }));
  return deal;
}

export const logEntry = (text) => ({ id: createUuid(), ts: Date.now(), txt: text });

/** Retorna um novo negócio com a etapa alterada e o histórico registrado. */
export function applyStageChange(deal, toKey, { resetProbability = true } = {}) {
  if (deal.etapa === toKey) return deal;
  const from = STAGE_BY_KEY[deal.etapa];
  const to = STAGE_BY_KEY[toKey];
  const next = { ...deal, etapa: toKey, log: [logEntry(`Etapa alterada de ${from.label} para ${to.label}`), ...deal.log] };
  if (resetProbability) next.prob = to.probability;
  if (!isOpenStage(toKey)) next.fechamento = next.fechamento || todayISO();
  if (toKey !== "perdido") next.motivoPerda = "";
  return next;
}

/** late | today | future | none | "" (negócio fechado) */
export function activityState(deal) {
  if (!isOpenStage(deal.etapa)) return "";
  if (!deal.atvData) return "none";
  const today = todayISO();
  if (deal.atvData < today) return "late";
  return deal.atvData === today ? "today" : "future";
}

const sumValue = (list) => list.reduce((acc, d) => acc + d.valor, 0);

export function computeMetrics(deals) {
  const open = deals.filter((d) => isOpenStage(d.etapa));
  const won = deals.filter((d) => d.etapa === "ganho");
  const lost = deals.filter((d) => d.etapa === "perdido");
  const closed = won.length + lost.length;
  const openValue = sumValue(open);
  return {
    total: deals.length,
    openCount: open.length,
    openValue,
    weightedValue: open.reduce((acc, d) => acc + (d.valor * d.prob) / 100, 0),
    wonValue: sumValue(won),
    conversion: closed ? Math.round((won.length / closed) * 100) : null,
    lateCount: open.filter((d) => activityState(d) === "late").length,
    byStage: OPEN_STAGE_KEYS.map((key) => {
      const items = open.filter((d) => d.etapa === key);
      return { stage: STAGE_BY_KEY[key], count: items.length, value: sumValue(items) };
    }),
  };
}

export function filterDeals(deals, { query, responsible, origin, activity }) {
  const q = query.trim().toLowerCase();
  return deals.filter(
    (d) =>
      (!responsible || d.resp === responsible) &&
      (!origin || d.origem === origin) &&
      (!activity || activityState(d) === activity) &&
      (!q || [d.titulo, d.empresa, d.contato, d.email].join(" ").toLowerCase().includes(q))
  );
}

const SORTERS = {
  titulo: (d) => d.titulo.toLowerCase(),
  etapa: (d) => STAGE_ORDER[d.etapa],
  valor: (d) => d.valor,
  prob: (d) => d.prob,
  resp: (d) => (d.resp || "~").toLowerCase(),
  atvData: (d) => d.atvData || "9999",
  origem: (d) => (d.origem || "~").toLowerCase(),
};

export function sortDeals(deals, { key, direction }) {
  const pick = SORTERS[key] || SORTERS.etapa;
  const sign = direction === "desc" ? -1 : 1;
  return [...deals].sort((a, b) => {
    const [x, y] = [pick(a), pick(b)];
    if (x < y) return -sign;
    if (x > y) return sign;
    return b.valor - a.valor;
  });
}

export const responsiblesOf = (deals) => [...new Set(deals.map((d) => d.resp).filter(Boolean))].sort();

/* ---------- Exportação CSV (separador ; e BOM para abrir certo no Excel) ---------- */
const CSV_COLUMNS = [
  ["Título", (d) => d.titulo],
  ["Empresa", (d) => d.empresa],
  ["CNPJ", (d) => d.cnpj],
  ["Contato", (d) => d.contato],
  ["Cargo", (d) => d.cargo],
  ["E-mail", (d) => d.email],
  ["Telefone", (d) => d.tel],
  ["Cidade/UF", (d) => d.cidade],
  ["Etapa", (d) => STAGE_BY_KEY[d.etapa].label],
  ["Valor", (d) => d.valor],
  ["Probabilidade (%)", (d) => d.prob],
  ["Valor ponderado", (d) => Math.round((d.valor * d.prob) / 100)],
  ["Responsável", (d) => d.resp],
  ["Origem", (d) => d.origem],
  ["Fechamento", (d) => d.fechamento],
  ["Próxima atividade", (d) => [d.atvTipo, d.atvDesc].filter(Boolean).join(": ")],
  ["Data da atividade", (d) => d.atvData],
  ["Motivo da perda", (d) => d.motivoPerda],
];

const csvCell = (value) => {
  const text = String(value ?? "");
  return /[;"\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function dealsToCsv(deals) {
  const header = CSV_COLUMNS.map(([label]) => label).join(";");
  const rows = deals.map((d) => CSV_COLUMNS.map(([, get]) => csvCell(get(d))).join(";"));
  return "﻿" + [header, ...rows].join("\n");
}
