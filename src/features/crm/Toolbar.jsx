import { forwardRef, useMemo } from "react";
import { ORIGINS, ACTIVITY_FILTERS } from "../../config/crm.js";
import { activityState } from "../../lib/deals.js";
import { Icon } from "../../components/ui/Icon.jsx";

export const EMPTY_FILTERS = { query: "", responsible: "", origin: "", activity: "" };

const countBy = (deals, pick) =>
  deals.reduce((map, deal) => {
    const key = pick(deal);
    if (key) map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map());

/** Busca em tempo real + filtros com contagem por opção e etiquetas removíveis. */
export const Toolbar = forwardRef(function Toolbar({ filters, deals, responsibles, onChange, resultCount }, searchRef) {
  const set = (key, value) => onChange({ ...filters, [key]: value });
  const counts = useMemo(
    () => ({
      responsible: countBy(deals, (d) => d.resp),
      origin: countBy(deals, (d) => d.origem),
      activity: countBy(deals, (d) => activityState(d)),
    }),
    [deals]
  );

  const chips = [
    filters.query && { key: "query", label: `Busca: “${filters.query}”` },
    filters.responsible && { key: "responsible", label: `Responsável: ${filters.responsible}` },
    filters.origin && { key: "origin", label: `Origem: ${filters.origin}` },
    filters.activity && { key: "activity", label: ACTIVITY_FILTERS.find((f) => f.value === filters.activity)?.label },
  ].filter(Boolean);

  const withCount = (label, n) => (n ? `${label} (${n})` : label);

  return (
    <div className="toolbar" role="search" aria-label="Buscar e filtrar negócios">
      <label className="search">
        <Icon name="search" size={15} />
        <input
          ref={searchRef}
          type="search"
          value={filters.query}
          onChange={(event) => set("query", event.target.value)}
          placeholder="Buscar negócio, empresa ou contato"
          aria-label="Buscar negócios"
        />
        <kbd className="search__hint" aria-hidden="true">/</kbd>
      </label>
      <select value={filters.responsible} onChange={(e) => set("responsible", e.target.value)} aria-label="Filtrar por responsável">
        <option value="">Todos os responsáveis</option>
        {responsibles.map((r) => (
          <option key={r} value={r}>{withCount(r, counts.responsible.get(r))}</option>
        ))}
      </select>
      <select value={filters.origin} onChange={(e) => set("origin", e.target.value)} aria-label="Filtrar por origem">
        <option value="">Todas as origens</option>
        {ORIGINS.map((o) => (
          <option key={o} value={o} disabled={!counts.origin.get(o) && filters.origin !== o}>
            {withCount(o, counts.origin.get(o))}
          </option>
        ))}
      </select>
      <select value={filters.activity} onChange={(e) => set("activity", e.target.value)} aria-label="Filtrar por atividade">
        {ACTIVITY_FILTERS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.value ? withCount(f.label, counts.activity.get(f.value)) : f.label}
          </option>
        ))}
      </select>

      {chips.length > 0 && (
        <div className="filter-chips">
          <p className="filter-chips__count" aria-live="polite">
            {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
          </p>
          <ul>
            {chips.map((chip) => (
              <li key={chip.key}>
                <button type="button" className="chip" onClick={() => set(chip.key, "")} aria-label={`Remover filtro ${chip.label}`}>
                  {chip.label}
                  <Icon name="close" size={10} strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
          {chips.length > 1 && (
            <button type="button" className="link" onClick={() => onChange(EMPTY_FILTERS)}>Limpar todos</button>
          )}
        </div>
      )}
    </div>
  );
});
