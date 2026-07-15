import { getMesesRestantes } from "./dateUtils";
import type { PlanningProvider, PlanningResult, PlanningSnapshot, RiscoFinanceiro } from "../types/planning";

const LIMITE_RISCO_MEDIO = 0.5;

// Motor síncrono e sem I/O (mesmo espírito de recommendationEngine.ts) —
// 100% testável e substituível por uma implementação com IA real no futuro
// por trás do mesmo contrato PlanningProvider (ver export abaixo).
export function calcularPlanejamento(snapshot: PlanningSnapshot): PlanningResult {
  const rendaAReceber = Math.max(0, snapshot.rendaMensal - snapshot.receitasDoMes);

  const saldoPrevistoFimDoMes =
    snapshot.saldo + rendaAReceber - snapshot.totalDespesasFixas - snapshot.totalPendenteAPagar;

  const quantoPossoGastarHoje =
    Math.max(0, saldoPrevistoFimDoMes - snapshot.reservaMinima) / snapshot.diasRestantesNoMes;

  const reservaFaltante = Math.max(0, snapshot.reservaMinima - snapshot.saldo);

  // Só metas com prazo definido entram no ritmo mensal — sem targetDate não
  // há como calcular quanto guardar por mês (limitação conhecida, ver
  // roadmap/backlog.md).
  const aporteMetasNecessario = snapshot.goals.reduce((total, meta) => {
    if (!meta.targetDate) return total;

    const faltam = Math.max(0, meta.targetAmount - meta.currentAmount);
    const meses = getMesesRestantes(meta.targetDate, snapshot.hojeISO);
    return total + faltam / meses;
  }, 0);

  const quantoPrecisaGuardar = reservaFaltante + aporteMetasNecessario;

  const risco = calcularRisco(saldoPrevistoFimDoMes, snapshot.reservaMinima);

  return {
    quantoPossoGastarHoje,
    quantoPrecisaGuardar,
    saldoPrevistoFimDoMes,
    risco,
  };
}

function calcularRisco(saldoPrevisto: number, reservaMinima: number): RiscoFinanceiro {
  if (saldoPrevisto < 0 || saldoPrevisto < reservaMinima * LIMITE_RISCO_MEDIO) {
    return "alto";
  }

  if (saldoPrevisto < reservaMinima) {
    return "medio";
  }

  return "baixo";
}

export const ruleBasedPlanningProvider: PlanningProvider = (snapshot) =>
  Promise.resolve(calcularPlanejamento(snapshot));
