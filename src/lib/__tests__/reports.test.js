import { describe, it, expect } from "vitest";
import { forecastByMonth, valueByStage, dealsByOrigin, performanceByResponsible } from "../reports.js";
import { normalizeDeal } from "../deals.js";

const deal = (over) => normalizeDeal({ id: Math.random().toString(36), titulo: "N", valor: 1000, ...over });
const today = new Date(2026, 10, 18); // 18/11/2026

describe("forecastByMonth", () => {
  it("agrupa por mês, joga datas vencidas no mês atual e conta as sem data", () => {
    const { buckets, undated } = forecastByMonth(
      [
        deal({ etapa: "neg", prob: 50, fechamento: "2026-11-30" }),
        deal({ etapa: "prop", prob: 50, fechamento: "2026-10-01" }),
        deal({ etapa: "qual", prob: 25, fechamento: "2027-01-10" }),
        deal({ etapa: "prosp" }),
        deal({ etapa: "ganho", fechamento: "2026-11-05" }),
      ],
      { today }
    );
    expect(buckets[0].key).toBe("2026-11");
    expect(buckets[0].total).toBe(2000);
    expect(buckets[0].weighted).toBe(1000);
    expect(buckets[2].total).toBe(1000);
    expect(undated).toBe(1);
  });
});

describe("demais agregações", () => {
  const list = [
    deal({ etapa: "neg", origem: "Indicação", resp: "Ana", valor: 500 }),
    deal({ etapa: "ganho", origem: "Indicação", resp: "Ana", valor: 300 }),
    deal({ etapa: "prosp", origem: "", resp: "Bia", valor: 100 }),
  ];
  it("soma valor por etapa aberta", () => {
    expect(valueByStage(list).find((s) => s.key === "neg").value).toBe(500);
  });
  it("conta por origem, com 'Não informada'", () => {
    const rows = dealsByOrigin(list);
    expect(rows[0]).toMatchObject({ label: "Indicação", count: 2, won: 1 });
    expect(rows[1].label).toBe("Não informada");
  });
  it("separa aberto e ganho por responsável", () => {
    expect(performanceByResponsible(list)[0]).toMatchObject({ label: "Ana", open: 500, won: 300 });
  });
});
