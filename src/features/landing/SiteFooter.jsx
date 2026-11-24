import { SITE } from "../../config/site.js";
import { onlyDigits } from "../../lib/validation.js";
import { Brand } from "../../components/ui/Brand.jsx";
import { Icon } from "../../components/ui/Icon.jsx";

/** Rodapé do portfólio. Contatos e redes só aparecem se configurados em site.js. */
export function SiteFooter() {
  const social = [
    SITE.links.github && { label: "GitHub", url: SITE.links.github },
    SITE.links.linkedin && { label: "LinkedIn", url: SITE.links.linkedin },
    SITE.links.repository && { label: "Repositório", url: SITE.links.repository },
  ].filter(Boolean);
  const hasContact = SITE.email || SITE.whatsapp;

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__about">
          <Brand />
          <p>
            {SITE.product}: {SITE.tagline}. {SITE.role} de {SITE.author}.
          </p>
          {social.length > 0 && (
            <ul className="site-footer__social" aria-label="Redes sociais">
              {social.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                    <Icon name="external" size={11} />
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-labelledby="footer-project">
          <h2 id="footer-project">Projeto</h2>
          <ul>
            <li><a href="#recursos">Recursos</a></li>
            <li><a href="#interface">Interface</a></li>
            <li><a href="#tecnologia">Tecnologia</a></li>
            <li><a href="#sobre">Sobre</a></li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-demo">
          <h2 id="footer-demo">Demonstração</h2>
          <ul>
            <li><a href="#app">Abrir o CRM de demonstração</a></li>
          </ul>
        </nav>
        {hasContact && (
          <address className="site-footer__contact">
            <h2>Contato</h2>
            <ul>
              {SITE.email && <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>}
              {SITE.whatsapp && (
                <li>
                  <a href={`https://wa.me/55${onlyDigits(SITE.whatsapp)}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp {SITE.whatsapp}
                  </a>
                </li>
              )}
            </ul>
          </address>
        )}
      </div>
      <div className="container site-footer__bottom">
        <p>© {new Date().getFullYear()} {SITE.author}. Todos os direitos reservados.</p>
        <p>Versão {SITE.version}</p>
      </div>
    </footer>
  );
}
