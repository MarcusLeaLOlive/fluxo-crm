import { useEffect, useState } from "react";
import { todayISO } from "../lib/format.js";

/**
 * Data de hoje que se atualiza quando a aba volta a ficar visível,
 * para os alertas de "atrasada" e "hoje" não ficarem desatualizados
 * se a página passar da meia-noite aberta.
 */
export function useToday() {
  const [today, setToday] = useState(todayISO);
  useEffect(() => {
    const refresh = () => setToday(todayISO());
    const timer = setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return today;
}
