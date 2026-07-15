import { Target } from "lucide-react";
import { useState } from "react";
import type { useGoals } from "../hooks/useGoals";
import GoalModal from "./GoalModal";
import GoalsList from "./GoalsList";
import "./Panels.css";
import Button from "./ui/Button";
import Card from "./ui/Card";

type GoalsPanelProps = {
  metas: ReturnType<typeof useGoals>;
};

function GoalsPanel({ metas }: GoalsPanelProps) {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <Card elevated className="atlas-panel" aria-labelledby="metas-titulo">
      <div className="atlas-panel-header">
        <span className="atlas-panel-title" id="metas-titulo">
          <Target size={20} aria-hidden="true" />
          Metas
        </span>
        <div className="atlas-panel-actions">
          <Button size="sm" onClick={() => setModalAberto(true)}>
            + Nova Meta
          </Button>
        </div>
      </div>

      {metas.actionError && <p className="atlas-panel-erro-acao">{metas.actionError}</p>}

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
    </Card>
  );
}

export default GoalsPanel;
