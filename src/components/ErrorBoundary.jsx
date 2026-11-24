import { Component } from "react";
import { reportError } from "../lib/errors.js";

/**
 * Captura erros de renderização e mostra uma tela de recuperação
 * no lugar de uma página em branco.
 */
export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    reportError(error, { source: "renderização", componentStack: info.componentStack });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="crash" role="alert">
        <h1>Algo deu errado</h1>
        <p>Um erro inesperado interrompeu a página. Seus dados salvos não foram afetados.</p>
        <div className="crash__actions">
          <button type="button" className="btn btn--primary btn--md" onClick={() => window.location.reload()}>
            Recarregar a página
          </button>
          <a className="btn btn--ghost btn--md" href="./">Voltar para o início</a>
        </div>
      </main>
    );
  }
}
