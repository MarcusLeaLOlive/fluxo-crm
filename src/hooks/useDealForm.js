import { useMemo, useState } from "react";
import { STAGE_BY_KEY } from "../config/crm.js";
import { createId } from "../lib/format.js";
import { maskCnpj, maskPhone, validateDeal } from "../lib/validation.js";
import { applyStageChange, logEntry } from "../lib/deals.js";

export const FORM_FIELDS = [
  "titulo", "etapa", "motivoPerda", "valor", "prob", "fechamento", "resp", "origem",
  "empresa", "cnpj", "contato", "cargo", "email", "tel", "cidade", "atvTipo", "atvData", "atvDesc",
];

const MASKS = { cnpj: maskCnpj, tel: maskPhone };

const toFormValues = (deal) =>
  Object.fromEntries(FORM_FIELDS.map((name) => [name, deal[name] == null ? "" : String(deal[name])]));

const emptyDeal = () => ({
  id: createId(),
  etapa: "prosp",
  prob: STAGE_BY_KEY.prosp.probability,
  log: [],
  isNew: true,
});

/**
 * Estado e regras do formulário de negócio, sem nenhuma marcação.
 * Mantém valores, campos tocados, histórico e indica se há alterações.
 */
export function useDealForm(deal, overrides = {}) {
  const [base] = useState(() => (deal ? { ...deal } : emptyDeal()));
  // O responsável preenchido automaticamente não conta como alteração do usuário.
  const [initialValues] = useState(() => {
    const initial = toFormValues(base);
    if (base.isNew && overrides.resp && !initial.resp) initial.resp = overrides.resp;
    return initial;
  });
  const [values, setValues] = useState(() => {
    const start = toFormValues(base);
    if (base.isNew && overrides.resp && !start.resp) start.resp = overrides.resp;
    if (overrides.etapa) {
      start.etapa = overrides.etapa;
      start.prob = String(STAGE_BY_KEY[overrides.etapa].probability);
    }
    return start;
  });
  const [log, setLog] = useState(base.log || []);
  const [touched, setTouched] = useState(() => new Set());

  const errors = useMemo(() => validateDeal(values), [values]);
  const isDirty = useMemo(
    () => log.length !== (base.log || []).length || FORM_FIELDS.some((n) => values[n] !== initialValues[n]),
    [values, log, base, initialValues]
  );

  const touch = (...names) => setTouched((prev) => new Set([...prev, ...names]));

  const setField = (name, raw) => {
    const value = MASKS[name] ? MASKS[name](raw) : raw;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const setStage = (key) => {
    setValues((prev) => ({ ...prev, etapa: key, prob: String(STAGE_BY_KEY[key].probability) }));
    touch("etapa");
  };

  const addNote = (text) => {
    const clean = text.trim();
    if (!clean) return false;
    setLog((prev) => [logEntry(clean), ...prev]);
    return true;
  };

  const completeActivity = () => {
    const { atvTipo, atvDesc } = values;
    if (!atvTipo && !atvDesc) return false;
    setLog((prev) => [logEntry(`${atvTipo || "Atividade"} concluída${atvDesc ? `: ${atvDesc}` : ""}`), ...prev]);
    setValues((prev) => ({ ...prev, atvTipo: "", atvData: "", atvDesc: "" }));
    return true;
  };

  /** Erro visível só depois que o campo foi tocado (ou no envio). */
  const visibleError = (name) => (touched.has(name) ? errors[name] : undefined);
  const isValid = (name) => touched.has(name) && !errors[name] && values[name] !== "";

  const validateAll = () => {
    touch(...FORM_FIELDS);
    return FORM_FIELDS.filter((n) => errors[n]);
  };

  const buildDeal = () => {
    const trimmed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]));
    let result = { ...base, ...trimmed, log, etapa: base.isNew ? trimmed.etapa : base.etapa };
    result = applyStageChange(result, trimmed.etapa, { resetProbability: false });
    result.titulo = result.titulo || result.empresa;
    result.valor = Number(trimmed.valor) || 0;
    result.prob = Number(trimmed.prob) || 0;
    if (result.etapa !== "perdido") result.motivoPerda = "";
    if (base.isNew) result.log = [...result.log, logEntry("Negócio criado")];
    delete result.isNew;
    result.updated = Date.now();
    return result;
  };

  return {
    isNew: Boolean(base.isNew),
    values,
    log,
    errors,
    isDirty,
    setField,
    setStage,
    touch,
    visibleError,
    isValid,
    validateAll,
    addNote,
    completeActivity,
    buildDeal,
  };
}
