import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import AsyncStateView from "../../../components/AsyncStateView";
import Button from "../../../components/ui/Button";
import { analytics } from "../../../lib/analytics";
import { triggerMicrointeraction } from "../../../lib/microinteractions";
import type { Goal } from "../../../types/goal";
import CreateSmartGoalModal from "../components/CreateSmartGoalModal";
import SmartGoalCard from "../components/SmartGoalCard";
import SmartGoalsSummaryCard from "../components/SmartGoalsSummaryCard";
import { useSmartGoals } from "../hooks/useSmartGoals";
import "../components/SmartGoalsPage.css";

function SmartGoalsPage() {
  const { goals, summary, loading, error, actionError, reload, create, contribute, remove } =
    useSmartGoals();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    analytics.track("smart_goals_opened");
  }, []);

  async function handleContribute(goal: Goal) {
    const raw = window.prompt(`Valor do aporte para “${goal.title}”`, "100");
    if (raw == null) return;
    const amount = Number(raw.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) return;
    await contribute(goal.id, amount);
    triggerMicrointeraction("success", { message: "Aporte registrado" });
  }

  async function handleRemove(goal: Goal) {
    const ok = window.confirm(`Remover a meta “${goal.title}”?`);
    if (!ok) return;
    await remove(goal.id);
  }

  return (
    <div className="atlas-page-shell atlas-smart-goals-page">
      <header className="atlas-smart-goals-header">
        <div>
          <h1>
            <Target size={22} aria-hidden="true" /> Metas inteligentes
          </h1>
          <p>Acompanhe objetivos financeiros e o progresso de cada um.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} aria-label="Criar nova meta">
          Nova Meta
        </Button>
      </header>

      <SmartGoalsSummaryCard summary={summary} loading={loading && goals.length === 0} />

      {actionError ? <p className="atlas-panel-erro-acao">{actionError}</p> : null}

      <AsyncStateView
        loading={loading && goals.length === 0}
        error={error}
        isEmpty={goals.length === 0}
        emptyMessage={
          <div className="atlas-smart-goals-empty">
            <h2>Nenhuma meta ainda</h2>
            <p>Crie a primeira meta com valor alvo, prazo e categoria.</p>
            <Button onClick={() => setModalOpen(true)}>Nova Meta</Button>
          </div>
        }
        onRetry={() => void reload()}
        loadingMessage="Carregando metas..."
      >
        <div className="atlas-smart-goals-list" role="list" aria-label="Lista de metas">
          {goals.map((goal) => (
            <div key={goal.id} role="listitem">
              <SmartGoalCard
                goal={goal}
                onContribute={(g) => void handleContribute(g)}
                onRemove={(g) => void handleRemove(g)}
              />
            </div>
          ))}
        </div>
      </AsyncStateView>

      {modalOpen ? (
        <CreateSmartGoalModal
          onClose={() => setModalOpen(false)}
          onSave={async (input) => {
            await create(input);
            triggerMicrointeraction("celebration", {
              message: "Meta criada",
              moneyRain: false,
            });
          }}
        />
      ) : null}
    </div>
  );
}

export default SmartGoalsPage;
