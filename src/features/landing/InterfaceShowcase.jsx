import { useEffect, useRef, useState } from "react";
import { Icon } from "../../components/ui/Icon.jsx";

/**
 * Vitrine em bento grid com as seis técnicas da linguagem visual do projeto.
 * Cada demonstração é pequena, real e feita em CSS puro.
 */

function RevealDemo() {
  const [run, setRun] = useState(0);
  const ref = useRef(null);

  // Toca a animação pela primeira vez quando o card aparece na tela.
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setRun(1);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun((n) => n || 1);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bento-demo__stage stage--dark" ref={ref}>
      <div className={`demo__stage ${run ? "is-playing" : ""}`} key={run} aria-hidden="true">
        <span className="demo-row" style={{ "--i": 0 }}><i />Proposta enviada<b>R$ 7.500</b></span>
        <span className="demo-row" style={{ "--i": 1 }}><i />Negociação<b>R$ 18.900</b></span>
        <span className="demo-row" style={{ "--i": 2 }}><i />Ganho<b>R$ 14.200</b></span>
      </div>
      <button type="button" className="demo__replay" onClick={() => setRun((n) => n + 1)} aria-label="Repetir a animação de entrada">
        <Icon name="arrowLeft" size={12} />
        Repetir
      </button>
    </div>
  );
}

const DEMOS = [
  {
    title: "Bento grid",
    caption: "Blocos de tamanhos diferentes organizam a hierarquia",
    size: "wide",
    stage: (
      <div className="bento-demo__stage stage--soft" aria-hidden="true">
        <div className="demo-bento"><i /><i /><i /><i /></div>
      </div>
    ),
  },
  {
    title: "Glassmorphism leve",
    caption: "Vidro só onde há algo atrás para desfocar",
    size: "tall",
    stage: (
      <div className="bento-demo__stage stage--mesh" aria-hidden="true">
        <div className="demo-glass glass">
          <small>Previsão ponderada</small>
          <strong>R$ 37,3 mil</strong>
        </div>
      </div>
    ),
  },
  {
    title: "Gradient mesh",
    caption: "Luzes suaves no lugar de fundos chapados",
    stage: (
      <div className="bento-demo__stage stage--deep" aria-hidden="true">
        <span>Fundo em malha de gradientes</span>
      </div>
    ),
  },
  {
    title: "Hover lift",
    caption: "Elevação curta confirma o que é clicável",
    stage: (
      <div className="bento-demo__stage stage--soft" aria-hidden="true">
        <div className="demo-lift">
          <strong>Passe o mouse ou toque</strong>
          <small>O card sobe 6px e ganha sombra</small>
        </div>
      </div>
    ),
  },
  {
    title: "Scroll reveal",
    caption: "Conteúdo entra conforme aparece na tela",
    stage: <RevealDemo />,
  },
  {
    title: "Tipografia fluida",
    caption: "Tamanhos com clamp() entre o celular e o desktop",
    size: "wide",
    stage: (
      <div className="bento-demo__stage stage--type" aria-hidden="true">
        <div className="demo-type">
          <strong>Funil de vendas claro</strong>
          <span>O título cresce e diminui com a largura do card, sem saltos entre breakpoints.</span>
          <code>font-size: clamp(22px, 9cqi, 46px)</code>
        </div>
      </div>
    ),
  },
];

export function InterfaceShowcase() {
  return (
    <div className="bento">
      {DEMOS.map(({ title, caption, size, stage }) => (
        <figure className={`bento-demo ${size ? `bento-demo--${size}` : ""}`} key={title}>
          {stage}
          <figcaption>
            <strong>{title}</strong>
            <span>{caption}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
