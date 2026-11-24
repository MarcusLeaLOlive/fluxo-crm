/**
 * Campo de formulário com rótulo, mensagem de erro/ajuda e estados visuais.
 * Renderiza <input> ou <select> conforme `options`.
 */
export function Field({ name, label, required, error, hint, valid, options, emptyOption, className = "", ...inputProps }) {
  const id = `f-${name}`;
  const messageId = `m-${name}`;
  const message = error || hint;
  const state = error ? "is-invalid" : valid ? "is-valid" : "";

  const common = {
    id,
    name,
    "aria-invalid": Boolean(error),
    "aria-describedby": message ? messageId : undefined,
    "aria-required": required || undefined,
    ...inputProps,
  };

  return (
    <div className={`field ${state} ${className}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="req" aria-hidden="true">*</span>}
      </label>
      {options ? (
        <select {...common}>
          <option value="">{emptyOption}</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input {...common} />
      )}
      {message && (
        <p id={messageId} className={`field__msg ${error ? "is-error" : ""}`}>
          {message}
        </p>
      )}
    </div>
  );
}
