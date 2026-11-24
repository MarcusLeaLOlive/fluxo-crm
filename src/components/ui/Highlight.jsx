/** Destaca o termo buscado dentro de um texto (sem diferenciar maiúsculas). */
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function Highlight({ text, query }) {
  const term = query?.trim();
  if (!term) return text;
  const parts = String(text).split(new RegExp(`(${escapeRegExp(term)})`, "ig"));
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? <mark key={i}>{part}</mark> : part
  );
}
