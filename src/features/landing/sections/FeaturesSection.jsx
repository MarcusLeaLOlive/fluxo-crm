import { Icon } from "../../../components/ui/Icon.jsx";
import { Section } from "../Section.jsx";
import { FEATURES } from "../content.js";

export function FeaturesSection() {
  return (
    <Section
      id="recursos"
      title="Tudo que uma equipe comercial precisa no dia a dia"
      intro="Funcionalidades pensadas a partir de CRMs reais, com foco no que é usado todo dia."
    >
      <ul className="features" role="list">
        {FEATURES.map((feature) => (
          <li className="card feature glass-card" key={feature.title}>
            <span className="feature__icon" aria-hidden="true"><Icon name={feature.icon} size={18} /></span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
