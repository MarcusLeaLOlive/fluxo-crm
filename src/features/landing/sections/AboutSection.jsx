import { SITE } from "../../../config/site.js";
import { initials } from "../../../lib/format.js";
import { Icon } from "../../../components/ui/Icon.jsx";
import { Section } from "../Section.jsx";

export function AboutSection() {
  const links = [
    SITE.links.repository && { label: "Código-fonte no GitHub", url: SITE.links.repository },
    SITE.links.github && { label: "Perfil no GitHub", url: SITE.links.github },
    SITE.links.linkedin && { label: "Perfil no LinkedIn", url: SITE.links.linkedin },
  ].filter(Boolean);

  return (
    <Section id="sobre">
      <article className="card about">
        <span className="about__avatar" aria-hidden="true">{initials(SITE.author)}</span>
        <div className="about__body">
          <h2 id="sobre-title">{SITE.author}</h2>
          <p className="about__role">Desenvolvimento, design e testes</p>
          <p>{SITE.bio}</p>
          {links.length > 0 && (
            <ul className="about__links">
              {links.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                    <Icon name="external" size={12} />
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </Section>
  );
}
