import { useState } from "react";
import type { Goal } from "../types/goal";
import { goalContributionSchema } from "../validations/goalSchema";
import AsyncStateView from "./AsyncStateView";
import ProgressBar from "./ProgressBar";

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
      {goals.map((goal) => {
        const progresso = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;

        return (
          <div className="meta-item" key={goal.id}>
            <div className="meta-info">
              <strong>{goal.title}</strong>
              <span>
                R$ {goal.currentAmount.toFixed(2)} de R$ {goal.targetAmount.toFixed(2)}
              </span>
            </div>

            <ProgressBar value={progresso} label={`Progresso da meta ${goal.title}`} />

            <div className="meta-acoes-wrapper">
              <div className="meta-acoes">
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
                <button onClick={() => handleAportar(goal.id)} disabled={salvandoAporte[goal.id]}>
                  {salvandoAporte[goal.id] ? "Aportando..." : "Aportar"}
                </button>
                <button className="btn-remover" onClick={() => onRemover(goal.id)}>
                  Remover
                </button>
              </div>
              {errosAporte[goal.id] && <span className="erro-campo">{errosAporte[goal.id]}</span>}
            </div>
          </div>
        );
      })}
    </AsyncStateView>
  );
}

export default GoalsList;
