/* Agregações para o painel de gráficos. Funções puras e testáveis. */
import { OPEN_STAGE_KEYS, isOpenStage } from "../config/crm.js";

const monthKey = (iso) => iso.slice(0, 7);
const monthLabel = (key) =>
  new Date(`${key}-15T12:00`).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");

/**
 * Previsão de fechamento dos negócios em aberto, por mês.
 * Datas já vencidas entram no mês atual; negócios sem data são contados à parte.
 */
export function forecastByMonth(deals, { months = 6, today = new Date() } = {}) {
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const buckets = Array.from({ length: months }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { key, label: monthLabel(key), total: 0, weighted: 0, count: 0 };
  });
  const first = buckets[0].key;
  const last = buckets[buckets.length - 1].key;
  let undated = 0;

  for (const deal of deals) {
    if (!isOpenStage(deal.etapa)) continue;
    if (!deal.fechamento) {
      undated += 1;
      continue;
    }
    const key = monthKey(deal.fechamento) < first ? first : monthKey(deal.fechamento);
    if (key > last) continue;
    const bucket = buckets.find((b) => b.key === key);
    bucket.total += deal.valor;
    bucket.weighted += (deal.valor * deal.prob) / 100;
    bucket.count += 1;
  }
  return { buckets, undated };
}

export function valueByStage(deals) {
  return OPEN_STAGE_KEYS.map((key) => {
    const items = deals.filter((d) => d.etapa === key);
    return { key, count: items.length, value: items.reduce((sum, d) => sum + d.valor, 0) };
  });
}

export function dealsByOrigin(deals) {
  const map = new Map();
  for (const deal of deals) {
    const origin = deal.origem || "Não informada";
    const row = map.get(origin) || { label: origin, count: 0, value: 0, won: 0 };
    row.count += 1;
    row.value += deal.valor;
    if (deal.etapa === "ganho") row.won += 1;
    map.set(origin, row);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || b.value - a.value);
}

export function performanceByResponsible(deals) {
  const map = new Map();
  for (const deal of deals) {
    const name = deal.resp || "Sem responsável";
    const row = map.get(name) || { label: name, open: 0, won: 0 };
    if (isOpenStage(deal.etapa)) row.open += deal.valor;
    if (deal.etapa === "ganho") row.won += deal.valor;
    map.set(name, row);
  }
  return [...map.values()].sort((a, b) => b.open + b.won - (a.open + a.won));
}
