import { describe, it, expect } from "vitest";
import { normalizeDeal, applyStageChange, computeMetrics, filterDeals, sortDeals, dealsToCsv } from "../deals.js";

const deal = (over) => normalizeDeal({ id: Math.random().toString(36), titulo: "N", valor: 1000, ...over });

describe("normalizeDeal", () => {
  it("converte registros da versão antiga", () => {
    const d = normalizeDeal({ nome: "Ana", status: "cli" });
    expect(d.etapa).toBe("ganho");
    expect(d.titulo).toBe("Ana");
    expect(d.prob).toBe(100);
  });
});

describe("applyStageChange", () => {
  it("registra no histórico e ajusta a probabilidade", () => {
    const moved = applyStageChange(deal({ etapa: "prosp" }), "neg");
    expect(moved.etapa).toBe("neg");
    expect(moved.prob).toBe(75);
    expect(moved.log[0].txt).toContain("Negociação");
  });
  it("não altera quando a etapa é a mesma", () => {
    const d = deal({ etapa: "qual" });
    expect(applyStageChange(d, "qual")).toBe(d);
  });
});

describe("computeMetrics", () => {
  it("calcula aberto, ponderado e conversão", () => {
    const m = computeMetrics([
      deal({ etapa: "neg", valor: 1000, prob: 75 }),
      deal({ etapa: "prop", valor: 2000, prob: 50 }),
      deal({ etapa: "ganho", valor: 500 }),
      deal({ etapa: "perdido", valor: 300 }),
    ]);
    expect(m.openValue).toBe(3000);
    expect(m.weightedValue).toBe(1750);
    expect(m.wonValue).toBe(500);
    expect(m.conversion).toBe(50);
  });
});

describe("filtrar, ordenar e exportar", () => {
  const list = [deal({ titulo: "Beta", valor: 10, resp: "Ana" }), deal({ titulo: "Alfa", valor: 30, resp: "Bia" })];
  it("filtra por busca e responsável", () => {
    expect(filterDeals(list, { query: "alf", responsible: "", origin: "", activity: "" })).toHaveLength(1);
    expect(filterDeals(list, { query: "", responsible: "Ana", origin: "", activity: "" })[0].titulo).toBe("Beta");
  });
  it("ordena por valor", () => {
    expect(sortDeals(list, { key: "valor", direction: "desc" })[0].titulo).toBe("Alfa");
  });
  it("gera CSV com ; e escapa aspas", () => {
    const csv = dealsToCsv([deal({ titulo: 'Plano "Pro"; anual' })]);
    expect(csv.startsWith("﻿Título;")).toBe(true);
    expect(csv).toContain('"Plano ""Pro""; anual"');
  });
});
