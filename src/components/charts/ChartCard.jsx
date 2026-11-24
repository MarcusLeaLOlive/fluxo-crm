import { useId } from "react";

/**
 * Moldura comum dos gráficos: título, descrição, legenda (para 2+ séries),
 * o gráfico em si e uma tabela com os mesmos dados (acessível e conferível).
 */
export function ChartCard({ title, description, series, table, className = "", children }) {
  const id = useId();
  return (
    <section className={`card chart-card ${className}`} aria-labelledby={`${id}-title`}>
      <header className="chart-card__head">
        <div>
          <h3 id={`${id}-title`}>{title}</h3>
          {description && <p>{description}</p>}
        </div>
        {series?.length > 1 && (
          <ul className="chart-legend" aria-label="Legenda">
            {series.map((s) => (
              <li key={s.key}>
                <i style={{ background: s.color }} aria-hidden="true" />
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </header>
      <div className="chart-card__plot" aria-hidden="true">{children}</div>
      {table && (
        <details className="chart-table">
          <summary>Ver dados em tabela</summary>
          {table}
        </details>
      )}
    </section>
  );
}

/** Tabela simples a partir de colunas { key, label, format } e linhas. */
export function DataTable({ caption, columns, rows }) {
  return (
    <table>
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>{columns.map((c) => <th key={c.key} scope="col" className={c.numeric ? "num" : ""}>{c.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((c, j) =>
              j === 0 ? (
                <th key={c.key} scope="row">{row[c.key]}</th>
              ) : (
                <td key={c.key} className={c.numeric ? "num" : ""}>{c.format ? c.format(row[c.key]) : row[c.key]}</td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
