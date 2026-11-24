import { motion } from "motion/react";
import { useTooltip, Tooltip } from "./useTooltip.jsx";

const niceMax = (value) => {
  if (value <= 0) return 1;
  const step = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / step) * step;
};

/**
 * Colunas agrupadas (uma ou mais séries) com eixo de valores único.
 * data: [{ label, [serie.key]: number }]; series: [{ key, label, color }]
 */
export function ColumnChart({ data, series, format, height = 220 }) {
  const { ref, tip, show, hide } = useTooltip();
  const max = niceMax(Math.max(0, ...data.flatMap((d) => series.map((s) => d[s.key]))));
  const ticks = [max, max / 2, 0];

  return (
    <div className="column-chart" ref={ref} style={{ "--plot-h": `${height}px` }} onPointerLeave={hide}>
      <div className="column-chart__grid">
        {ticks.map((t) => (
          <div key={t} className="column-chart__tick"><span>{format(t)}</span></div>
        ))}
      </div>
      <div className="column-chart__groups">
        {data.map((d, i) => (
          <div
            key={d.label}
            className="column-chart__group"
            onPointerMove={(event) =>
              show(event, (
                <>
                  <strong>{d.label}</strong>
                  {series.map((s) => (
                    <span key={s.key}><i style={{ background: s.color }} />{s.label}<b>{format(d[s.key])}</b></span>
                  ))}
                </>
              ))
            }
          >
            <div className="column-chart__bars">
              {series.map((s, j) => (
                <motion.i
                  key={s.key}
                  style={{ height: `${(d[s.key] / max) * 100}%`, background: s.color, transformOrigin: "bottom" }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.05 + j * 0.03, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
            </div>
            <span className="column-chart__label">{d.label}</span>
          </div>
        ))}
      </div>
      <Tooltip tip={tip} />
    </div>
  );
}
