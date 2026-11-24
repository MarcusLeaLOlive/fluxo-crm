import { useEffect, useRef, useState } from "react";
import { STAGES, STAGE_BY_KEY, ORIGINS, ACTIVITY_TYPES, LOSS_REASONS } from "../../config/crm.js";
import { formatCurrency, formatTimestamp } from "../../lib/format.js";
import { useDealForm } from "../../hooks/useDealForm.js";
import { useFocusTrap } from "../../hooks/useFocusTrap.js";
import { Field } from "../../components/ui/Field.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";

const FIELD_PROPS = {
  titulo: { label: "Título do negócio", required: true, placeholder: "Ex.: Plano anual com 20 licenças", maxLength: 90 },
  motivoPerda: { label: "Motivo da perda", required: true, options: LOSS_REASONS, emptyOption: "Selecione" },
  valor: { label: "Valor (R$)", type: "number", min: 0, step: 100, inputMode: "decimal", placeholder: "0" },
  prob: { label: "Probabilidade (%)", type: "number", min: 0, max: 100, inputMode: "numeric" },
  fechamento: { label: "Previsão de fechamento", type: "date" },
  resp: { label: "Responsável", list: "responsibles", autoComplete: "off" },
  origem: { label: "Origem do lead", options: ORIGINS, emptyOption: "Não informada" },
  empresa: { label: "Empresa", autoComplete: "organization" },
  cnpj: { label: "CNPJ", placeholder: "00.000.000/0000-00", inputMode: "numeric" },
  contato: { label: "Contato", autoComplete: "name" },
  cargo: { label: "Cargo", autoComplete: "organization-title" },
  email: { label: "E-mail", type: "email", autoComplete: "email", placeholder: "nome@empresa.com.br" },
  tel: { label: "Telefone", type: "tel", autoComplete: "tel", placeholder: "(85) 99999-9999" },
  cidade: { label: "Cidade / UF", placeholder: "Fortaleza / CE" },
  atvTipo: { label: "Tipo", options: ACTIVITY_TYPES, emptyOption: "Nenhuma" },
  atvData: { label: "Data", type: "date" },
  atvDesc: { label: "Descrição", placeholder: "Ex.: Apresentar proposta revisada", maxLength: 140 },
};

function StagePicker({ value, onChange }) {
  const index = STAGES.findIndex((s) => s.key === value);
  const isOn = (stage, i) => (value === "perdido" ? stage.key === "perdido" : value === "ganho" ? i <= 4 : i <= index);

  return (
    <div className="field">
      <span className="field__label" id="stage-label">Etapa</span>
      <div className="stage-picker" role="radiogroup" aria-labelledby="stage-label">
        {STAGES.map((stage, i) => (
          <button
            key={stage.key}
            type="button"
            role="radio"
            aria-checked={stage.key === value}
            aria-label={stage.label}
            className={isOn(stage, i) ? "is-on" : ""}
            style={{ "--stage": stage.color }}
            data-stage={stage.key}
            onClick={() => onChange(stage.key)}
          >
            {i < 4 ? i + 1 : <Icon name={stage.key === "ganho" ? "check" : "close"} size={12} strokeWidth={2.2} />}
          </button>
        ))}
      </div>
      <p className="field__msg">{STAGE_BY_KEY[value].label}</p>
    </div>
  );
}

function DealForm({ deal, overrides, responsibles, onSave, onDelete, onClose, registerCloseGuard }) {
  const form = useDealForm(deal, overrides);
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [summary, setSummary] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [note, setNote] = useState("");
  const formRef = useRef(null);

  const requestClose = () => {
    if (status === "saving") return;
    if (form.isDirty && status !== "saved") setConfirmDiscard(true);
    else onClose();
  };
  registerCloseGuard(requestClose);

  useEffect(() => {
    const target = overrides.etapa === "perdido" ? "f-motivoPerda" : "f-titulo";
    const timer = setTimeout(() => document.getElementById(target)?.focus({ preventScroll: true }), 260);
    return () => clearTimeout(timer);
  }, [overrides.etapa]);

  const field = (name, extra = {}) => (
    <Field
      name={name}
      value={form.values[name]}
      error={form.visibleError(name)}
      valid={form.isValid(name)}
      onChange={(event) => {
        form.setField(name, event.target.value);
        setSummary("");
      }}
      onBlur={() => form.touch(name)}
      {...FIELD_PROPS[name]}
      {...extra}
    />
  );

  const weighted = Number(form.values.valor) ? (Number(form.values.valor) * Number(form.values.prob || 0)) / 100 : null;

  const onSubmit = async (event) => {
    event.preventDefault();
    if (status === "saving") return;
    const invalid = form.validateAll();
    if (invalid.length) {
      setSummary(invalid.length === 1 ? "Corrija o campo destacado." : `Corrija os ${invalid.length} campos destacados.`);
      setTimeout(() => document.getElementById(`f-${invalid[0]}`)?.focus(), 0);
      return;
    }
    setStatus("saving");
    try {
      await onSave(form.buildDeal(), { isNew: form.isNew });
      setStatus("saved");
      setTimeout(onClose, 450);
    } catch {
      setStatus("error");
      setSummary("Não foi possível salvar. Verifique a conexão e tente novamente.");
    }
  };

  const onAddNote = () => {
    if (form.addNote(note)) setNote("");
  };

  return (
    <>
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">{form.isNew ? "Novo registro" : STAGE_BY_KEY[deal.etapa].label}</p>
          <h2 id="panel-title">{form.isNew ? "Novo negócio" : "Editar negócio"}</h2>
        </div>
        <button className="icon-btn" onClick={requestClose} aria-label="Fechar">
          <Icon name="close" size={14} />
        </button>
      </div>

      <form className="panel__body" id="deal-form" ref={formRef} onSubmit={onSubmit} noValidate>
        <fieldset className="form-section">
          <legend className="sr-only">Dados do negócio</legend>
          {field("titulo")}
          <StagePicker value={form.values.etapa} onChange={form.setStage} />
          {form.values.etapa === "perdido" && field("motivoPerda")}
          <div className="form-row cols-3">
            {field("valor")}
            {field("prob", { hint: weighted !== null && !form.visibleError("prob") ? `Ponderado: ${formatCurrency(weighted)}` : undefined })}
            {field("fechamento")}
          </div>
          <div className="form-row cols-2">
            {field("resp")}
            {field("origem")}
          </div>
          <datalist id="responsibles">
            {responsibles.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </fieldset>

        <fieldset className="form-section">
          <legend>Empresa e contato</legend>
          <div className="form-row cols-2">
            {field("empresa")}
            {field("cnpj")}
          </div>
          <div className="form-row cols-2">
            {field("contato")}
            {field("cargo")}
          </div>
          <div className="form-row cols-2">
            {field("email")}
            {field("tel")}
          </div>
          {field("cidade")}
        </fieldset>

        <fieldset className="form-section">
          <legend>Próxima atividade</legend>
          <div className="form-row cols-2">
            {field("atvTipo")}
            {field("atvData")}
          </div>
          {field("atvDesc")}
          <div>
            <Button
              variant="ghost"
              size="sm"
              icon="check"
              disabled={!form.values.atvTipo && !form.values.atvDesc}
              onClick={form.completeActivity}
            >
              Concluir atividade
            </Button>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Histórico</legend>
          <div className="note-input">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddNote();
                }
              }}
              placeholder="Escreva uma nota"
              aria-label="Nova nota"
              maxLength={280}
            />
            <Button variant="ghost" size="sm" onClick={onAddNote} disabled={!note.trim()}>
              Adicionar nota
            </Button>
          </div>
          <ol className="history">
            {form.log.length ? (
              form.log.map((item, i) => (
                <li key={`${item.ts}-${i}`}>
                  {item.txt}
                  <time>{formatTimestamp(item.ts)}</time>
                </li>
              ))
            ) : (
              <li className="history__empty">Nenhum registro ainda.</li>
            )}
          </ol>
        </fieldset>
      </form>

      <div className="panel__foot">
        {confirmDiscard ? (
          <div className="discard-bar" role="alertdialog" aria-label="Descartar alterações">
            <span>Descartar as alterações não salvas?</span>
            <div>
              <Button variant="ghost" onClick={() => setConfirmDiscard(false)} autoFocus>
                Continuar editando
              </Button>
              <Button variant="danger" onClick={onClose}>
                Descartar
              </Button>
            </div>
          </div>
        ) : (
          <div className="panel__actions">
            {!form.isNew && (
              <Button variant="text" className="btn--text-danger" onClick={() => onDelete(deal)}>
                Excluir
              </Button>
            )}
            {summary && (
              <p className="form-summary" role="alert">
                {summary}
              </p>
            )}
            <div className="panel__buttons">
              <Button variant="ghost" onClick={requestClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                form="deal-form"
                loading={status === "saving"}
                icon={status === "saved" ? "check" : undefined}
                className={status === "saved" ? "is-success" : ""}
              >
                {status === "saving" ? "Salvando…" : status === "saved" ? "Salvo" : "Salvar negócio"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Painel lateral. Mantém o conteúdo montado durante a animação de saída
 * e protege contra fechar com alterações não salvas.
 */
export function DealPanel({ session, responsibles, onSave, onDelete, onClose, closeRef }) {
  const panelRef = useRef(null);
  const [rendered, setRendered] = useState(session);
  const guard = useRef(onClose);
  const open = Boolean(session);

  useEffect(() => {
    if (session) setRendered(session);
    else {
      const timer = setTimeout(() => setRendered(null), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [session]);

  useFocusTrap(panelRef, open);
  closeRef.current = () => guard.current();

  return (
    <>
      <div className={`scrim ${open ? "is-open" : ""}`} onClick={() => guard.current()} aria-hidden="true" />
      <div
        ref={panelRef}
        className={`panel glass-panel ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        aria-hidden={!open}
        inert={open ? undefined : ""}
      >
        {rendered && (
          <DealForm
            key={rendered.key}
            deal={rendered.deal}
            overrides={rendered.overrides || {}}
            responsibles={responsibles}
            onSave={onSave}
            onDelete={onDelete}
            onClose={onClose}
            registerCloseGuard={(fn) => (guard.current = fn)}
          />
        )}
      </div>
    </>
  );
}
