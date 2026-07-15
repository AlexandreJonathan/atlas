import { useEffect } from "react";
import type { MouseEvent, ReactNode } from "react";
import "./Modal.css";

type ModalProps = {
  titleId: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

// Shell compartilhado dos 5 modais da aplicação (Transação, Conta, Meta,
// Perfil financeiro, Despesa fixa) — antes desta missão, cada um duplicava
// o overlay/card/`role=dialog`/listener de tecla Escape. Agora só o
// conteúdo do formulário varia por modal.
function Modal({ titleId, title, onClose, children }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleOverlayMouseDown(evento: MouseEvent<HTMLDivElement>) {
    if (evento.target === evento.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="atlas-modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div className="atlas-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 id={titleId} className="atlas-modal-title">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

export default Modal;
