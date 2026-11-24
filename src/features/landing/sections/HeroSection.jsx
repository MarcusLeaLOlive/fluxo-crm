import { useEffect, useMemo, useState } from "react";
import { SITE } from "../../../config/site.js";
import { STAGES } from "../../../config/crm.js";
import { createSampleDeals } from "../../../lib/samples.js";
import { computeMetrics } from "../../../lib/deals.js";
import { formatCurrency, formatCurrencyShort } from "../../../lib/format.js";
import { ButtonLink } from "../../../components/ui/Button.jsx";
import { Icon } from "../../../components/ui/Icon.jsx";
import { Board } from "../../crm/Board.jsx";

/**
 * Ilustração do produto montada com os componentes reais.
 * É decorativa: fica oculta para leitores de tela e fora da ordem de foco (inert).
 */
function HeroPreview() {
  // Renderizada só no navegador: depende da data de hoje e é decorativa.
  // No HTML pré-renderizado fica uma moldura do mesmo tamanho (sem salto de layout).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const deals = useMemo(() => (mounted ? createSampleDeals() : []), [mounted]);
  const metrics = useMemo(() => computeMetrics(deals), [deals]);

  if (!mounted) {
    return (
      <div className="hero-preview" aria-hidden="true">
        <div className="hero-preview__glow" />
        <div className="preview-window preview-window--placeholder" />
      </div>
    );
  }

  return (
    <div className="hero-preview" aria-hidden="true" inert="">
      <div className="hero-preview__glow" />
      <div className="preview-window">
        <div className="preview-window__bar">
          <span /><span /><span />
          <p>Funil de vendas</p>
        </div>
        <div className="preview-window__body">
          <dl className="preview-metrics">
            <div><dt>Em aberto</dt><dd>{formatCurrencyShort(metrics.openValue)}</dd></div>
            <div><dt>Previsão</dt><dd>{formatCurrencyShort(metrics.weightedValue)}</dd></div>
            <div><dt>Conversão</dt><dd>{metrics.conversion}%</dd></div>
          </dl>
          <Board deals={deals} stages={STAGES.slice(1, 4)} preview />
        </div>
      </div>
      <div className="float-card float-card--meeting glass">
        <i className="dot dot--today" />
        <p><strong>Reunião hoje</strong><small>Construtora Litoral Norte</small></p>
      </div>
      <div className="float-card float-card--forecast glass">
        <Icon name="chart" size={14} strokeWidth={2} />
        <p><strong>{formatCurrencyShort(metrics.weightedValue)}</strong><small>Previsão ponderada</small></p>
      </div>
      <div className="float-card float-card--won glass">
        <Icon name="check" size={14} strokeWidth={2} />
        <p><strong>Negócio ganho</strong><small>Distribuidora Cariri, {formatCurrency(14200)}</small></p>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero__copy">
        <p className="pill">
          <i className="dot dot--today" aria-hidden="true" />
          {SITE.role} em React
        </p>
        <h1 id="hero-title">Funil de vendas claro, do primeiro contato ao contrato.</h1>
        <p className="hero__lead">
          {SITE.product} é um CRM para pequenas equipes comerciais: negócios, contatos, atividades e previsão de receita
          em uma interface rápida e acessível.
        </p>
        <div className="hero__actions">
          <ButtonLink href="#app" size="lg" iconRight="arrowRight">Abrir demonstração</ButtonLink>
          {SITE.links.repository ? (
            <ButtonLink href={SITE.links.repository} variant="ghost" size="lg" icon="code" target="_blank" rel="noopener noreferrer">
              Ver código no GitHub
            </ButtonLink>
          ) : (
            <ButtonLink href="#tecnologia" variant="ghost" size="lg" icon="code">Como foi feito</ButtonLink>
          )}
        </div>
        <p className="hero__note">Inclui dados de exemplo. Nada é enviado para servidores externos.</p>
      </div>
      <HeroPreview />
    </section>
  );
}
