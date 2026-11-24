import { Icon } from "./Icon.jsx";

/**
 * Botão base. Variantes: primary | ghost | danger | text | subtle.
 * `loading` mostra o indicador e bloqueia cliques repetidos.
 */
export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading = false,
  className = "",
  children,
  type = "button",
  ...props
}) {
  const classes = ["btn", `btn--${variant}`, `btn--${size}`, loading && "is-loading", className].filter(Boolean).join(" ");
  return (
    <button type={type} className={classes} disabled={loading || props.disabled} aria-busy={loading || undefined} {...props}>
      {loading ? <span className="spinner" aria-hidden="true" /> : icon && <Icon name={icon} size={14} />}
      {children && <span className="btn__label">{children}</span>}
      {iconRight && <Icon name={iconRight} size={14} />}
    </button>
  );
}

/** Link com aparência de botão (para navegação). */
export function ButtonLink({ variant = "primary", size = "md", icon, iconRight, className = "", children, ...props }) {
  return (
    <a className={`btn btn--${variant} btn--${size} ${className}`} {...props}>
      {icon && <Icon name={icon} size={14} />}
      <span className="btn__label">{children}</span>
      {iconRight && <Icon name={iconRight} size={14} />}
    </a>
  );
}
