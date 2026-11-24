/**
 * Entrada de pré-renderização (executada no build, em Node).
 * Gera o HTML da apresentação para que buscadores e agentes de IA
 * recebam o conteúdo completo, mesmo sem executar JavaScript.
 */
import { renderToString } from "react-dom/server";
import App from "./App.jsx";

export function render() {
  return renderToString(<App />);
}
