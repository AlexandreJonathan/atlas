import type { ReactNode } from "react";
import "./StatCard.css";

type StatCardTone = "brand" | "success" | "warning" | "danger" | "info";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: StatCardTone;
  hint?: string;
  className?: string;
};

// Card de métrica premium do Dashboard 2.0 — substitui os 4 cards simples
// (título + valor) usados antes desta missão. Ver roadmap/design-system.md.
function StatCard({ icon, label, value, tone = "brand", hint, className }: StatCardProps) {
  return (
    <div className={`atlas-stat-card${className ? ` ${className}` : ""}`}>
      <span className={`atlas-stat-card-icon atlas-stat-card-icon-${tone}`} aria-hidden="true">
        {icon}
      </span>
      <div className="atlas-stat-card-body">
        <span className="atlas-stat-card-label">{label}</span>
        <span className={`atlas-stat-card-value tabular-nums atlas-stat-card-value-${tone}`}>{value}</span>
        {hint && <span className="atlas-stat-card-hint">{hint}</span>}
      </div>
    </div>
  );
}

export default StatCard;
