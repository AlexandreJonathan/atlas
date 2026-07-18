import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import AsyncStateView from "../../../components/AsyncStateView";
import Button from "../../../components/ui/Button";
import { analytics } from "../../../lib/analytics";
import { triggerMicrointeraction } from "../../../lib/microinteractions";
import CreateInstallmentModal from "../components/CreateInstallmentModal";
import InstallmentPlanCard from "../components/InstallmentPlanCard";
import InstallmentsSummaryCard from "../components/InstallmentsSummaryCard";
import { useInstallments } from "../hooks/useInstallments";
import "../components/InstallmentsPage.css";

function InstallmentsPage() {
  const { views, summary, loading, error, actionError, reload, create, markPaid, remove } =
    useInstallments();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    analytics.track("installments_opened");
  }, []);

  return (
    <div className="atlas-page-shell atlas-installments-page">
      <header className="atlas-installments-header">
        <div>
          <h1>
            <CreditCard size={22} aria-hidden="true" /> Parcelas
          </h1>
          <p>
            Compras parceladas com impacto automático no orçamento e no
            planejamento futuro.
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          aria-label="Registrar nova compra parcelada"
        >
          Nova parcela
        </Button>
      </header>

      <InstallmentsSummaryCard summary={summary} loading={loading && views.length === 0} embedded />

      {actionError ? <p className="atlas-panel-erro-acao">{actionError}</p> : null}

      <AsyncStateView
        loading={loading && views.length === 0}
        error={error}
        isEmpty={views.length === 0}
        emptyMessage={
          <div className="atlas-installments-empty">
            <h2>Nenhuma compra parcelada</h2>
            <p>
              Registre o valor total, número de parcelas e a primeira data. A
              Atlas gera o cronograma e projeta o compromisso mês a mês.
            </p>
            <Button onClick={() => setModalOpen(true)}>Nova parcela</Button>
          </div>
        }
        onRetry={() => void reload()}
        loadingMessage="Carregando parcelas..."
      >
        <div
          className="atlas-installments-list"
          role="list"
          aria-label="Compras parceladas"
        >
          {views.map((view) => (
            <div key={view.plan.id} role="listitem">
              <InstallmentPlanCard
                view={view}
                onMarkNextPaid={(v) => {
                  if (!v.nextPayment) return;
                  void markPaid(v.nextPayment.id, v.plan.id).then(() => {
                    triggerMicrointeraction("success", {
                      message: "Parcela marcada como paga",
                    });
                  });
                }}
                onRemove={(v) => {
                  const ok = window.confirm(
                    `Remover “${v.plan.description}” e todas as parcelas?`,
                  );
                  if (!ok) return;
                  void remove(v.plan.id);
                }}
              />
            </div>
          ))}
        </div>
      </AsyncStateView>

      {modalOpen ? (
        <CreateInstallmentModal
          onClose={() => setModalOpen(false)}
          onSave={async (input) => {
            await create(input);
            triggerMicrointeraction("success", {
              message: "Compra parcelada registrada",
            });
          }}
        />
      ) : null}
    </div>
  );
}

export default InstallmentsPage;
