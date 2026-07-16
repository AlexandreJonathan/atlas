import type {
  ChatMessage,
  FeedItem,
  FinancialEvent,
  Insight,
  IntelligenceContext,
} from "../types";

/**
 * Contrato estável para o cérebro da Atlas.
 * Mock hoje; OpenAI no futuro — a UI só fala com o Service.
 */
export interface AtlasAIProvider {
  readonly name: string;

  generateInsights(context: IntelligenceContext): Promise<Insight[]>;

  generateChatReply(
    messages: ChatMessage[],
    context: IntelligenceContext,
  ): Promise<string>;

  narrateEvent(
    event: FinancialEvent,
    context: IntelligenceContext,
  ): Promise<FeedItem[]>;
}
