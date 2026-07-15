import { BarChart3, Coins, PiggyBank, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { useFinancialProfile } from "../hooks/useFinancialProfile";
import type { usePlanning } from "../hooks/usePlanning";
import type { RiscoFinanceiro } from "../types/planning";
import FinancialProfileModal from "./FinancialProfileModal";
import "./Panels.css";
import SeverityBadge, { type SeverityTone } from "./SeverityBadge";
import Button from "./ui/Button";
import Card from "./ui/Card";
import ProgressRing from "./ui/ProgressRing";
import StatCard from "./ui/StatCard";

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

const TONS_RING: Record<RiscoFinanceiro, "success" | "warning" | "danger"> = {
  baixo: "success",
  medio: "warning",
  alto: "danger",
};

function formatarMoeda(valor: number) {
  return `R$ ${valor.toFixed(2)}`;
}

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
      <Card elevated className="atlas-panel" aria-labelledby="planejamento-titulo">
        <span className="atlas-panel-title" id="planejamento-titulo">
          <BarChart3 size={20} aria-hidden="true" />
          Planejamento do mês
        </span>
        <p className="atlas-panel-estado-vazio">Calculando seu planejamento...</p>
      </Card>
    );
  }

  if (perfil.error) {
    return (
      <Card elevated className="atlas-panel" aria-labelledby="planejamento-titulo">
        <span className="atlas-panel-title" id="planejamento-titulo">
          <BarChart3 size={20} aria-hidden="true" />
          Planejamento do mês
        </span>
        <div className="atlas-panel-estado-erro">
          <p>{perfil.error}</p>
          <Button variant="secondary" size="sm" onClick={perfil.recarregar}>
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

  if (!planejamento.configurado || !planejamento.resultado) {
    return (
      <Card elevated className="atlas-panel" aria-labelledby="planejamento-titulo">
        <span className="atlas-panel-title" id="planejamento-titulo">
          <BarChart3 size={20} aria-hidden="true" />
          Planejamento do mês
        </span>
        <p className="atlas-panel-estado-vazio">
          Configure sua renda mensal e reserva mínima para ver quanto pode gastar hoje, quanto precisa
          guardar e seu risco financeiro.
        </p>
        <div className="atlas-panel-actions">
          <Button size="sm" onClick={() => setModalAberto(true)}>
            Configurar planejamento
          </Button>
        </div>
        {modal}
      </Card>
    );
  }

  const { resultado } = planejamento;
  const proporcaoReserva =
    perfil.profile && perfil.profile.minimumReserve > 0
      ? Math.min(1, Math.max(0, resultado.saldoPrevistoFimDoMes / perfil.profile.minimumReserve))
      : resultado.saldoPrevistoFimDoMes >= 0
        ? 1
        : 0;

  return (
    <Card elevated className="atlas-panel" aria-labelledby="planejamento-titulo">
      <div className="atlas-panel-header">
        <span className="atlas-panel-title" id="planejamento-titulo">
          <BarChart3 size={20} aria-hidden="true" />
          Planejamento do mês
        </span>
        <div className="atlas-panel-actions">
          <Button variant="secondary" size="sm" onClick={() => setModalAberto(true)}>
            Editar
          </Button>
        </div>
      </div>

      <div className="atlas-planning-body">
        <ProgressRing
          value={proporcaoReserva}
          tone={TONS_RING[resultado.risco]}
          label={`Saúde financeira do mês: ${LEGENDAS_RISCO[resultado.risco]}`}
          centerText={LEGENDAS_RISCO[resultado.risco].replace("Risco ", "")}
        />

        <div className="atlas-panel-cards">
          <StatCard icon={<Coins size={20} />} label="Posso gastar hoje" value={formatarMoeda(resultado.quantoPossoGastarHoje)} />
          <StatCard icon={<PiggyBank size={20} />} label="Preciso guardar este mês" value={formatarMoeda(resultado.quantoPrecisaGuardar)} />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Saldo previsto (fim do mês)"
            value={formatarMoeda(resultado.saldoPrevistoFimDoMes)}
            tone={resultado.saldoPrevistoFimDoMes < 0 ? "danger" : "brand"}
          />
        </div>
      </div>

      <SeverityBadge tone={TONS_RISCO[resultado.risco]} label={LEGENDAS_RISCO[resultado.risco]} />

      {modal}
    </Card>
  );
}

export default PlanningPanel;
