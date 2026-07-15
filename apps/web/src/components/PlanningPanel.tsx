import { useState } from "react";
import type { useFinancialProfile } from "../hooks/useFinancialProfile";
import type { usePlanning } from "../hooks/usePlanning";
import type { RiscoFinanceiro } from "../types/planning";
import FinancialProfileModal from "./FinancialProfileModal";
import SeverityBadge, { type SeverityTone } from "./SeverityBadge";

type PlanningPanelProps = {
  perfil: ReturnType<typeof useFinancialProfile>;
  planejamento: ReturnType<typeof usePlanning>;
};

const LEGENDAS_RISCO: Record<RiscoFinanceiro, string> = {
  baixo: "Risco baixo",
  medio: "Risco médio",
  alto: "Risco alto",
};

const TONS_RISCO: Record<RiscoFinanceiro, SeverityTone> = {
  baixo: "positiva",
  medio: "atencao",
  alto: "critica",
};

function PlanningPanel({ perfil, planejamento }: PlanningPanelProps) {
  const [modalAberto, setModalAberto] = useState(false);

  const modal = modalAberto && (
    <FinancialProfileModal
      perfilAtual={perfil.profile}
      onFechar={() => setModalAberto(false)}
      onSalvar={perfil.salvar}
    />
  );

  if (planejamento.loading) {
    return (
      <section className="painel painel-planejamento" aria-labelledby="planejamento-titulo">
        <h2 id="planejamento-titulo">📊 Planejamento do mês</h2>
        <p className="estado-carregando">Calculando seu planejamento...</p>
      </section>
    );
  }

  if (perfil.error) {
    return (
      <section className="painel painel-planejamento" aria-labelledby="planejamento-titulo">
        <h2 id="planejamento-titulo">📊 Planejamento do mês</h2>
        <div className="estado-erro">
          <p>{perfil.error}</p>
          <button className="btn-tentar-novamente" onClick={perfil.recarregar}>
            Tentar novamente
          </button>
        </div>
      </section>
    );
  }

  if (!planejamento.configurado || !planejamento.resultado) {
    return (
      <section className="painel painel-planejamento" aria-labelledby="planejamento-titulo">
        <h2 id="planejamento-titulo">📊 Planejamento do mês</h2>
        <p className="estado-vazio">
          Configure sua renda mensal e reserva mínima para ver quanto pode gastar hoje, quanto precisa
          guardar e seu risco financeiro.
        </p>
        <div className="painel-acoes">
          <button onClick={() => setModalAberto(true)}>Configurar planejamento</button>
        </div>
        {modal}
      </section>
    );
  }

  const { resultado } = planejamento;

  return (
    <section className="painel painel-planejamento" aria-labelledby="planejamento-titulo">
      <div className="painel-header">
        <h2 id="planejamento-titulo">📊 Planejamento do mês</h2>
        <div className="painel-acoes">
          <button onClick={() => setModalAberto(true)}>Editar</button>
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Posso gastar hoje</h3>
          <h2>R$ {resultado.quantoPossoGastarHoje.toFixed(2)}</h2>
        </div>

        <div className="card">
          <h3>Preciso guardar este mês</h3>
          <h2>R$ {resultado.quantoPrecisaGuardar.toFixed(2)}</h2>
        </div>

        <div className="card">
          <h3>Saldo previsto (fim do mês)</h3>
          <h2 className={resultado.saldoPrevistoFimDoMes < 0 ? "valor-negativo" : undefined}>
            R$ {resultado.saldoPrevistoFimDoMes.toFixed(2)}
          </h2>
        </div>
      </div>

      <SeverityBadge tone={TONS_RISCO[resultado.risco]} label={LEGENDAS_RISCO[resultado.risco]} />

      {modal}
    </section>
  );
}

export default PlanningPanel;
