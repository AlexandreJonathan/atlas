import { Target } from "lucide-react";
import { useState } from "react";
import type { useGoals } from "../../hooks/useGoals";
import AsyncStateView from "../AsyncStateView";
import GoalModal from "../GoalModal";
import Button from "../ui/Button";
import ProgressRing from "../ui/ProgressRing";
import "./GoalsFocus.css";

type GoalsFocusProps = {
  metas: ReturnType<typeof useGoals>;
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function GoalsFocus({ metas }: GoalsFocusProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const destaque = metas.goals.slice(0, 2);

  return (
    <section className="atlas-surface atlas-surface-pad atlas-goals-focus" aria-labelledby="metas-focus-titulo">
      <div className="atlas-home-block-header">
        <h2 id="metas-focus-titulo">
          <Target size={18} aria-hidden="true" /> Metas
        </h2>
        <Button size="sm" variant="ghost" onClick={() => setModalAberto(true)}>
          Nova
        </Button>
      </div>

      <AsyncStateView
        loading={metas.loading}
        error={metas.error}
        isEmpty={destaque.length === 0}
        emptyMessage="Ainda sem metas. Crie a primeira e acompanhe o progresso aqui."
        onRetry={metas.recarregar}
        loadingMessage="Carregando metas..."
      >
        <div className="atlas-goals-focus-grid">
          {destaque.map((goal) => {
            const progresso = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
            return (
              <div key={goal.id} className="atlas-goals-focus-card">
                <ProgressRing
                  value={progresso}
                  label={`Progresso de ${goal.title}`}
                  size={72}
                  strokeWidth={8}
                  centerText={`${Math.round(progresso * 100)}%`}
                />
                <div>
                  <strong>{goal.title}</strong>
                  <small className="tabular-nums">
                    {formatarMoeda(goal.currentAmount)} de {formatarMoeda(goal.targetAmount)}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      </AsyncStateView>

      {metas.actionError && <p className="atlas-panel-erro-acao">{metas.actionError}</p>}

      {modalAberto && (
        <GoalModal onFechar={() => setModalAberto(false)} onSalvar={(dados) => metas.criar(dados)} />
      )}
    </section>
  );
}

export default GoalsFocus;
