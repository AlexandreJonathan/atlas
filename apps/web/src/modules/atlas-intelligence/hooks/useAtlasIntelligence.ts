import { useCallback, useEffect, useMemo, useState } from "react";
import { MOCK_INVESTMENTS } from "../../../data/mockInvestments";
import type { useBills } from "../../../hooks/useBills";
import type { useFinancialSummary } from "../../../hooks/useFinancialSummary";
import type { useGoals } from "../../../hooks/useGoals";
import type { usePlanning } from "../../../hooks/usePlanning";
import type { useTransactions } from "../../../hooks/useTransactions";
import { atlasIntelligenceService } from "../services/AtlasIntelligenceService";
import type {
  ChatMessage,
  ChatReplyResult,
  FeedItem,
  FinancialEvent,
  Insight,
  IntelligenceContext,
} from "../types";
import { getFeedItems, subscribeFeed } from "../utils/feedStore";

type ResumoSlice = ReturnType<typeof useFinancialSummary>;
type ContasSlice = ReturnType<typeof useBills>;
type MetasSlice = ReturnType<typeof useGoals>;
type TransacoesSlice = ReturnType<typeof useTransactions>;
type PlanejamentoSlice = Pick<ReturnType<typeof usePlanning>, "resultado">;

function buildContext(input: {
  saldo: number;
  receitasDoMes: number;
  despesasDoMes: number;
  contasProximas: ContasSlice["contasVencendoEmBreve"];
  contasVencidas: ContasSlice["contasVencidas"];
  metas: MetasSlice["goals"];
  transactions: TransacoesSlice["transactions"];
  risco: PlanejamentoSlice["resultado"] extends { risco: infer R } | null | undefined ? R | null : null;
  contasError: boolean;
  metasError: boolean;
  txError: boolean;
}): IntelligenceContext {
  const investimentos = MOCK_INVESTMENTS.patrimonioInvestido;
  return {
    saldo: input.saldo,
    patrimonio: input.saldo + investimentos,
    receitasDoMes: input.receitasDoMes,
    despesasDoMes: input.despesasDoMes,
    contasProximas: (input.contasError ? [] : input.contasProximas).map((c) => ({
      id: c.id,
      description: c.description,
      dueDate: c.dueDate,
      amount: c.amount,
    })),
    contasVencidas: (input.contasError ? [] : input.contasVencidas).map((c) => ({
      id: c.id,
      description: c.description,
      amount: c.amount,
    })),
    metas: (input.metasError ? [] : input.metas).map((g) => ({
      id: g.id,
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
    })),
    investimentosPatrimonio: investimentos,
    risco: input.risco ?? null,
    transacoesRecentes: (input.txError ? [] : input.transactions).slice(0, 20).map((t) => ({
      id: t.id,
      type: t.type,
      description: t.description,
      amount: t.amount,
    })),
  };
}

/**
 * Hook da Atlas Intelligence — compõe contexto e fala só com o Service.
 */
export function useAtlasIntelligence(
  resumo: ResumoSlice,
  contas: ContasSlice,
  metas: MetasSlice,
  transacoes: TransacoesSlice,
  planejamento: PlanejamentoSlice,
) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [topInsights, setTopInsights] = useState<Insight[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>(() => getFeedItems());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fontesLoading =
    resumo.loading || contas.loading || metas.loading || transacoes.loading;

  const risco = planejamento.resultado?.risco ?? null;
  const contasProximas = contas.contasVencendoEmBreve;
  const contasVencidas = contas.contasVencidas;
  const goals = metas.goals;
  const transactions = transacoes.transactions;

  const context = useMemo(
    () =>
      buildContext({
        saldo: resumo.saldo,
        receitasDoMes: resumo.receitasDoMes,
        despesasDoMes: resumo.despesasDoMes,
        contasProximas,
        contasVencidas,
        metas: goals,
        transactions,
        risco,
        contasError: Boolean(contas.error),
        metasError: Boolean(metas.error),
        txError: Boolean(transacoes.error),
      }),
    [
      resumo.saldo,
      resumo.receitasDoMes,
      resumo.despesasDoMes,
      contasProximas,
      contasVencidas,
      goals,
      transactions,
      risco,
      contas.error,
      metas.error,
      transacoes.error,
    ],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await atlasIntelligenceService.generateInsights(context);
      const top = await atlasIntelligenceService.getTopInsights(context, 3);
      setInsights(all);
      setTopInsights(top);
    } catch (erro) {
      setError(erro instanceof Error ? erro.message : "Não foi possível gerar insights.");
    } finally {
      setLoading(false);
    }
  }, [context]);

  useEffect(() => {
    if (fontesLoading) return;
    let ativo = true;
    Promise.resolve().then(() => {
      if (ativo) void refresh();
    });
    return () => {
      ativo = false;
    };
  }, [fontesLoading, refresh]);

  useEffect(() => subscribeFeed(setFeed), []);

  const publishEvent = useCallback(
    async (event: FinancialEvent) => {
      await atlasIntelligenceService.narrateAndPublish(event, context);
    },
    [context],
  );

  const ask = useCallback(
    async (messages: ChatMessage[]): Promise<ChatReplyResult> => {
      return atlasIntelligenceService.generateChatReply(messages, context);
    },
    [context],
  );

  return {
    context,
    insights,
    topInsights,
    feed,
    loading: fontesLoading || loading,
    error,
    refresh,
    publishEvent,
    ask,
    providerName: atlasIntelligenceService.getProviderName(),
  };
}
