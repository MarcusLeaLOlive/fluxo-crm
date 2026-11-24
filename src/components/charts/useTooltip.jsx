import { useCallback, useRef, useState } from "react";

/** Tooltip que segue o ponteiro dentro do contêiner do gráfico. */
export function useTooltip() {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);

  const show = useCallback((event, content) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    setTip({ x: event.clientX - box.left, y: event.clientY - box.top, flip: event.clientX - box.left > box.width * 0.62, content });
  }, []);
  const hide = useCallback(() => setTip(null), []);

  return { ref, tip, show, hide };
}

export function Tooltip({ tip }) {
  if (!tip) return null;
  return (
    <div className={`chart-tooltip ${tip.flip ? "is-flipped" : ""}`} style={{ left: tip.x, top: tip.y }}>
      {tip.content}
    </div>
  );
}
