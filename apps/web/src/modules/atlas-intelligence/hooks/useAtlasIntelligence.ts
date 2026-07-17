import { useCallback, useEffect, useMemo, useState } from "react";
import type { usePlanning } from "../../../hooks/usePlanning";
import type { FinancialSnapshot } from "../../financial-data";
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

type PlanejamentoSlice = Pick<ReturnType<typeof usePlanning>, "resultado">;

function buildContextFromSnapshot(
  snapshot: FinancialSnapshot | null,
  risco: PlanejamentoSlice["resultado"] extends { risco: infer R } | null | undefined ? R | null : null,
): IntelligenceContext {
  if (!snapshot) {
    return {
      saldo: 0,
      patrimonio: 0,
      receitasDoMes: 0,
      despesasDoMes: 0,
      contasProximas: [],
      contasVencidas: [],
      metas: [],
      investimentosPatrimonio: 0,
      risco: risco ?? null,
      transacoesRecentes: [],
    };
  }

  const billsError = Boolean(snapshot.errors.bills);
  const metasError = Boolean(snapshot.errors.goals);
  const txError = Boolean(snapshot.errors.transactions);

  return {
    saldo: snapshot.saldo,
    patrimonio: snapshot.patrimonio,
    receitasDoMes: snapshot.receitasDoMes,
    despesasDoMes: snapshot.despesasDoMes,
    contasProximas: (billsError ? [] : snapshot.contasVencendoEmBreve).map((c) => ({
      id: c.id,
      description: c.description,
      dueDate: c.dueDate,
      amount: c.amount,
    })),
    contasVencidas: (billsError ? [] : snapshot.contasVencidas).map((c) => ({
      id: c.id,
      description: c.description,
      amount: c.amount,
    })),
    metas: (metasError ? [] : snapshot.goals).map((g) => ({
      id: g.id,
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
    })),
    investimentosPatrimonio: snapshot.investimentosPatrimonio,
    risco: risco ?? null,
    transacoesRecentes: (txError ? [] : snapshot.transactions).slice(0, 20).map((t) => ({
      id: t.id,
      type: t.type,
      description: t.description,
      amount: t.amount,
    })),
  };
}

/**
 * Hook da Atlas Intelligence — contexto vem da Financial Data Layer.
 */
export function useAtlasIntelligence(
  snapshot: FinancialSnapshot | null,
  fontesLoading: boolean,
  planejamento: PlanejamentoSlice,
) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [topInsights, setTopInsights] = useState<Insight[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>(() => getFeedItems());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const risco = planejamento.resultado?.risco ?? null;

  const context = useMemo(
    () => buildContextFromSnapshot(snapshot, risco),
    [snapshot, risco],
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
