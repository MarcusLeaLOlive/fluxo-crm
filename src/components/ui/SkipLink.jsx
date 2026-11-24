/**
 * Atalho para pular direto ao conteúdo principal (primeiro item do Tab).
 * Move o foco sem alterar o hash, que é usado pelas rotas.
 */
export function SkipLink({ target = "conteudo" }) {
  return (
    <a
      className="skip-link"
      href={`#${target}`}
      onClick={(event) => {
        event.preventDefault();
        const main = document.getElementById(target);
        main?.focus();
        main?.scrollIntoView({ block: "start" });
      }}
    >
      Pular para o conteúdo
    </a>
  );
}
