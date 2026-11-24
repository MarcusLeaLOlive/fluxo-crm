import { Icon } from "../../../components/ui/Icon.jsx";
import { Section } from "../Section.jsx";
import { CodeShowcase } from "../CodeShowcase.jsx";
import { PRACTICES, STACK } from "../content.js";

export function TechSection() {
  return (
    <Section id="tecnologia" className="tech">
      <div className="tech__copy">
        <h2 id="tecnologia-title">Como foi construído</h2>
        <p>
          Uma aplicação React organizada por funcionalidade, sem bibliotecas de interface: cada componente, hook e estilo
          foi escrito à mão.
        </p>
        <ul className="checklist">
          {PRACTICES.map((practice) => (
            <li key={practice}>
              <Icon name="check" size={14} strokeWidth={2} />
              {practice}
            </li>
          ))}
        </ul>
        <h3 className="sr-only">Tecnologias utilizadas</h3>
        <ul className="stack">
          {STACK.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
      <CodeShowcase />
    </Section>
  );
}
