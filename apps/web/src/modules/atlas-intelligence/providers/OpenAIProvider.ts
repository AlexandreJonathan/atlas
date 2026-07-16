import type { AtlasAIProvider } from "./AtlasAIProvider";
import type {
  ChatMessage,
  FeedItem,
  FinancialEvent,
  Insight,
  IntelligenceContext,
} from "../types";

/**
 * Stub do provider OpenAI — preparado para a próxima missão.
 * Nenhuma chamada HTTP / SDK nesta sprint.
 */
export class OpenAIProvider implements AtlasAIProvider {
  readonly name = "openai";

  async generateInsights(_context: IntelligenceContext): Promise<Insight[]> {
    void _context;
    throw new Error("OpenAIProvider ainda não implementado — use MockAtlasAIProvider.");
  }

  async generateChatReply(
    _messages: ChatMessage[],
    _context: IntelligenceContext,
  ): Promise<string> {
    void _messages;
    void _context;
    throw new Error("OpenAIProvider ainda não implementado — use MockAtlasAIProvider.");
  }

  async narrateEvent(
    _event: FinancialEvent,
    _context: IntelligenceContext,
  ): Promise<FeedItem[]> {
    void _event;
    void _context;
    throw new Error("OpenAIProvider ainda não implementado — use MockAtlasAIProvider.");
  }
}
