import { describe, it, expect, vi } from "vitest";
import { createSupabaseRepository, describeDbError } from "../storage.js";
import { dealToRow, rowToDeal } from "../dealMapper.js";
import { describeAuthError } from "../../hooks/useAuth.js";
import { normalizeDeal, logEntry } from "../deals.js";

/** Cliente Supabase simulado: guarda as tabelas em memória e registra as chamadas. */
function mockSupabase({ deals = [], logs = [], failOn } = {}) {
  const db = { deals: [...deals], deal_logs: [...logs] };
  const calls = [];
  const from = (table) => {
    const api = {
      select: () => api,
      order: () => api,
      upsert(rows, opts) {
        calls.push({ table, op: "upsert", rows: [].concat(rows), opts });
        if (failOn === table) return Promise.resolve({ error: { message: "new row violates row-level security policy" } });
        for (const row of [].concat(rows)) {
          const i = db[table].findIndex((r) => r.id === row.id);
          if (i < 0) db[table].push(row);
          else if (!opts?.ignoreDuplicates) db[table][i] = row;
        }
        return Promise.resolve({ error: null });
      },
      delete: () => ({
        eq(column, value) {
          calls.push({ table, op: "delete", value });
          db[table] = db[table].filter((r) => r[column] !== value);
          return Promise.resolve({ error: null });
        },
      }),
      then: (resolve) => resolve({ data: db[table], error: null }),
    };
    return api;
  };
  const channel = { on: () => channel, subscribe: () => channel };
  return { from, channel: () => channel, removeChannel: vi.fn(), db, calls };
}

const sampleRow = {
  id: "d1", titulo: "Plano anual", etapa: "neg", motivo_perda: null, valor: "1500.00", prob: 75,
  fechamento: "2026-12-10", resp: "Ana", origem: null, empresa: "ACME", cnpj: null, contato: null, cargo: null,
  email: null, tel: null, cidade: null, atv_tipo: "Ligação", atv_data: "2026-11-30", atv_desc: null,
  updated_at: "2026-11-24T12:00:00Z",
};

describe("mapeamento app ↔ banco", () => {
  it("converte linha do banco em negócio e volta, com vazios virando null", () => {
    const deal = rowToDeal(sampleRow, [
      { id: "l1", deal_id: "d1", text: "Criado", created_at: "2026-11-20T10:00:00Z" },
      { id: "l2", deal_id: "d1", text: "Proposta enviada", created_at: "2026-11-22T10:00:00Z" },
    ]);
    expect(deal).toMatchObject({ titulo: "Plano anual", valor: 1500, prob: 75, origem: "", atvTipo: "Ligação" });
    expect(deal.log.map((l) => l.txt)).toEqual(["Proposta enviada", "Criado"]); // mais recente primeiro
    const row = dealToRow(deal);
    expect(row).toMatchObject({ id: "d1", origem: null, atv_tipo: "Ligação", fechamento: "2026-12-10", valor: 1500 });
    expect(row).not.toHaveProperty("log");
  });
});

describe("repositório Supabase", () => {
  const setup = (opts) => {
    const supabase = mockSupabase(opts);
    const onDeals = vi.fn();
    const onStatus = vi.fn();
    const repo = createSupabaseRepository({ supabase, userId: "u1", onDeals, onStatus });
    return { supabase, repo, onDeals, onStatus, lastDeals: () => onDeals.mock.calls.at(-1)[0] };
  };

  it("carrega negócios com o histórico de cada um", async () => {
    const { repo, lastDeals, onStatus } = setup({ deals: [sampleRow], logs: [{ id: "l1", deal_id: "d1", text: "Criado", created_at: "2026-11-20T10:00:00Z" }] });
    await repo.start();
    expect(lastDeals()).toHaveLength(1);
    expect(lastDeals()[0].log[0].txt).toBe("Criado");
    expect(onStatus).toHaveBeenLastCalledWith("cloud");
  });

  it("salva o negócio e envia o histórico de forma idempotente", async () => {
    const { repo, supabase } = setup();
    await repo.start();
    const deal = normalizeDeal({ id: "d2", titulo: "Novo", etapa: "prosp", valor: 900, log: [logEntry("Negócio criado")] });
    await repo.save(deal);
    await repo.save(deal); // repetir (ex.: "Desfazer") não duplica o histórico
    expect(supabase.db.deals).toHaveLength(1);
    expect(supabase.db.deal_logs).toHaveLength(1);
    const logCall = supabase.calls.find((c) => c.table === "deal_logs");
    expect(logCall.opts).toMatchObject({ onConflict: "id", ignoreDuplicates: true });
  });

  it("desfaz a mudança na tela e explica o erro quando o servidor recusa", async () => {
    const { repo, lastDeals } = setup({ failOn: "deals" });
    await repo.start();
    const deal = normalizeDeal({ id: "d3", titulo: "Recusado" });
    await expect(repo.save(deal)).rejects.toThrow("Sua sessão expirou");
    expect(lastDeals()).toHaveLength(0);
  });

  it("exclui pelo id (o histórico sai junto no banco)", async () => {
    const { repo, supabase, lastDeals } = setup({ deals: [sampleRow] });
    await repo.start();
    await repo.remove("d1");
    expect(supabase.calls.at(-1)).toMatchObject({ table: "deals", op: "delete", value: "d1" });
    expect(lastDeals()).toHaveLength(0);
  });

  it("importa vários negócios de uma vez", async () => {
    const { repo, supabase } = setup();
    await repo.start();
    await repo.saveMany([normalizeDeal({ id: "a", titulo: "A" }), normalizeDeal({ id: "b", titulo: "B" })]);
    expect(supabase.db.deals.map((d) => d.id)).toEqual(["a", "b"]);
  });

  it("encerra a assinatura de tempo real ao trocar de usuário", async () => {
    const { repo, supabase } = setup();
    await repo.start();
    repo.stop();
    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});

describe("mensagens de erro em português", () => {
  it("traduz erros de login", () => {
    expect(describeAuthError({ message: "Invalid login credentials" })).toBe("E-mail ou senha incorretos.");
    expect(describeAuthError({ message: "Email not confirmed" })).toMatch(/Confirme seu e-mail/);
    expect(describeAuthError({ message: "User already registered" })).toMatch(/Já existe uma conta/);
  });
  it("traduz erros do banco", () => {
    expect(describeDbError({ message: "TypeError: Failed to fetch" })).toMatch(/Sem conexão/);
    expect(describeDbError({ message: 'violates check constraint "motivo_obrigatorio"' })).toBe("Informe o motivo da perda.");
  });
});
