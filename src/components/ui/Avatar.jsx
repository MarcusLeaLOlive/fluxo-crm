import { colorFromString, initials } from "../../lib/format.js";

export function Avatar({ name, size = 24 }) {
  return (
    <span
      className="avatar"
      style={{ "--avatar": colorFromString(name), width: size, height: size }}
      role="img"
      title={name || "Sem responsável"}
      aria-label={name ? `Responsável: ${name}` : "Sem responsável"}
    >
      {initials(name)}
    </span>
  );
}
