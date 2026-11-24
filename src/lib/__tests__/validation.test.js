import { describe, it, expect } from "vitest";
import { maskPhone, maskCnpj, isValidCnpj, isValidEmail, validateDeal } from "../validation.js";

describe("máscaras", () => {
  it("formata celular e fixo", () => {
    expect(maskPhone("85999887766")).toBe("(85) 99988-7766");
    expect(maskPhone("8532221100")).toBe("(85) 3222-1100");
  });
  it("formata CNPJ progressivamente", () => {
    expect(maskCnpj("11222333000181")).toBe("11.222.333/0001-81");
    expect(maskCnpj("112")).toBe("11.2");
  });
});

describe("validadores", () => {
  it("aceita CNPJ válido e recusa inválido", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCnpj("11.222.333/0001-80")).toBe(false);
    expect(isValidCnpj("11111111111111")).toBe(false);
  });
  it("valida e-mail", () => {
    expect(isValidEmail("nome@empresa.com.br")).toBe(true);
    expect(isValidEmail("nome@empresa")).toBe(false);
  });
});

describe("validateDeal", () => {
  const base = { titulo: "Plano anual", etapa: "prosp" };
  it("exige título ou empresa", () => {
    expect(validateDeal({ etapa: "prosp" }).titulo).toBeTruthy();
    expect(validateDeal({ etapa: "prosp", empresa: "ACME" }).titulo).toBeUndefined();
  });
  it("exige motivo quando o negócio é perdido", () => {
    expect(validateDeal({ ...base, etapa: "perdido" }).motivoPerda).toBeTruthy();
    expect(validateDeal({ ...base, etapa: "perdido", motivoPerda: "Preço" }).motivoPerda).toBeUndefined();
  });
  it("exige data quando há tipo de atividade", () => {
    expect(validateDeal({ ...base, atvTipo: "Ligação" }).atvData).toBeTruthy();
  });
  it("limita probabilidade a 0–100", () => {
    expect(validateDeal({ ...base, prob: "120" }).prob).toBeTruthy();
    expect(validateDeal({ ...base, prob: "50" }).prob).toBeUndefined();
  });
});

import { passwordStrength, validateAccount } from "../validation.js";

describe("conta", () => {
  it("mede a força da senha", () => {
    expect(passwordStrength("abc").score).toBe(0);
    expect(passwordStrength("abcd1234").score).toBe(2);
    expect(passwordStrength("Abcd1234!xyz").score).toBe(4);
  });
  it("valida cadastro", () => {
    const errors = validateAccount({ name: "A", email: "x", password: "abc", confirm: "abd" }, "register");
    expect(Object.keys(errors).sort()).toEqual(["confirm", "email", "name", "password"]);
    expect(validateAccount({ name: "Ana", email: "a@b.com", password: "senha123", confirm: "senha123" }, "register")).toEqual({});
  });
});

describe("conta: recuperação de senha", () => {
  it("pedir link exige só e-mail; nova senha exige senha forte e confirmação", () => {
    expect(validateAccount({ name: "", email: "a@b.com", password: "", confirm: "" }, "forgot")).toEqual({});
    expect(Object.keys(validateAccount({ name: "", email: "", password: "abc", confirm: "x" }, "recovery")).sort()).toEqual(["confirm", "password"]);
  });
});
