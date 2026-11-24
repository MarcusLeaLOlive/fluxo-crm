import { useEffect, useState } from "react";
import { Brand } from "../../components/ui/Brand.jsx";
import { ButtonLink } from "../../components/ui/Button.jsx";
import { ThemeToggle } from "../../components/ui/ThemeToggle.jsx";
import { useActiveSection } from "../../hooks/useActiveSection.js";
import { NAV_ITEMS } from "./content.js";

/** Cabeçalho da apresentação: marca, navegação por seções e menu móvel. */
export function LandingNav() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(NAV_ITEMS.map((item) => item.id));

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`landing-nav glass ${open ? "is-open" : ""}`}>
      <div className="container landing-nav__inner">
        <Brand />
        <nav id="landing-menu" className="landing-nav__menu" aria-label="Seções da página">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={active === item.id ? "true" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <ThemeToggle className="landing-nav__theme" />
        <ButtonLink href="#app" size="sm" iconRight="arrowRight" className="landing-nav__cta">
          Abrir demonstração
        </ButtonLink>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="landing-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
