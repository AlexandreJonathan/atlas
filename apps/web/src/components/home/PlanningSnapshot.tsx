import { BarChart3 } from "lucide-react";
import { useState } from "react";
import type { useFinancialProfile } from "../../hooks/useFinancialProfile";
import type { useFixedExpenses } from "../../hooks/useFixedExpenses";
import type { usePlanning } from "../../hooks/usePlanning";
import type { RiscoFinanceiro } from "../../types/planning";
import FinancialProfileModal from "../FinancialProfileModal";
import FixedExpensesPanel from "../FixedExpensesPanel";
import SeverityBadge, { type SeverityTone } from "../SeverityBadge";
import Button from "../ui/Button";
import ProgressRing from "../ui/ProgressRing";
import "./PlanningSnapshot.css";

type PlanningSnapshotProps = {
  perfil: ReturnType<typeof useFinancialProfile>;
  planejamento: ReturnType<typeof usePlanning>;
  despesasFixas: ReturnType<typeof useFixedExpenses>;
};

const LEGENDAS: Record<RiscoFinanceiro, string> = {
  baixo: "Risco baixo",
  medio: "Risco médio",
  alto: "Risco alto",
};

const TONS: Record<RiscoFinanceiro, SeverityTone> = {
  baixo: "positiva",
  medio: "atencao",
  alto: "critica",
};

const TONS_RING: Record<RiscoFinanceiro, "success" | "warning" | "danger"> = {
  baixo: "success",
  medio: "warning",
  alto: "danger",
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function PlanningSnapshot({ perfil, planejamento, despesasFixas }: PlanningSnapshotProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [mostrarDespesasFixas, setMostrarDespesasFixas] = useState(false);
  const resultado = planejamento.resultado;

  return (
    <section className="atlas-surface atlas-planning-snapshot" aria-labelledby="planning-snapshot-titulo">
      <div className="atlas-home-block-header">
        <h2 id="planning-snapshot-titulo">
          <BarChart3 size={18} aria-hidden="true" /> Planejamento
        </h2>
        <Button size="sm" variant="ghost" onClick={() => setModalAberto(true)}>
          Ajustar
        </Button>
      </div>

      {planejamento.loading || perfil.loading ? (
        <p className="atlas-home-block-muted">Calculando seu planejamento...</p>
      ) : perfil.error ? (
        <div className="atlas-home-block-erro">
          <p>{perfil.error}</p>
          <Button variant="secondary" size="sm" onClick={perfil.recarregar}>
            Tentar novamente
          </Button>
        </div>
      ) : !perfil.profile || !resultado ? (
        <div className="atlas-planning-snapshot-empty">
          <p className="atlas-home-block-muted">
            Configure renda e reserva mínima para ver quanto você pode gastar hoje.
          </p>
          <Button size="sm" onClick={() => setModalAberto(true)}>
            Configurar
          </Button>
        </div>
      ) : (
        <div className="atlas-planning-snapshot-body">
          <ProgressRing
            value={
              perfil.profile.minimumReserve > 0
                ? Math.min(1, Math.max(0, resultado.saldoPrevistoFimDoMes / perfil.profile.minimumReserve))
                : resultado.saldoPrevistoFimDoMes >= 0
                  ? 1
                  : 0
            }
            label="Saúde financeira do mês"
            size={88}
            strokeWidth={9}
            tone={TONS_RING[resultado.risco]}
            centerText={LEGENDAS[resultado.risco].replace("Risco ", "")}
          />
          <div className="atlas-planning-snapshot-copy">
            <span className="atlas-planning-snapshot-label">Posso gastar hoje</span>
            <strong className="tabular-nums">{formatarMoeda(resultado.quantoPossoGastarHoje)}</strong>
            <SeverityBadge tone={TONS[resultado.risco]} label={LEGENDAS[resultado.risco]} />
          </div>
        </div>
      )}

      <Button
        size="sm"
        variant="secondary"
        fullWidth
        onClick={() => setMostrarDespesasFixas((atual) => !atual)}
      >
        {mostrarDespesasFixas ? "Ocultar despesas fixas" : "Despesas fixas"}
      </Button>

      {mostrarDespesasFixas && <FixedExpensesPanel despesasFixas={despesasFixas} />}

      {modalAberto && (
        <FinancialProfileModal
          perfilAtual={perfil.profile}
          onFechar={() => setModalAberto(false)}
          onSalvar={perfil.salvar}
        />
      )}
    </section>
  );
}

export default PlanningSnapshot;
