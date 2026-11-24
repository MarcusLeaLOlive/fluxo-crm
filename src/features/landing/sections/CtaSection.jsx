import { ButtonLink } from "../../../components/ui/Button.jsx";

export function CtaSection() {
  return (
    <section className="container" aria-labelledby="cta-title">
      <div className="cta">
        <div className="cta__copy">
          <h2 id="cta-title">Experimente com dados de exemplo</h2>
          <p>Carregue dez negócios fictícios e teste o funil, os filtros e os formulários.</p>
        </div>
        <ButtonLink href="#app" variant="light" size="lg" iconRight="arrowRight">Abrir a demonstração do CRM</ButtonLink>
      </div>
    </section>
  );
}
