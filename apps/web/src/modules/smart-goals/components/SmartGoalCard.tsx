import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import ProgressBar from "../../../components/ui/ProgressBar";
import type { Goal } from "../../../types/goal";
import { GOAL_CATEGORY_LABELS, GOAL_STATUS_LABELS } from "../../../types/goal";
import {
  goalProgressPercent,
  goalProgressRatio,
  remainingTime,
} from "../utils/goalMath";
import "./SmartGoalCard.css";

function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type SmartGoalCardProps = {
  goal: Goal;
  onContribute: (goal: Goal) => void;
  onRemove: (goal: Goal) => void;
};

function SmartGoalCard({ goal, onContribute, onRemove }: SmartGoalCardProps) {
  const pct = goalProgressPercent(goal);
  const time = remainingTime(goal);
  const statusTone =
    goal.status === "completed"
      ? "positiva"
      : goal.status === "paused"
        ? "atencao"
        : goal.status === "cancelled"
          ? "critica"
          : "informativa";

  return (
    <article className="atlas-smart-goal-card" aria-labelledby={`goal-title-${goal.id}`}>
      <div className="atlas-smart-goal-card-top">
        <div>
          <h3 id={`goal-title-${goal.id}`}>{goal.title}</h3>
          <div className="atlas-smart-goal-card-meta">
            <Badge tone="neutra">{GOAL_CATEGORY_LABELS[goal.category]}</Badge>
            <Badge tone={statusTone}>{GOAL_STATUS_LABELS[goal.status]}</Badge>
          </div>
        </div>
        <span className="tabular-nums" aria-label={`${pct} por cento concluído`}>
          {pct}%
        </span>
      </div>

      {goal.description ? (
        <p className="atlas-smart-goal-card-desc">{goal.description}</p>
      ) : null}

      <ProgressBar value={goalProgressRatio(goal)} label={`Progresso de ${goal.title}`} />

      <div className="atlas-smart-goal-card-amounts">
        <span>
          Atual: <strong>{formatMoney(goal.currentAmount)}</strong>
        </span>
        <span>
          Alvo: <strong>{formatMoney(goal.targetAmount)}</strong>
        </span>
      </div>

      <div className="atlas-smart-goal-card-footer">
        <span className={`atlas-smart-goal-card-time${time.overdue ? " is-overdue" : ""}`}>
          {time.label}
        </span>
        <div className="atlas-smart-goal-card-actions">
          {goal.status === "active" ? (
            <Button size="sm" variant="secondary" onClick={() => onContribute(goal)}>
              Aportar
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" onClick={() => onRemove(goal)}>
            Remover
          </Button>
        </div>
      </div>
    </article>
  );
}

export default SmartGoalCard;
