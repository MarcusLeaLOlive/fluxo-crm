import { activityState } from "../../lib/deals.js";
import { formatRelativeDate } from "../../lib/format.js";

const LABELS = { late: "Atrasada", today: "Hoje", future: "Agendada", none: "Sem atividade" };

export function ActivityBadge({ deal }) {
  const state = activityState(deal);
  if (!state) return null;
  const text = state === "none" ? "Agendar atividade" : `${deal.atvTipo || "Atividade"} ${formatRelativeDate(deal.atvData)}`;
  return (
    <span className={`activity activity--${state}`} title={LABELS[state]}>
      <i className={`dot dot--${state}`} aria-hidden="true" />
      {text}
    </span>
  );
}

export function ActivityLegend() {
  return (
    <ul className="legend" aria-label="Legenda das atividades">
      {Object.entries(LABELS).map(([key, label]) => (
        <li key={key}>
          <i className={`dot dot--${key}`} aria-hidden="true" />
          {key === "none" ? "Sem próxima atividade" : label}
        </li>
      ))}
    </ul>
  );
}
