import { useState } from "react";
import type { useGoals } from "../hooks/useGoals";
import GoalModal from "./GoalModal";
import GoalsList from "./GoalsList";

type GoalsPanelProps = {
  metas: ReturnType<typeof useGoals>;
};

function GoalsPanel({ metas }: GoalsPanelProps) {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <section className="painel" aria-labelledby="metas-titulo">
      <div className="painel-header">
        <h2 id="metas-titulo">🎯 Metas</h2>
        <div className="painel-acoes">
          <button onClick={() => setModalAberto(true)}>+ Nova Meta</button>
        </div>
      </div>

      {metas.actionError && <p className="erro-geral erro-acao">{metas.actionError}</p>}

      <GoalsList
        goals={metas.goals}
        loading={metas.loading}
        error={metas.error}
        onAportar={metas.registrarAporte}
        onRemover={metas.remover}
        onTentarNovamente={metas.recarregar}
      />

      {modalAberto && (
        <GoalModal onFechar={() => setModalAberto(false)} onSalvar={(dados) => metas.criar(dados)} />
      )}
    </section>
  );
}

export default GoalsPanel;
