import { useCallback, useEffect, useRef, useState } from "react";

/** Roteamento simples por hash (#app). Sem dependências externas. */
// No build (pré-renderização) não há window: renderiza a apresentação.
const readRoute = () => (typeof window === "undefined" ? "home" : window.location.hash.replace("#", "") || "home");

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);
  const previous = useRef(route);

  useEffect(() => {
    const onChange = () => {
      const next = readRoute();
      // Só volta ao topo ao trocar de página (apresentação ↔ CRM);
      // âncoras de seção são roladas pela própria apresentação.
      if (previous.current === "app" || next === "app") window.scrollTo({ top: 0, behavior: "instant" });
      previous.current = next;
      setRoute(next);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((to) => {
    window.location.hash = to === "home" ? "" : to;
  }, []);

  return [route, navigate];
}
