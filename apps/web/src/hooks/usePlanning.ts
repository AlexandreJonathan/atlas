import { useCallback, useEffect, useMemo, useState } from "react";
import { getDiasRestantesNoMes, getTodayISO } from "../lib/dateUtils";
import { ruleBasedPlanningProvider } from "../lib/planningEngine";
import type { PlanningResult, PlanningSnapshot } from "../types/planning";
import type { useBills } from "./useBills";
import type { useFinancialProfile } from "./useFinancialProfile";
import type { useFinancialSummary } from "./useFinancialSummary";
import type { useFixedExpenses } from "./useFixedExpenses";
import type { useGoals } from "./useGoals";

type PerfilSlice = Pick<ReturnType<typeof useFinancialProfile>, "profile" | "loading" | "error">;
type DespesasFixasSlice = Pick<ReturnType<typeof useFixedExpenses>, "totalDespesasFixas" | "loading" | "error">;
type ResumoSlice = Pick<
  ReturnType<typeof useFinancialSummary>,
  "saldo" | "receitasDoMes" | "despesasDoMes" | "loading" | "error"
>;
type ContasSlice = Pick<ReturnType<typeof useBills>, "totalPendenteAPagar" | "loading" | "error">;
type MetasSlice = Pick<ReturnType<typeof useGoals>, "goals" | "loading" | "error">;

// "Hoje" só muda com o relógio real, não com os dados do app — sem esse
// intervalo, "dias restantes no mês" ficaria parado desde o primeiro
// cálculo até a próxima mudança em transações/contas/metas/perfil.
const INTERVALO_ATUALIZACAO_MS = 5 * 60 * 1000;

// Compõe perfil + despesas fixas + resumo financeiro + contas + metas num
// único PlanningSnapshot e delega ao motor de regras (hoje) ou a um
// provider de IA (no futuro) por trás do mesmo contrato PlanningProvider —
// mesmo padrão de useRecommendations.
export function usePlanning(
  perfil: PerfilSlice,
  despesasFixas: DespesasFixasSlice,
  resumo: ResumoSlice,
  contas: ContasSlice,
  metas: MetasSlice,
) {
  const [resultado, setResultado] = useState<PlanningResult | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [hojeISO, setHojeISO] = useState(() => getTodayISO());

  useEffect(() => {
    const intervalo = setInterval(() => setHojeISO(getTodayISO()), INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(intervalo);
  }, []);

  const carregandoFontes =
    perfil.loading || despesasFixas.loading || resumo.loading || contas.loading || metas.loading;

  const configurado = perfil.profile !== null;

  // Fontes com erro são excluídas do snapshot (tratadas como "sem impacto")
  // em vez de derrubar todo o cálculo — mesma estratégia de degradação de
  // useRecommendations.
  const snapshot: PlanningSnapshot | null = useMemo(() => {
    if (!perfil.profile) {
      return null;
    }

    return {
      saldo: resumo.saldo,
      receitasDoMes: resumo.receitasDoMes,
      despesasDoMes: resumo.despesasDoMes,
      rendaMensal: perfil.profile.monthlyIncome,
      reservaMinima: perfil.profile.minimumReserve,
      totalDespesasFixas: despesasFixas.error ? 0 : despesasFixas.totalDespesasFixas,
      totalPendenteAPagar: contas.error ? 0 : contas.totalPendenteAPagar,
      diasRestantesNoMes: getDiasRestantesNoMes(hojeISO),
      goals: metas.error ? [] : metas.goals,
      hojeISO,
    };
  }, [
    perfil.profile,
    resumo.saldo,
    resumo.receitasDoMes,
    resumo.despesasDoMes,
    despesasFixas.totalDespesasFixas,
    despesasFixas.error,
    contas.totalPendenteAPagar,
    contas.error,
    metas.goals,
    metas.error,
    hojeISO,
  ]);

  const calcular = useCallback(async (dados: PlanningSnapshot) => {
    setCarregando(true);
    const dados2 = await ruleBasedPlanningProvider(dados);
    setResultado(dados2);
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (carregandoFontes) {
      return;
    }

    let ativo = true;

    Promise.resolve().then(() => {
      if (!ativo) return;

      if (!snapshot) {
        setCarregando(false);
        return;
      }

      calcular(snapshot);
    });

    return () => {
      ativo = false;
    };
  }, [carregandoFontes, snapshot, calcular]);

  return {
    configurado,
    loading: carregandoFontes || carregando,
    resultado,
  };
}
