/* Máscaras e validação dos campos do negócio. */

export const onlyDigits = (value) => String(value ?? "").replace(/\D/g, "");

export function maskPhone(value) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskCnpj(value) {
  const d = onlyDigits(value).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function isValidCnpj(value) {
  const d = onlyDigits(value);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const checkDigit = (base) => {
    const weights = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = [...base].reduce((acc, n, i) => acc + Number(n) * weights[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const first = checkDigit(d.slice(0, 12));
  const second = checkDigit(d.slice(0, 12) + first);
  return d.endsWith(`${first}${second}`);
}

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
export const isValidPhone = (value) => [10, 11].includes(onlyDigits(value).length);

/**
 * Regras por campo. Cada regra recebe (valor, todosOsValores) e devolve
 * a mensagem de erro, ou "" quando o campo está válido.
 */
const RULES = {
  titulo: (v, all) => (!v && !all.empresa ? "Informe o título do negócio ou o nome da empresa." : ""),
  valor: (v) => (v !== "" && (Number.isNaN(Number(v)) || Number(v) < 0) ? "O valor deve ser zero ou maior." : ""),
  prob: (v) =>
    v !== "" && (!Number.isInteger(Number(v)) || Number(v) < 0 || Number(v) > 100)
      ? "Use um número inteiro de 0 a 100."
      : "",
  motivoPerda: (v, all) => (all.etapa === "perdido" && !v ? "Escolha o motivo da perda." : ""),
  cnpj: (v) => (v && !isValidCnpj(v) ? "CNPJ inválido. Confira os 14 dígitos." : ""),
  email: (v) => (v && !isValidEmail(v) ? "Digite um e-mail válido, como nome@empresa.com.br." : ""),
  tel: (v) => (v && !isValidPhone(v) ? "Digite o telefone com DDD, como (85) 99999-9999." : ""),
  atvData: (v, all) => (all.atvTipo && !v ? "Escolha a data da atividade." : ""),
  atvTipo: (v, all) => (!v && (all.atvData || all.atvDesc) ? "Escolha o tipo da atividade." : ""),
};

/** Campos cuja validação depende de outro campo. */
export const DEPENDENT_FIELDS = {
  empresa: ["titulo"],
  etapa: ["motivoPerda"],
  atvTipo: ["atvData"],
  atvData: ["atvTipo"],
  atvDesc: ["atvTipo"],
};

export function validateDeal(values) {
  const errors = {};
  for (const [field, rule] of Object.entries(RULES)) {
    const message = rule(values[field] ?? "", values);
    if (message) errors[field] = message;
  }
  return errors;
}

/* ---------- Conta (login e cadastro) ---------- */

/** Força da senha de 0 a 4, com rótulo para exibir. */
export function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/i.test(password) && /\d/.test(password)) score += 1;
  if (/[^a-z0-9]/i.test(password) || (/[a-z]/.test(password) && /[A-Z]/.test(password))) score += 1;
  const labels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
  return { score, label: labels[score] };
}

/** mode: "login" | "register" | "forgot" (pedir link) | "recovery" (definir nova senha) */
export function validateAccount(values, mode) {
  const errors = {};
  if (mode === "register" && values.name.trim().length < 2) errors.name = "Informe seu nome.";
  if (mode !== "recovery" && !isValidEmail(values.email.trim())) errors.email = "Digite um e-mail válido, como nome@empresa.com.br.";
  if (mode === "forgot") return errors;
  if (mode === "register" || mode === "recovery") {
    if (values.password.length < 8 || !/[a-z]/i.test(values.password) || !/\d/.test(values.password)) {
      errors.password = "Use pelo menos 8 caracteres, com letras e números.";
    }
    if (values.confirm !== values.password) errors.confirm = "As senhas não coincidem.";
  } else if (!values.password) {
    errors.password = "Digite sua senha.";
  }
  return errors;
}
