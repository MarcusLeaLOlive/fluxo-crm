import { useEffect } from "react";
import { LandingNav } from "./LandingNav.jsx";
import { HeroSection } from "./sections/HeroSection.jsx";
import { FeaturesSection } from "./sections/FeaturesSection.jsx";
import { InterfaceSection } from "./sections/InterfaceSection.jsx";
import { TechSection } from "./sections/TechSection.jsx";
import { AboutSection } from "./sections/AboutSection.jsx";
import { CtaSection } from "./sections/CtaSection.jsx";
import { SiteFooter } from "./SiteFooter.jsx";

/** Página de apresentação do portfólio. `anchor` rola até a seção pedida no hash. */
export function Landing({ anchor }) {
  useEffect(() => {
    if (!anchor || anchor === "home") return undefined;
    const frame = requestAnimationFrame(() =>
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
    return () => cancelAnimationFrame(frame);
  }, [anchor]);

  return (
    <div className="landing">
      <div className="page-backdrop" aria-hidden="true" />
      <LandingNav />
      <main id="conteudo" tabIndex={-1}>
        <HeroSection />
        <FeaturesSection />
        <InterfaceSection />
        <TechSection />
        <AboutSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
