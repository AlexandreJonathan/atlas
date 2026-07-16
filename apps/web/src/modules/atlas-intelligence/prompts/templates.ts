import type { IntelligenceContext } from "../types";

/**
 * Templates de prompt preparados para futura integração OpenAI.
 * Nesta missão não há chamada de API — só contratos de texto.
 */
export const ATLAS_SYSTEM_PROMPT = `Você é a Atlas Intelligence, assistente financeira pessoal da Atlas.
Fale em português do Brasil, de forma clara, empática e objetiva.
Nunca invente saldos ou contas. Use apenas o contexto financeiro fornecido.
Não dê conselho de investimento como oferta de produto — a Atlas não vende investimentos.`;

export function buildInsightPrompt(context: IntelligenceContext): string {
  return [
    "Analise o contexto financeiro abaixo e produza até 5 insights curtos e acionáveis.",
    "",
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

export function buildChatPrompt(userMessage: string, context: IntelligenceContext): string {
  return [
    ATLAS_SYSTEM_PROMPT,
    "",
    "Contexto atual:",
    buildInsightPrompt(context),
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
    buildInsightPrompt(context),
  ].join("\n");
}
