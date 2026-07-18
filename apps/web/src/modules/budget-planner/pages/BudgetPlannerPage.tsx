import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";
import AsyncStateView from "../../../components/AsyncStateView";
import Button from "../../../components/ui/Button";
import { featureFlagService } from "../../../config";
import { analytics } from "../../../lib/analytics";
import { triggerMicrointeraction } from "../../../lib/microinteractions";
import { budgetCapacityForGoals, monthLabel } from "../utils/budgetMath";
import BudgetCategoryCard from "../components/BudgetCategoryCard";
import BudgetSummaryCard from "../components/BudgetSummaryCard";
import CreateBudgetCategoryModal from "../components/CreateBudgetCategoryModal";
import { useBudgetPlanner } from "../hooks/useBudgetPlanner";
import "../components/BudgetPlannerPage.css";

function BudgetPlannerPage() {
  const {
    year,
    month,
    views,
    summary,
    loading,
    error,
    actionError,
    transactionsLoading,
    reload,
    setCategoryLimit,
    removeCategoryLimit,
  } = useBudgetPlanner();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    analytics.track("budget_planner_opened");
  }, []);

  const capacity = budgetCapacityForGoals(summary);
  const showGoalsBridge = featureFlagService.isEnabled("smartGoals");

  return (
    <div className="atlas-page-shell atlas-budget-page">
      <header className="atlas-budget-header">
        <div>
          <h1>
            <Wallet size={22} aria-hidden="true" /> Orçamento
          </h1>
          <p>
            Limites por categoria em {monthLabel(year, month)}. Despesas
            categorizadas atualizam o uso automaticamente.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} aria-label="Criar novo limite de categoria">
          Novo limite
        </Button>
      </header>

      <BudgetSummaryCard
        summary={summary}
        loading={(loading || transactionsLoading) && views.length === 0}
        embedded
      />

      {showGoalsBridge && summary && summary.categoryCount > 0 ? (
        <p className="atlas-budget-goals-bridge">
          Restante no orçamento:{" "}
          {capacity.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          . Use o saldo livre para avançar suas{" "}
          <Link to="/metas">metas inteligentes</Link>.
        </p>
      ) : null}

      {actionError ? <p className="atlas-panel-erro-acao">{actionError}</p> : null}

      <AsyncStateView
        loading={(loading || transactionsLoading) && views.length === 0}
        error={error}
        isEmpty={views.length === 0}
        emptyMessage={
          <div className="atlas-budget-empty">
            <h2>Nenhum limite ainda</h2>
            <p>
              Defina tetos por categoria (alimentação, transporte, lazer…). As
              despesas do mês passam a alimentar o progresso automaticamente.
            </p>
            <Button onClick={() => setModalOpen(true)}>Novo limite</Button>
          </div>
        }
        onRetry={() => void reload()}
        loadingMessage="Carregando orçamento..."
      >
        <div className="atlas-budget-list" role="list" aria-label="Limites por categoria">
          {views.map((view) => (
            <div key={view.budgetCategoryId} role="listitem">
              <BudgetCategoryCard
                view={view}
                onRemove={(v) => {
                  const ok = window.confirm(
                    `Remover o limite de “${v.category}”?`,
                  );
                  if (!ok) return;
                  void removeCategoryLimit(v.budgetCategoryId);
                }}
              />
            </div>
          ))}
        </div>
      </AsyncStateView>

      {modalOpen ? (
        <CreateBudgetCategoryModal
          usedCategories={views.map((v) => v.category)}
          onClose={() => setModalOpen(false)}
          onSave={async (input) => {
            await setCategoryLimit(input);
            triggerMicrointeraction("success", { message: "Limite salvo" });
          }}
        />
      ) : null}
    </div>
  );
}

export default BudgetPlannerPage;
