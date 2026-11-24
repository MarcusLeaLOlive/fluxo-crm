import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "./Icon.jsx";

const ToastContext = createContext(() => {});
const ICONS = { success: "check", error: "alert", info: null };

/**
 * Disponibiliza `toast(mensagem, { type, actionLabel, onAction, duration })`.
 * type: "success" | "error" | "info" (padrão). Erros ficam mais tempo na tela.
 */
export function ToastProvider({ children }) {
  const [current, setCurrent] = useState(null);
  const timer = useRef();

  const dismiss = useCallback(() => setCurrent(null), []);

  const toast = useCallback(
    (message, { type = "info", actionLabel, onAction, duration } = {}) => {
      clearTimeout(timer.current);
      setCurrent({ id: Date.now(), message, type, actionLabel, onAction });
      timer.current = setTimeout(dismiss, duration ?? (actionLabel ? 6000 : type === "error" ? 5000 : 2600));
    },
    [dismiss]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        <AnimatePresence>
          {current && (
            <motion.div
              key={current.id}
              className={`toast toast--${current.type} glass-dark`}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 480, damping: 34 }}
            >
              {ICONS[current.type] && (
                <span className="toast__icon" aria-hidden="true">
                  <Icon name={ICONS[current.type]} size={13} strokeWidth={2} />
                </span>
              )}
              <span>{current.message}</span>
              {current.actionLabel && (
                <button
                  type="button"
                  onClick={() => {
                    current.onAction?.();
                    dismiss();
                  }}
                >
                  {current.actionLabel}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
