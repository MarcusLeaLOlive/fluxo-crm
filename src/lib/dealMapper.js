/**
 * Conversão entre o formato do app (camelCase, strings vazias)
 * e as linhas do banco (snake_case, null).
 */
import { normalizeDeal } from "./deals.js";

const TEXT_FIELDS = {
  titulo: "titulo",
  etapa: "etapa",
  motivoPerda: "motivo_perda",
  resp: "resp",
  origem: "origem",
  empresa: "empresa",
  cnpj: "cnpj",
  contato: "contato",
  cargo: "cargo",
  email: "email",
  tel: "tel",
  cidade: "cidade",
  atvTipo: "atv_tipo",
  atvDesc: "atv_desc",
};
const DATE_FIELDS = { fechamento: "fechamento", atvData: "atv_data" };

const emptyToNull = (value) => {
  const text = String(value ?? "").trim();
  return text === "" ? null : text;
};

export function dealToRow(deal) {
  const row = { id: deal.id };
  for (const [key, column] of Object.entries({ ...TEXT_FIELDS, ...DATE_FIELDS })) row[column] = emptyToNull(deal[key]);
  row.titulo = row.titulo || "Negócio";
  row.etapa = row.etapa || "prosp";
  row.valor = Number(deal.valor) || 0;
  row.prob = Math.min(100, Math.max(0, Math.round(Number(deal.prob) || 0)));
  row.updated_at = new Date(deal.updated || Date.now()).toISOString();
  return row;
}

export function logToRow(entry, dealId) {
  return { id: entry.id, deal_id: dealId, text: entry.txt, created_at: new Date(entry.ts).toISOString() };
}

export function rowToDeal(row, logRows = []) {
  const deal = { id: row.id };
  for (const [key, column] of Object.entries({ ...TEXT_FIELDS, ...DATE_FIELDS })) deal[key] = row[column] ?? "";
  deal.valor = Number(row.valor) || 0;
  deal.prob = Number(row.prob) || 0;
  deal.updated = Date.parse(row.updated_at) || Date.now();
  deal.log = logRows
    .map((l) => ({ id: l.id, ts: Date.parse(l.created_at), txt: l.text }))
    .sort((a, b) => b.ts - a.ts);
  return normalizeDeal(deal);
}
