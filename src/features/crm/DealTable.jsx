import { STAGE_BY_KEY } from "../../config/crm.js";
import { formatCurrency } from "../../lib/format.js";
import { Avatar } from "../../components/ui/Avatar.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { ActivityBadge } from "./ActivityBadge.jsx";
import { Highlight } from "../../components/ui/Highlight.jsx";

const COLUMNS = [
  { key: "titulo", label: "Negócio" },
  { key: "etapa", label: "Etapa" },
  { key: "valor", label: "Valor", numeric: true },
  { key: "prob", label: "Chance", numeric: true },
  { key: "resp", label: "Responsável" },
  { key: "atvData", label: "Próxima atividade" },
  { key: "origem", label: "Origem" },
];

export function DealTable({ deals, sort, onSort, onOpen, query = "" }) {
  return (
    <div className="card table-card glass-card">
      <table>
        <caption className="sr-only">Negócios, ordenados por {COLUMNS.find((c) => c.key === sort.key)?.label.toLowerCase()}</caption>
        <thead>
          <tr>
            {COLUMNS.map(({ key, label, numeric }) => {
              const active = sort.key === key;
              return (
                <th
                  key={key}
                  className={numeric ? "num" : ""}
                  aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
                >
                  <button type="button" className={`th-btn ${active ? "is-active" : ""}`} onClick={() => onSort(key)}>
                    {label}
                    <Icon name="sort" size={12} className={`sort-icon ${active ? `is-${sort.direction}` : ""}`} />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => {
            const stage = STAGE_BY_KEY[deal.etapa];
            return (
              <tr
                key={deal.id}
                tabIndex={0}
                onClick={() => onOpen(deal)}
                onKeyDown={(event) => event.key === "Enter" && onOpen(deal)}
              >
                <td>
                  <div className="cell-title"><Highlight text={deal.titulo} query={query} /></div>
                  <div className="cell-sub">{[deal.empresa, deal.cidade].filter(Boolean).join(", ")}</div>
                </td>
                <td>
                  <span className="stage-tag" style={{ "--swatch": stage.color }}>
                    <i className="swatch" aria-hidden="true" />
                    {stage.label}
                  </span>
                </td>
                <td className="num strong">{formatCurrency(deal.valor)}</td>
                <td className="num">{deal.prob}%</td>
                <td>
                  <span className="person">
                    <Avatar name={deal.resp} />
                    {deal.resp || "—"}
                  </span>
                </td>
                <td>
                  <ActivityBadge deal={deal} />
                  {deal.etapa === "perdido" && <span className="cell-sub">{deal.motivoPerda || "—"}</span>}
                  {deal.etapa === "ganho" && <span className="cell-sub">—</span>}
                </td>
                <td><span className="cell-sub">{deal.origem || "—"}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
