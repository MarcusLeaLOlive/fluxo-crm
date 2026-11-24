import { useTheme } from "../../hooks/useTheme.js";
import { Icon } from "./Icon.jsx";

/** Alterna entre tema claro e escuro; a escolha fica salva. */
export function ThemeToggle({ className = "" }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  const label = dark ? "Ativar tema claro" : "Ativar tema escuro";
  return (
    <button type="button" className={`theme-toggle ${className}`} onClick={toggle} aria-label={label} title={label}>
      <Icon name={dark ? "sun" : "moon"} size={16} />
    </button>
  );
}
