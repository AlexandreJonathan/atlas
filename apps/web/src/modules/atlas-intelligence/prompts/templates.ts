import type { IntelligenceContext } from "../types";

/**
 * Templates de prompt compartilhados (front documenta o contrato;
 * a Edge Function `atlas-ai-chat` aplica o system prompt definitivo no servidor).
 */
export const ATLAS_SYSTEM_PROMPT = `Você é a Atlas Intelligence, assistente financeira pessoal da Atlas.
Fale em português do Brasil, de forma clara, empática e objetiva.
Nunca invente saldos ou contas. Use apenas o contexto financeiro fornecido.
Não dê conselho de investimento como oferta de produto — a Atlas não vende investimentos.`;

export function buildContextSummary(context: IntelligenceContext): string {
  return [
    `Saldo: ${context.saldo}`,
    `Patrimônio: ${context.patrimonio}`,
    `Receitas do mês: ${context.receitasDoMes}`,
    `Despesas do mês: ${context.despesasDoMes}`,
    `Investimentos: ${context.investimentosPatrimonio}`,
    `Risco: ${context.risco ?? "indefinido"}`,
    `Contas vencidas: ${context.contasVencidas.length}`,
    `Contas próximas: ${context.contasProximas.length}`,
    `Metas: ${context.metas.length}`,
  ].join("\n");
}

export function buildInsightPrompt(context: IntelligenceContext): string {
  return [
    "Analise o contexto financeiro abaixo e produza até 5 insights curtos e acionáveis.",
    "",
    buildContextSummary(context),
  ].join("\n");
}

export function buildChatPrompt(userMessage: string, context: IntelligenceContext): string {
  return [
    ATLAS_SYSTEM_PROMPT,
    "",
    "Contexto atual:",
    buildContextSummary(context),
    "",
    `Pergunta do usuário: ${userMessage}`,
  ].join("\n");
}

export function buildEventNarrationPrompt(eventLabel: string, context: IntelligenceContext): string {
  return [
    ATLAS_SYSTEM_PROMPT,
    "",
    `Evento financeiro: ${eventLabel}`,
    "Gere uma sequência curta de mensagens (evento → saldo → recomendação).",
    buildContextSummary(context),
  ].join("\n");
}

/**
 * Serialização local para prompts/mock.
 * A Edge `atlas-ai-chat` NÃO aceita contexto do cliente — monta no servidor (RLS).
 */
export function serializeContextForChat(context: IntelligenceContext) {
  return {
    saldo: context.saldo,
    patrimonio: context.patrimonio,
    receitasDoMes: context.receitasDoMes,
    despesasDoMes: context.despesasDoMes,
    investimentosPatrimonio: context.investimentosPatrimonio,
    risco: context.risco ?? null,
    contasProximas: context.contasProximas.slice(0, 5).map((c) => ({
      description: c.description,
      dueDate: c.dueDate,
      amount: c.amount,
    })),
    contasVencidas: context.contasVencidas.slice(0, 5).map((c) => ({
      description: c.description,
      amount: c.amount,
    })),
    metas: context.metas.slice(0, 5).map((m) => ({
      title: m.title,
      targetAmount: m.targetAmount,
      currentAmount: m.currentAmount,
    })),
    transacoesRecentes: context.transacoesRecentes.slice(0, 8).map((t) => ({
      type: t.type,
      description: t.description,
      amount: t.amount,
    })),
  };
}
