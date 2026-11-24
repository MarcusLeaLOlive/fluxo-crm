import { motion } from "motion/react";
import { useTooltip, Tooltip } from "./useTooltip.jsx";

/**
 * Barras horizontais com rótulo e valor diretos.
 * rows: [{ label, [serie.key]: number, color? }]; series: [{ key, label, color }]
 * Com uma série, `row.color` (se houver) pinta a barra daquela linha.
 */
export function BarList({ rows, series, format, detail }) {
  const { ref, tip, show, hide } = useTooltip();
  const max = Math.max(1, ...rows.flatMap((r) => series.map((s) => r[s.key])));

  return (
    <div className="bar-list" ref={ref} onPointerLeave={hide}>
      <ul>
      {rows.map((row, i) => (
        <li
          key={row.label}
          className="bar-list__row"
          onPointerMove={(event) =>
            show(event, (
              <>
                <strong>{row.label}</strong>
                {series.map((s) => (
                  <span key={s.key}><i style={{ background: row.color && series.length === 1 ? row.color : s.color }} />{s.label}<b>{format(row[s.key])}</b></span>
                ))}
                {detail && <small>{detail(row)}</small>}
              </>
            ))
          }
        >
          <span className="bar-list__label">{row.label}</span>
          <span className="bar-list__bars">
            {series.map((s, j) => (
              <span className="bar-list__track" key={s.key}>
                <motion.i
                  style={{ width: `${Math.max((row[s.key] / max) * 100, row[s.key] ? 1.5 : 0)}%`, background: row.color && series.length === 1 ? row.color : s.color, transformOrigin: "left" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.05 + j * 0.03, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
            ))}
          </span>
          <span className="bar-list__value">{series.map((s) => format(row[s.key])).join(" / ")}</span>
        </li>
      ))}
      </ul>
      <Tooltip tip={tip} />
    </div>
  );
}
