import { useEffect } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Mantém o foco dentro de um diálogo enquanto ele está aberto
 * e devolve o foco ao elemento que o abriu ao fechar.
 */
export function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const container = ref.current;
    const opener = document.activeElement;

    const onKeyDown = (event) => {
      if (event.key !== "Tab") return;
      const items = [...container.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("keydown", onKeyDown);
      // Devolve o foco a quem abriu; se esse elemento sumiu (ex.: cartão que mudou de coluna),
      // foca o conteúdo principal para o teclado não ficar "preso" num elemento inerte.
      if (opener && typeof opener.focus === "function" && document.contains(opener) && !opener.closest("[inert]")) opener.focus();
      else document.getElementById("conteudo")?.focus({ preventScroll: true });
    };
  }, [ref, active]);
}
