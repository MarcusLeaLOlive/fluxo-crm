import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "fluxo-theme";
const COLORS = { light: "#F7F8FA", dark: "#070C11" };
const systemQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

function readSaved() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme, animate) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add("theme-transition");
    setTimeout(() => root.classList.remove("theme-transition"), 350);
  }
  root.classList.toggle("theme-dark", theme === "dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = COLORS[theme];
}

/**
 * Tema claro/escuro. Sem preferência salva, acompanha o sistema;
 * ao alternar, a escolha fica salva no navegador.
 */
export function useTheme() {
  // Começa em "light" para o HTML pré-renderizado e o cliente coincidirem;
  // o tema real (já aplicado no <html> pelo script do index.html) é lido após montar.
  const [theme, setTheme] = useState("light");
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("theme-dark") ? "dark" : "light");
    setHasSaved(Boolean(readSaved()));
  }, []);

  useEffect(() => {
    if (hasSaved) return undefined;
    const query = systemQuery();
    const onChange = (event) => {
      const next = event.matches ? "dark" : "light";
      setTheme(next);
      applyTheme(next, true);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [hasSaved]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next, true);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* sem armazenamento: vale só nesta visita */
      }
      return next;
    });
    setHasSaved(true);
  }, []);

  return { theme, toggle };
}
