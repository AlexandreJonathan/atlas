import { featureFlagService } from "../../../config";
import { analytics } from "../../../lib/analytics";
import { logger } from "../../../lib/logging";
import type {
  ChatMessage,
  FeedItem,
  FinancialEvent,
  Insight,
  IntelligenceContext,
} from "../types";
import type { AtlasAIProvider } from "./AtlasAIProvider";
import { MockAtlasAIProvider } from "./MockAtlasAIProvider";
import { invokeAtlasAiChat } from "./openaiEdgeClient";

/**
 * Provider OpenAI — chat via Supabase Edge Function (`atlas-ai-chat`).
 * Insights e narração de eventos permanecem no mock (Missão 17 — só chat).
 * A OPENAI_API_KEY nunca passa por este código.
 */
export class OpenAIProvider implements AtlasAIProvider {
  readonly name = "openai";

  private readonly mock = new MockAtlasAIProvider();

  generateInsights(context: IntelligenceContext): Promise<Insight[]> {
    // Home Insights: motor local — sem LLM nesta versão.
    return this.mock.generateInsights(context);
  }

  async generateChatReply(
    messages: ChatMessage[],
    context: IntelligenceContext,
  ): Promise<string> {
    if (!featureFlagService.isEnabled("openai")) {
      logger.info("Atlas AI chat: flag openai desabilitada — usando mock");
      analytics.track("atlas_ai_chat_fallback", { reason: "feature_flag_off" });
      return this.mock.generateChatReply(messages, context);
    }

    try {
      const { reply, model } = await invokeAtlasAiChat(messages, context);
      logger.info("Atlas AI chat: resposta OpenAI recebida", {
        model: model ?? "unknown",
        replyLength: reply.length,
      });
      analytics.track("atlas_ai_chat_success", {
        model: model ?? "unknown",
        replyLength: reply.length,
      });
      return reply;
    } catch (error) {
      logger.warning("Atlas AI chat: falha no proxy OpenAI — fallback mock", {
        error: error instanceof Error ? error.message : String(error),
      });
      analytics.track("atlas_ai_chat_fallback", {
        reason: "error_or_timeout",
      });
      return this.mock.generateChatReply(messages, context);
    }
  }

  narrateEvent(event: FinancialEvent, context: IntelligenceContext): Promise<FeedItem[]> {
    // Feed: narrativas locais — sem LLM nesta versão.
    return this.mock.narrateEvent(event, context);
  }
}
