import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import ProgressBar from "../../../components/ui/ProgressBar";
import { EXPENSE_CATEGORY_LABELS } from "../../../types/budget";
import type { CategorySpendView } from "../utils/budgetMath";
import "./BudgetCategoryCard.css";

function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const ALERT_LABELS = {
  ok: "Dentro do limite",
  warning: "Perto do limite",
  exceeded: "Limite ultrapassado",
} as const;

type BudgetCategoryCardProps = {
  view: CategorySpendView;
  onRemove: (view: CategorySpendView) => void;
};

function BudgetCategoryCard({ view, onRemove }: BudgetCategoryCardProps) {
  const alertTone =
    view.alert === "exceeded"
      ? "critica"
      : view.alert === "warning"
        ? "atencao"
        : "positiva";

  return (
    <article
      className={`atlas-budget-category-card is-${view.alert}`}
      aria-labelledby={`budget-cat-${view.budgetCategoryId}`}
    >
      <div className="atlas-budget-category-card-top">
        <div>
          <h3 id={`budget-cat-${view.budgetCategoryId}`}>
            {EXPENSE_CATEGORY_LABELS[view.category]}
          </h3>
          <div className="atlas-budget-category-card-meta">
            <Badge tone={alertTone}>{ALERT_LABELS[view.alert]}</Badge>
          </div>
        </div>
        <span
          className="atlas-budget-category-card-pct"
          aria-label={`${view.usedPercent} por cento utilizado`}
        >
          {view.usedPercent}%
        </span>
      </div>

      <ProgressBar
        value={Math.min(1, view.usedRatio)}
        label={`Uso do orçamento de ${EXPENSE_CATEGORY_LABELS[view.category]}`}
      />

      <div className="atlas-budget-category-card-amounts">
        <span>
          Gasto: <strong>{formatMoney(view.spentAmount)}</strong>
        </span>
        <span>
          Limite: <strong>{formatMoney(view.limitAmount)}</strong>
        </span>
        <span>
          Restante: <strong>{formatMoney(view.remainingAmount)}</strong>
        </span>
      </div>

      <div className="atlas-budget-category-card-footer">
        <span className={`atlas-budget-category-card-alert is-${view.alert}`}>
          {ALERT_LABELS[view.alert]}
        </span>
        <Button size="sm" variant="ghost" onClick={() => onRemove(view)}>
          Remover
        </Button>
      </div>
    </article>
  );
}

export default BudgetCategoryCard;
