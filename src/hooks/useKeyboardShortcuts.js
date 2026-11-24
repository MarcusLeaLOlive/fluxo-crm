import { useEffect, useRef } from "react";

const isTyping = (el) => el?.closest?.("input, textarea, select, [contenteditable='true']");

/**
 * Registra atalhos de uma tecla. `enabled` desliga todos (ex.: com painel aberto).
 * O mapa pode mudar a cada render sem recriar o listener.
 */
export function useKeyboardShortcuts(map, enabled = true) {
  const mapRef = useRef(map);
  mapRef.current = map;

  useEffect(() => {
    if (!enabled) return undefined;
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const handler = mapRef.current[key];
      if (!handler || event.metaKey || event.ctrlKey || event.altKey) return;
      // Esc funciona mesmo digitando; as demais teclas não.
      if (key !== "escape" && isTyping(event.target)) return;
      event.preventDefault();
      handler();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
