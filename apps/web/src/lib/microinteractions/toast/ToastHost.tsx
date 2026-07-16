import { useEffect, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { dismissToast, subscribeToasts, type ToastItem } from "./toastStore";
import "./ToastHost.css";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
} as const;

/**
 * Host global de toasts — montar uma vez no AppShell.
 * Estado local sincronizado via store (sem Context).
 */
function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div className="atlas-mi-toasts" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.tone];
        return (
          <div
            key={toast.id}
            className={`atlas-mi-toast atlas-mi-toast-${toast.tone}`}
            role="status"
          >
            <span className="atlas-mi-toast-icon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <div className="atlas-mi-toast-body">
              {toast.title && <strong>{toast.title}</strong>}
              <p>{toast.message}</p>
            </div>
            <button
              type="button"
              className="atlas-mi-toast-close"
              aria-label="Fechar notificação"
              onClick={() => dismissToast(toast.id)}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastHost;
