import { useCallback, useEffect, useMemo, useState } from "react";
import { ruleBasedRecommendationProvider, type DashboardSnapshot } from "../lib/recommendationEngine";
import type { Recommendation } from "../types/recommendation";
import type { useBills } from "./useBills";
import type { useFinancialSummary } from "./useFinancialSummary";
import type { useGoals } from "./useGoals";
import type { usePlanning } from "./usePlanning";

type ResumoSlice = ReturnType<typeof useFinancialSummary>;
type ContasSlice = Pick<ReturnType<typeof useBills>, "contasVencidas" | "contasVencendoEmBreve" | "loading" | "error">;
type MetasSlice = Pick<ReturnType<typeof useGoals>, "goals" | "loading" | "error">;
type PlanejamentoSlice = Pick<ReturnType<typeof usePlanning>, "resultado">;

// Compõe os domínios (resumo financeiro, contas, metas e — quando
// disponível — o resultado do planejamento financeiro) num único
// DashboardSnapshot e delega ao motor de regras (hoje) ou a um provider de
// IA (no futuro) por trás do mesmo contrato RecommendationProvider.
export function useRecommendations(
  resumo: ResumoSlice,
  contas: ContasSlice,
  metas: MetasSlice,
  planejamento: PlanejamentoSlice,
) {
  const [recomendacoes, setRecomendacoes] = useState<Recommendation[]>([]);
  const [carregando, setCarregando] = useState(true);

  // O carregamento do planejamento (usePlanning) não bloqueia as
  // recomendações — "risco" é opcional no snapshot e, quando o resultado
  // chega depois, o snapshot memoizado muda e as recomendações são
  // recalculadas automaticamente (sem esperar por ele antes da 1ª geração).
  const carregandoFontes = resumo.loading || contas.loading || metas.loading;

  // Fontes com erro são excluídas do snapshot em vez de derrubar todas as
  // recomendações — degrada com elegância quando só uma fonte falha.
  const snapshot: DashboardSnapshot = useMemo(
    () => ({
      saldo: resumo.saldo,
      receitas: resumo.receitas,
      despesas: resumo.despesas,
      receitasDoMes: resumo.receitasDoMes,
      despesasDoMes: resumo.despesasDoMes,
      quantoPossoGastar: resumo.quantoPossoGastar,
      contasVencidas: contas.error ? [] : contas.contasVencidas,
      contasVencendoEmBreve: contas.error ? [] : contas.contasVencendoEmBreve,
      goals: metas.error ? [] : metas.goals,
      risco: planejamento.resultado?.risco,
    }),
    [
      resumo.saldo,
      resumo.receitas,
      resumo.despesas,
      resumo.receitasDoMes,
      resumo.despesasDoMes,
      resumo.quantoPossoGastar,
      contas.contasVencidas,
      contas.contasVencendoEmBreve,
      contas.error,
      metas.goals,
      metas.error,
      planejamento.resultado,
    ],
  );

  const buscarRecomendacoes = useCallback(async (dados: DashboardSnapshot) => {
    setCarregando(true);
    const resultado = await ruleBasedRecommendationProvider(dados);
    setRecomendacoes(resultado);
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (carregandoFontes) {
      return;
    }

    let ativo = true;
    Promise.resolve().then(() => {
      if (ativo) buscarRecomendacoes(snapshot);
    });

    return () => {
      ativo = false;
    };
  }, [carregandoFontes, snapshot, buscarRecomendacoes]);

  return {
    recomendacoes,
    loading: carregandoFontes || carregando,
  };
}
