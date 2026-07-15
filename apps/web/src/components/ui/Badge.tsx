import { AlertCircle, AlertTriangle, CheckCircle2, Info, MinusCircle } from "lucide-react";
import type { ReactNode } from "react";
import "./Badge.css";

export type BadgeTone = "critica" | "atencao" | "positiva" | "informativa" | "neutra";

type BadgeProps = {
  tone: BadgeTone;
  children: ReactNode;
};

const ICONS: Record<BadgeTone, ReactNode> = {
  critica: <AlertCircle size={14} aria-hidden="true" />,
  atencao: <AlertTriangle size={14} aria-hidden="true" />,
  positiva: <CheckCircle2 size={14} aria-hidden="true" />,
  informativa: <Info size={14} aria-hidden="true" />,
  neutra: <MinusCircle size={14} aria-hidden="true" />,
};

// Badge genérico do Design System. Severidade é sempre comunicada por
// ícone + texto (nunca só cor), para não depender de percepção de cor —
// ver roadmap/design-system.md.
function Badge({ tone, children }: BadgeProps) {
  return (
    <span className={`atlas-badge atlas-badge-${tone}`}>
      {ICONS[tone]}
      {children}
    </span>
  );
}

export default Badge;
