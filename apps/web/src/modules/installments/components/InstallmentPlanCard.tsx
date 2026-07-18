import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import ProgressBar from "../../../components/ui/ProgressBar";
import { EXPENSE_CATEGORY_LABELS } from "../../../types/budget";
import type { PlanView } from "../utils/installmentMath";
import "./InstallmentsPage.css";

function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type InstallmentPlanCardProps = {
  view: PlanView;
  onMarkNextPaid: (view: PlanView) => void;
  onRemove: (view: PlanView) => void;
};

function InstallmentPlanCard({
  view,
  onMarkNextPaid,
  onRemove,
}: InstallmentPlanCardProps) {
  const { plan, nextPayment } = view;

  return (
    <article
      className="atlas-installment-card"
      aria-labelledby={`installment-title-${plan.id}`}
    >
      <div className="atlas-installment-card-top">
        <div>
          <h3 id={`installment-title-${plan.id}`}>{plan.description}</h3>
          <div className="atlas-installment-card-meta">
            <Badge tone="neutra">{EXPENSE_CATEGORY_LABELS[plan.category]}</Badge>
            <Badge tone={plan.status === "completed" ? "positiva" : "informativa"}>
              {plan.status === "active"
                ? "Ativa"
                : plan.status === "completed"
                  ? "Concluída"
                  : "Cancelada"}
            </Badge>
            {plan.cardLabel ? <Badge tone="neutra">{plan.cardLabel}</Badge> : null}
          </div>
        </div>
        <span className="tabular-nums" aria-label={`${view.progressPercent} por cento pago`}>
          {view.progressPercent}%
        </span>
      </div>

      <ProgressBar
        value={view.progressRatio}
        label={`Progresso de ${plan.description}`}
      />

      <div className="atlas-installment-card-amounts">
        <span>
          Parcela: <strong>{formatMoney(plan.installmentAmount)}</strong>
        </span>
        <span>
          Restante: <strong>{formatMoney(view.remainingAmount)}</strong>
        </span>
        <span>
          Total: <strong>{formatMoney(plan.totalAmount)}</strong>
        </span>
      </div>

      <div>
        <p className="atlas-installments-summary-note">
          Linha do tempo · {view.paidCount}/{plan.installmentCount} pagas
        </p>
        <ol className="atlas-installment-timeline" aria-label="Parcelas">
          {plan.payments.map((payment) => {
            const isNext = nextPayment?.id === payment.id;
            return (
              <li
                key={payment.id}
                className={`${payment.status === "paid" ? "is-paid" : ""}${isNext ? " is-next" : ""}`}
              >
                <span>
                  {payment.sequence}/{plan.installmentCount} · {payment.dueDate}
                  {isNext ? " · próxima" : ""}
                </span>
                <span>
                  {formatMoney(payment.amount)} ·{" "}
                  {payment.status === "paid"
                    ? "paga"
                    : payment.status === "skipped"
                      ? "pulada"
                      : "pendente"}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="atlas-installment-card-actions">
        {nextPayment && plan.status === "active" ? (
          <Button size="sm" variant="secondary" onClick={() => onMarkNextPaid(view)}>
            Marcar próxima como paga
          </Button>
        ) : null}
        <Button size="sm" variant="ghost" onClick={() => onRemove(view)}>
          Remover
        </Button>
      </div>
    </article>
  );
}

export default InstallmentPlanCard;
