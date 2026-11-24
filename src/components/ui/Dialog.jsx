import { useEffect, useRef } from "react";
import { Icon } from "./Icon.jsx";

/** Diálogo modal usando o elemento nativo <dialog> (foco e Esc já acessíveis). */
export function Dialog({ open, title, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
    >
      <div className="dialog__head">
        <h2 id="dialog-title">{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Fechar">
          <Icon name="close" size={14} />
        </button>
      </div>
      <div className="dialog__body">{children}</div>
    </dialog>
  );
}
