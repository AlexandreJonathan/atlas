import { gerarInsights } from "../engine/insightEngine";
import type { AtlasAIProvider } from "./AtlasAIProvider";
import type {
  ChatMessage,
  FeedItem,
  FinancialEvent,
  Insight,
  IntelligenceContext,
} from "../types";
import { formatMoneyBRL, rankInsights } from "../utils/format";

function nowISO(): string {
  return new Date().toISOString();
}

function feed(
  kind: FeedItem["kind"],
  title: string,
  message: string,
  idSuffix: string,
): FeedItem {
  return {
    id: `feed-${kind}-${idSuffix}-${Date.now()}`,
    kind,
    title,
    message,
    createdAt: nowISO(),
  };
}

/**
 * Provider local — usa o Insight Engine + narrativas em cascata.
 * Sem rede / sem LLM.
 */
export class MockAtlasAIProvider implements AtlasAIProvider {
  readonly name = "mock";

  async generateInsights(context: IntelligenceContext): Promise<Insight[]> {
    return gerarInsights(context);
  }

  async generateChatReply(
    messages: ChatMessage[],
    context: IntelligenceContext,
  ): Promise<string> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const pergunta = lastUser?.content.toLowerCase() ?? "";
    const top = rankInsights(gerarInsights(context), 1)[0];

    if (/saldo|patrim[oô]nio/.test(pergunta)) {
      return `Seu saldo disponível está em ${formatMoneyBRL(context.saldo)} e o patrimônio estimado em ${formatMoneyBRL(context.patrimonio)}. ${top?.message ?? ""}`.trim();
    }
    if (/meta/.test(pergunta) && context.metas[0]) {
      const meta = context.metas[0];
      const pct = Math.round((meta.currentAmount / Math.max(meta.targetAmount, 1)) * 100);
      return `Na meta “${meta.title}” você já avançou cerca de ${pct}%. Quer que eu priorize aportes no planejamento?`;
    }
    if (/conta|boleto|venc/.test(pergunta)) {
      if (context.contasVencidas[0]) {
        return `Há contas em atraso. Comece por ${context.contasVencidas[0].description}.`;
      }
      if (context.contasProximas[0]) {
        return `Sua próxima conta é ${context.contasProximas[0].description}, no valor de ${formatMoneyBRL(context.contasProximas[0].amount)}.`;
      }
      return "Não vejo contas urgentes no radar agora.";
    }

    return top
      ? `Com base no seu momento financeiro: ${top.message}`
      : "Estou acompanhando suas finanças. Me pergunte sobre saldo, metas ou contas.";
  }

  async narrateEvent(
    event: FinancialEvent,
    context: IntelligenceContext,
  ): Promise<FeedItem[]> {
    const amountLabel =
      typeof event.amount === "number" ? ` ${formatMoneyBRL(event.amount)}` : "";
    const suffix = event.kind;

    switch (event.kind) {
      case "pix_received":
        return [
          feed(
            "pix",
            "Pix recebido",
            event.counterpartName
              ? `Pix de ${event.counterpartName}${amountLabel}.`
              : `Pix recebido${amountLabel}.`,
            suffix,
          ),
          feed("saldo", "Saldo atualizado", `Saldo disponível: ${formatMoneyBRL(context.saldo)}.`, suffix),
          feed(
            "recomendacao",
            "Nova recomendação",
            "Bom momento para revisar metas ou reserva com esse reforço de caixa.",
            suffix,
          ),
        ];
      case "income_added":
        return [
          feed("receita", "Receita registrada", `Entrada${amountLabel} registrada.`, suffix),
          feed("saldo", "Saldo atualizado", `Saldo disponível: ${formatMoneyBRL(context.saldo)}.`, suffix),
          feed(
            "recomendacao",
            "Nova recomendação",
            "Considere direcionar parte dessa entrada para uma meta ativa.",
            suffix,
          ),
        ];
      case "expense_added":
        return [
          feed("despesa", "Despesa registrada", `Saída${amountLabel} registrada.`, suffix),
          feed("saldo", "Saldo atualizado", `Saldo disponível: ${formatMoneyBRL(context.saldo)}.`, suffix),
          feed(
            "recomendacao",
            "Nova recomendação",
            "Vale conferir se essa despesa estava no planejamento do mês.",
            suffix,
          ),
        ];
      case "balance_updated":
        return [
          feed("saldo", "Saldo atualizado", `Saldo disponível: ${formatMoneyBRL(context.saldo)}.`, suffix),
        ];
      case "goal_progress":
        return [
          feed("meta", event.title ?? "Meta atualizada", "Seu progresso na meta foi registrado.", suffix),
          feed(
            "recomendacao",
            "Nova recomendação",
            "Manter aportes regulares acelera a conclusão.",
            suffix,
          ),
        ];
      case "bill_due_soon":
        return [
          feed("conta", event.title ?? "Conta próxima", "Há um vencimento no radar.", suffix),
          feed(
            "recomendacao",
            "Nova recomendação",
            "Reserve o valor com antecedência para evitar atraso.",
            suffix,
          ),
        ];
      case "bank_synced":
        return [
          feed("sync", "Bancos sincronizados", "Saldos e cartões foram atualizados.", suffix),
          feed("saldo", "Saldo atualizado", `Visão consolidada: ${formatMoneyBRL(context.saldo)}.`, suffix),
        ];
      default:
        return [
          feed("insight", "Atualização", "A Atlas registrou um movimento financeiro.", suffix),
        ];
    }
  }
}
