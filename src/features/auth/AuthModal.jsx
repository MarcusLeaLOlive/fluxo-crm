import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { passwordStrength, validateAccount } from "../../lib/validation.js";
import { useFocusTrap } from "../../hooks/useFocusTrap.js";
import { Field } from "../../components/ui/Field.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { BrandMark } from "../../components/ui/Brand.jsx";

const EMPTY = { name: "", email: "", password: "", confirm: "" };
const TABS = [
  { id: "login", label: "Entrar" },
  { id: "register", label: "Criar conta" },
];

/** Campos de cada modo, na ordem em que aparecem. */
const FIELDS_BY_MODE = {
  login: ["email", "password"],
  register: ["name", "email", "password", "confirm"],
  forgot: ["email"],
  recovery: ["password", "confirm"],
};

const COPY = {
  login: { title: "Bem-vindo de volta", text: "Entre para continuar de onde parou.", submit: "Entrar" },
  register: { title: "Crie sua conta", text: "Seu nome aparece como responsável nos novos negócios.", submit: "Criar conta" },
  forgot: { title: "Recuperar senha", text: "Informe seu e-mail e enviaremos um link para criar uma nova senha.", submit: "Enviar link" },
  recovery: { title: "Crie uma nova senha", text: "Escolha a nova senha da sua conta.", submit: "Salvar nova senha" },
};

function PasswordField({ name, label, autoComplete, hint, ...bind }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-field">
      <Field name={name} label={label} type={visible ? "text" : "password"} hint={hint} autoComplete={autoComplete} required {...bind} />
      <button
        type="button"
        className="password-field__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-controls={`f-${name}`}
      >
        <Icon name={visible ? "eyeOff" : "eye"} size={16} />
      </button>
    </div>
  );
}

const Reveal = ({ show, children, id }) => (
  <AnimatePresence initial={false}>
    {show && (
      <motion.div key={id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

/**
 * Janela de conta: entrar, criar conta, recuperar senha e definir nova senha.
 * `cloud` indica contas reais (Supabase); sem ele, contas de demonstração.
 */
export function AuthModal({ open, initialMode = "login", cloud, onClose, onLogin, onRegister, onResetPassword, onUpdatePassword }) {
  const [mode, setMode] = useState(initialMode);
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading
  const [serverError, setServerError] = useState("");
  const [notice, setNotice] = useState(null); // { title, text } após enviar e-mail
  const dialogRef = useRef(null);

  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (!open) return undefined;
    setMode(initialMode);
    setValues(EMPTY);
    setTouched({});
    setServerError("");
    setNotice(null);
    setStatus("idle");
    const first = FIELDS_BY_MODE[initialMode][0];
    const timer = setTimeout(() => document.getElementById(`f-${first}`)?.focus(), 80);
    // Redefinição de senha não pode ser fechada com Esc por engano.
    const onKey = (event) => event.key === "Escape" && initialMode !== "recovery" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, initialMode, onClose]);

  const fields = FIELDS_BY_MODE[mode];
  const errors = validateAccount(values, mode);
  const visibleError = (name) => (touched[name] ? errors[name] : undefined);
  const strength = passwordStrength(values.password);
  const isNewPassword = mode === "register" || mode === "recovery";

  const bind = (name) => ({
    value: values[name],
    error: visibleError(name),
    valid: touched[name] && !errors[name] && values[name] !== "",
    onChange: (event) => {
      setValues((v) => ({ ...v, [name]: event.target.value }));
      setServerError("");
    },
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
  });

  const switchMode = (next) => {
    setMode(next);
    setTouched({});
    setServerError("");
    setTimeout(() => document.getElementById(`f-${FIELDS_BY_MODE[next][0]}`)?.focus(), 60);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setTouched(Object.fromEntries(fields.map((f) => [f, true])));
    const firstInvalid = fields.find((f) => errors[f]);
    if (firstInvalid) {
      document.getElementById(`f-${firstInvalid}`)?.focus();
      return;
    }
    setStatus("loading");
    try {
      if (mode === "login") {
        const { user } = await onLogin(values);
        onClose(user, "login");
      } else if (mode === "register") {
        const { user, needsConfirmation } = await onRegister(values);
        if (needsConfirmation) {
          setNotice({ title: "Confirme seu e-mail", text: `Enviamos um link de confirmação para ${values.email.trim()}. Depois de clicar nele, você já entra na sua conta.` });
          setStatus("idle");
        } else onClose(user, "register");
      } else if (mode === "forgot") {
        await onResetPassword(values.email);
        setNotice({ title: "Verifique seu e-mail", text: `Se existir uma conta com ${values.email.trim()}, você vai receber um link para criar uma nova senha.` });
        setStatus("idle");
      } else {
        await onUpdatePassword(values.password);
        onClose(null, "recovery");
      }
    } catch (error) {
      setServerError(error.message || "Não foi possível concluir. Tente novamente.");
      setStatus("idle");
    }
  };

  const copy = COPY[mode];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => event.target === event.currentTarget && mode !== "recovery" && onClose()}
        >
          <motion.div
            ref={dialogRef}
            className="modal auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          >
            {mode !== "recovery" && (
              <button type="button" className="icon-btn modal__close" onClick={() => onClose()} aria-label="Fechar">
                <Icon name="close" size={14} />
              </button>
            )}

            {notice ? (
              <div className="auth-notice" role="status">
                <span className="auth-notice__icon" aria-hidden="true"><Icon name="check" size={20} strokeWidth={2} /></span>
                <h2 id="auth-title">{notice.title}</h2>
                <p>{notice.text}</p>
                <p className="auth-form__note">Não chegou? Confira a caixa de spam.</p>
                <Button size="lg" className="auth-form__submit" onClick={() => onClose()}>Entendi</Button>
              </div>
            ) : (
              <>
                <div className="auth-modal__head">
                  <BrandMark size={36} />
                  <h2 id="auth-title">{copy.title}</h2>
                  <p>{copy.text}</p>
                </div>

                {(mode === "login" || mode === "register") && (
                  <div className="auth-tabs" role="tablist" aria-label="Tipo de acesso">
                    {/* Indicador deslizante em CSS (um layoutId aqui travava a animação de saída). */}
                    <span className="auth-tabs__indicator" style={{ translate: mode === "register" ? "100% 0" : "0 0" }} aria-hidden="true" />
                    {TABS.map((tab) => (
                      <button key={tab.id} type="button" role="tab" aria-selected={mode === tab.id} className={mode === tab.id ? "is-active" : ""} onClick={() => switchMode(tab.id)}>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <form className="auth-form" onSubmit={onSubmit} noValidate>
                  <Reveal show={mode === "register"} id="name">
                    <Field name="name" label="Nome" autoComplete="name" required {...bind("name")} />
                  </Reveal>

                  {mode !== "recovery" && (
                    <Field name="email" label="E-mail" type="email" autoComplete="email" inputMode="email" required placeholder="nome@empresa.com.br" {...bind("email")} />
                  )}

                  {mode !== "forgot" && (
                    <PasswordField
                      name="password"
                      label={mode === "recovery" ? "Nova senha" : "Senha"}
                      autoComplete={isNewPassword ? "new-password" : "current-password"}
                      hint={isNewPassword && values.password && !visibleError("password") ? `Força: ${strength.label}` : undefined}
                      {...bind("password")}
                    />
                  )}
                  {isNewPassword && values.password && (
                    <div className="strength" aria-hidden="true">
                      {[0, 1, 2, 3].map((i) => <i key={i} className={i < strength.score ? `is-on s${strength.score}` : ""} />)}
                    </div>
                  )}

                  <Reveal show={isNewPassword} id="confirm">
                    <PasswordField name="confirm" label="Confirmar senha" autoComplete="new-password" {...bind("confirm")} />
                  </Reveal>

                  {mode === "login" && cloud && (
                    <button type="button" className="link auth-form__forgot" onClick={() => switchMode("forgot")}>Esqueci minha senha</button>
                  )}

                  {serverError && (
                    <p className="auth-form__error" role="alert">
                      <Icon name="alert" size={14} />
                      {serverError}
                    </p>
                  )}

                  <Button type="submit" size="lg" loading={status === "loading"} className="auth-form__submit">
                    {status === "loading" ? "Aguarde…" : copy.submit}
                  </Button>

                  {mode === "forgot" ? (
                    <p className="auth-form__switch">
                      <button type="button" className="link" onClick={() => switchMode("login")}>Voltar para entrar</button>
                    </p>
                  ) : mode !== "recovery" ? (
                    <p className="auth-form__switch">
                      {mode === "register" ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
                      <button type="button" className="link" onClick={() => switchMode(mode === "register" ? "login" : "register")}>
                        {mode === "register" ? "Entrar" : "Criar conta"}
                      </button>
                    </p>
                  ) : null}

                  <p className="auth-form__note">
                    {cloud
                      ? "Seus negócios ficam salvos com segurança e sincronizados entre dispositivos."
                      : "Conta de demonstração salva só neste navegador. Não use uma senha real."}
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
