import { AVATAR_COLORS } from "../config/crm.js";

/* ---------- Funções ---------- */
export function debounce(fn, wait = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/* ---------- Números ---------- */
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export const formatCurrency = (n) => currency.format(Number(n) || 0);

export function formatCurrencyShort(n) {
  const v = Number(n) || 0;
  if (v >= 1e6) return `R$ ${compact.format(v / 1e6)} mi`;
  if (v >= 1e4) return `R$ ${compact.format(v / 1e3)} mil`;
  return formatCurrency(v);
}

export const pluralize = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

/* ---------- Datas (ISO yyyy-mm-dd no fuso local) ---------- */
export function toISODate(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
export const todayISO = () => toISODate(new Date());
export const addDaysISO = (days) => toISODate(Date.now() + days * 864e5);

export function formatRelativeDate(iso) {
  if (!iso) return "";
  if (iso === todayISO()) return "hoje";
  if (iso === addDaysISO(1)) return "amanhã";
  if (iso === addDaysISO(-1)) return "ontem";
  return new Date(`${iso}T12:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(".", "");
}

export const formatTimestamp = (ts) =>
  new Date(ts)
    .toLocaleString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    .replace(".", "");

/* ---------- Texto e identidade ---------- */
export const initials = (name) =>
  (name || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export function colorFromString(text) {
  let hash = 0;
  for (const ch of text || "") hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export const createId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/** UUID v4 (usado como chave dos registros de histórico no banco). */
export function createUuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (Number(c) ^ ((Math.random() * 16) >> (Number(c) / 4))).toString(16)
  );
}

/* ---------- localStorage seguro (pode não existir no visualizador) ---------- */
export const safeStorage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* armazenamento indisponível: segue só em memória */
    }
  },
};
