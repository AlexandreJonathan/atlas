import { ArrowDownLeft, ArrowUpRight, Receipt, Target } from "lucide-react";
import type { ReactNode } from "react";
import "./QuickActions.css";

export type QuickActionId = "receita" | "despesa" | "conta" | "meta";

type QuickActionsProps = {
  onAction: (id: QuickActionId) => void;
};

const ACOES: { id: QuickActionId; label: string; icon: ReactNode }[] = [
  { id: "receita", label: "Receita", icon: <ArrowUpRight size={24} strokeWidth={2.25} aria-hidden="true" /> },
  { id: "despesa", label: "Despesa", icon: <ArrowDownLeft size={24} strokeWidth={2.25} aria-hidden="true" /> },
  { id: "conta", label: "Conta", icon: <Receipt size={24} strokeWidth={2.25} aria-hidden="true" /> },
  { id: "meta", label: "Meta", icon: <Target size={24} strokeWidth={2.25} aria-hidden="true" /> },
];

function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <section className="atlas-quick-actions" aria-label="Atalhos rápidos">
      {ACOES.map((acao) => (
        <button
          key={acao.id}
          type="button"
          className="atlas-quick-action"
          onClick={() => onAction(acao.id)}
        >
          <span className={`atlas-quick-action-icon atlas-quick-action-icon-${acao.id}`}>{acao.icon}</span>
          <span className="atlas-quick-action-label">{acao.label}</span>
        </button>
      ))}
    </section>
  );
}

export default QuickActions;
