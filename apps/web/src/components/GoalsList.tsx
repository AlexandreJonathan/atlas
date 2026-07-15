import { Target } from "lucide-react";
import { useState } from "react";
import type { Goal } from "../types/goal";
import { goalContributionSchema } from "../validations/goalSchema";
import AsyncStateView from "./AsyncStateView";
import "./Panels.css";
import Button from "./ui/Button";
import ProgressBar from "./ui/ProgressBar";

type GoalsListProps = {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  onAportar: (id: string, valor: number) => Promise<void>;
  onRemover: (id: string) => void;
  onTentarNovamente: () => void;
};

// O aporte é um formulário inline (um único campo) em vez de um modal
// separado — mais simples para uma ação tão pequena, consistente com o
// princípio de simplicidade do CLAUDE.md. A validação reaproveita o mesmo
// schema (goalContributionSchema) usado pelo restante da aplicação, para
// manter mensagens de erro consistentes em vez de uma checagem ad-hoc.
function GoalsList({ goals, loading, error, onAportar, onRemover, onTentarNovamente }: GoalsListProps) {
  const [aportes, setAportes] = useState<Record<string, string>>({});
  const [errosAporte, setErrosAporte] = useState<Record<string, string>>({});
  const [salvandoAporte, setSalvandoAporte] = useState<Record<string, boolean>>({});

  async function handleAportar(id: string) {
    const resultado = goalContributionSchema.shape.amount.safeParse(aportes[id] ?? "");

    if (!resultado.success) {
      setErrosAporte((atual) => ({ ...atual, [id]: resultado.error.issues[0].message }));
      return;
    }

    setErrosAporte((atual) => ({ ...atual, [id]: "" }));
    setSalvandoAporte((atual) => ({ ...atual, [id]: true }));

    try {
      await onAportar(id, Number(resultado.data));
      setAportes((atual) => ({ ...atual, [id]: "" }));
    } finally {
      setSalvandoAporte((atual) => ({ ...atual, [id]: false }));
    }
  }

  return (
    <AsyncStateView
      loading={loading}
      error={error}
      isEmpty={goals.length === 0}
      emptyMessage="Você ainda não tem metas. Crie a primeira meta financeira."
      onRetry={onTentarNovamente}
      loadingMessage="Carregando metas..."
    >
      <div className="atlas-list">
        {goals.map((goal, indice) => {
          const progresso = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;

          return (
            <div
              className="atlas-list-row"
              key={goal.id}
              style={{ animationDelay: `${Math.min(indice, 8) * 40}ms` }}
            >
              <span className="atlas-list-row-icon atlas-list-row-icon-brand" aria-hidden="true">
                <Target size={18} />
              </span>

              <div className="atlas-list-row-fill">
                <div className="atlas-list-row-info">
                  <span>{goal.title}</span>
                  <small className="tabular-nums">
                    R$ {goal.currentAmount.toFixed(2)} de R$ {goal.targetAmount.toFixed(2)}
                  </small>
                </div>

                <ProgressBar value={progresso} label={`Progresso da meta ${goal.title}`} />

                <div className="atlas-list-row-actions">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor do aporte"
                    aria-label={`Registrar aporte para ${goal.title}`}
                    value={aportes[goal.id] ?? ""}
                    disabled={salvandoAporte[goal.id]}
                    onChange={(evento) =>
                      setAportes((atual) => ({ ...atual, [goal.id]: evento.target.value }))
                    }
                  />
                  <Button size="sm" loading={salvandoAporte[goal.id]} onClick={() => handleAportar(goal.id)}>
                    Aportar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onRemover(goal.id)}>
                    Remover
                  </Button>
                </div>
                {errosAporte[goal.id] && <span className="atlas-field-error">{errosAporte[goal.id]}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </AsyncStateView>
  );
}

export default GoalsList;
