/**
 * Seção padrão da apresentação: <section> rotulada pelo próprio título,
 * com cabeçalho opcional (título + introdução) e conteúdo livre.
 */
export function Section({ id, title, intro, className = "", headClassName = "section__head", children }) {
  const titleId = `${id}-title`;
  return (
    <section className={`section container ${className}`} id={id} aria-labelledby={titleId}>
      {title && (
        <header className={headClassName}>
          <h2 id={titleId}>{title}</h2>
          {intro && <p>{intro}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
