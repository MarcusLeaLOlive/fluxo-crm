/**
 * Tratamento global de erros inesperados.
 * - Registra no console com contexto (ponto único para plugar um serviço como Sentry).
 * - Avisa a interface por um evento, para exibir uma mensagem amigável.
 */
export const APP_ERROR_EVENT = "fluxo:error";

export function reportError(error, context = {}) {
  console.error("[Fluxo]", context.source || "erro", error, context);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(APP_ERROR_EVENT, { detail: { error, context } }));
  }
}

let installed = false;
export function installGlobalErrorHandlers() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (event) => {
    // Falhas de carregamento de recursos externos (ex.: fonte) não interrompem o app.
    if (!event.error) return;
    reportError(event.error, { source: "window.error" });
  });
  window.addEventListener("unhandledrejection", (event) => {
    reportError(event.reason, { source: "promessa não tratada" });
  });
}
