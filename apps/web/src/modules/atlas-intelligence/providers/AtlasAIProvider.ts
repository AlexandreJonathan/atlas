import type {
  ChatMessage,
  ChatReplyResult,
  FeedItem,
  FinancialEvent,
  Insight,
  IntelligenceContext,
} from "../types";

/**
 * Contrato estável para o cérebro da Atlas.
 * Implementações: MockAtlasAIProvider | OpenAIProvider.
 * A UI só fala com AtlasIntelligenceService.
 */
export interface AtlasAIProvider {
  readonly name: string;

  generateInsights(context: IntelligenceContext): Promise<Insight[]>;

  generateChatReply(
    messages: ChatMessage[],
    context: IntelligenceContext,
  ): Promise<ChatReplyResult>;

  narrateEvent(
    event: FinancialEvent,
    context: IntelligenceContext,
  ): Promise<FeedItem[]>;
}
