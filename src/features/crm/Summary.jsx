import { formatCurrency, pluralize } from "../../lib/format.js";

/** Um indicador: rótulo (dt), valor e legenda (dd). */
function Metric({ label, value, caption, highlight }) {
  return (
    <dl className={`card metric ${highlight ? "metric--highlight" : ""}`}>
      <dt className="metric__label">{label}</dt>
      <dd className="metric__value">{value}</dd>
      {caption && <dd className="metric__caption">{caption}</dd>}
    </dl>
  );
}

export function Summary({ metrics: m, onShowLate }) {
  if (!m.total) {
    return (
      <section className="summary" aria-labelledby="summary-title">
        <h1 className="lede" id="summary-title">Seu funil de vendas</h1>
        <p className="lede-sub">Organize negócios, contatos e atividades em um só lugar.</p>
      </section>
    );
  }

  return (
    <section className="summary" aria-labelledby="summary-title">
      <div className="summary__head">
        <h1 className="lede" id="summary-title">
          {m.openCount ? `${pluralize(m.openCount, "negócio", "negócios")} em andamento` : "Nenhum negócio em andamento"}
        </h1>
        {m.lateCount > 0 && (
          <button type="button" className="pill pill--alert" onClick={onShowLate}>
            <i className="dot dot--late" aria-hidden="true" />
            {pluralize(m.lateCount, "atividade atrasada", "atividades atrasadas")}
          </button>
        )}
      </div>

      <h2 className="sr-only">Indicadores do funil</h2>
      <div className="bento-metrics">
        <Metric highlight label="Em aberto" value={formatCurrency(m.openValue)} caption={pluralize(m.openCount, "negócio", "negócios")} />
        <Metric label="Previsão ponderada" value={formatCurrency(m.weightedValue)} caption="Valor × probabilidade" />
        <Metric label="Ganho" value={formatCurrency(m.wonValue)} caption="Negócios fechados" />
        <Metric
          label="Conversão"
          value={m.conversion === null ? "—" : `${m.conversion}%`}
          caption={m.conversion === null ? "Sem negócios fechados" : "Ganhos sobre fechados"}
        />
        {m.openCount > 0 && (
          <div className="card funnel">
            <div className="funnel__bar" role="img" aria-label="Valor em aberto por etapa">
              {m.byStage.map(({ stage, value }) => (
                <i
                  key={stage.key}
                  style={{ flexGrow: Math.max(value, m.openValue * 0.02), background: stage.color }}
                  title={`${stage.label}: ${formatCurrency(value)}`}
                />
              ))}
            </div>
            <ul className="funnel__legend">
              {m.byStage.map(({ stage, count, value }) => (
                <li key={stage.key}>
                  <span>
                    <i className="swatch" style={{ "--swatch": stage.color }} aria-hidden="true" />
                    {stage.label}
                  </span>
                  {formatCurrency(value)}, {pluralize(count, "negócio", "negócios")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
