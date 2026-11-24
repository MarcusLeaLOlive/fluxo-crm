import { useMemo } from "react";
import { STAGE_BY_KEY } from "../../config/crm.js";
import { formatCurrency, formatCurrencyShort, pluralize } from "../../lib/format.js";
import { forecastByMonth, valueByStage, dealsByOrigin, performanceByResponsible } from "../../lib/reports.js";
import { ChartCard, DataTable } from "../../components/charts/ChartCard.jsx";
import { ColumnChart } from "../../components/charts/ColumnChart.jsx";
import { BarList } from "../../components/charts/BarList.jsx";

const SERIES = {
  total: { key: "total", label: "Valor total", color: "var(--series-2)" },
  weighted: { key: "weighted", label: "Ponderado", color: "var(--series-1)" },
  open: { key: "open", label: "Em aberto", color: "var(--series-1)" },
  won: { key: "won", label: "Ganho", color: "var(--series-2)" },
  value: { key: "value", label: "Valor", color: "var(--series-1)" },
  count: { key: "count", label: "Negócios", color: "var(--series-1)" },
};

const short = (n) => formatCurrencyShort(n).replace(",0 ", " ");

/** Painel de relatórios: usa os mesmos negócios filtrados da lista e do funil. */
export function Dashboard({ deals, today }) {
  const forecast = useMemo(() => forecastByMonth(deals), [deals, today]); // eslint-disable-line react-hooks/exhaustive-deps
  const stages = useMemo(
    () => valueByStage(deals).map((s) => ({ ...s, label: STAGE_BY_KEY[s.key].label, color: STAGE_BY_KEY[s.key].color })),
    [deals]
  );
  const origins = useMemo(() => dealsByOrigin(deals), [deals]);
  const people = useMemo(() => performanceByResponsible(deals), [deals]);

  return (
    <div className="dashboard">
      <ChartCard
        className="dashboard__wide"
        title="Previsão de fechamento por mês"
        description={
          forecast.undated
            ? `Negócios em aberto pela data prevista. ${pluralize(forecast.undated, "negócio sem data não entra", "negócios sem data não entram")} no gráfico.`
            : "Negócios em aberto pela data prevista de fechamento."
        }
        series={[SERIES.total, SERIES.weighted]}
        table={
          <DataTable
            caption="Previsão de fechamento por mês"
            columns={[
              { key: "label", label: "Mês" },
              { key: "count", label: "Negócios", numeric: true },
              { key: "total", label: "Valor total", numeric: true, format: formatCurrency },
              { key: "weighted", label: "Ponderado", numeric: true, format: formatCurrency },
            ]}
            rows={forecast.buckets}
          />
        }
      >
        <ColumnChart data={forecast.buckets} series={[SERIES.total, SERIES.weighted]} format={short} />
      </ChartCard>

      <ChartCard
        title="Valor em aberto por etapa"
        description="Quanto está parado em cada etapa do funil."
        table={
          <DataTable
            caption="Valor em aberto por etapa"
            columns={[
              { key: "label", label: "Etapa" },
              { key: "count", label: "Negócios", numeric: true },
              { key: "value", label: "Valor", numeric: true, format: formatCurrency },
            ]}
            rows={stages}
          />
        }
      >
        <BarList rows={stages} series={[SERIES.value]} format={short} detail={(r) => pluralize(r.count, "negócio", "negócios")} />
      </ChartCard>

      <ChartCard
        title="Negócios por origem"
        description="De onde vêm os leads, com quantos viraram venda."
        table={
          <DataTable
            caption="Negócios por origem"
            columns={[
              { key: "label", label: "Origem" },
              { key: "count", label: "Negócios", numeric: true },
              { key: "won", label: "Ganhos", numeric: true },
              { key: "value", label: "Valor", numeric: true, format: formatCurrency },
            ]}
            rows={origins}
          />
        }
      >
        <BarList
          rows={origins}
          series={[SERIES.count]}
          format={(n) => String(n)}
          detail={(r) => `${pluralize(r.won, "ganho", "ganhos")}, ${formatCurrency(r.value)}`}
        />
      </ChartCard>

      <ChartCard
        className="dashboard__wide"
        title="Desempenho por responsável"
        description="Valor em aberto e valor ganho de cada pessoa da equipe."
        series={[SERIES.open, SERIES.won]}
        table={
          <DataTable
            caption="Desempenho por responsável"
            columns={[
              { key: "label", label: "Responsável" },
              { key: "open", label: "Em aberto", numeric: true, format: formatCurrency },
              { key: "won", label: "Ganho", numeric: true, format: formatCurrency },
            ]}
            rows={people}
          />
        }
      >
        <BarList rows={people} series={[SERIES.open, SERIES.won]} format={short} />
      </ChartCard>
    </div>
  );
}
