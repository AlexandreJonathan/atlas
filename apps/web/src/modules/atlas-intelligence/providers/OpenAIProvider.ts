import { featureFlagService } from "../../../config";
import { analytics } from "../../../lib/analytics";
import { logger } from "../../../lib/logging";
import type {
  ChatMessage,
  ChatReplyResult,
  FeedItem,
  FinancialEvent,
  Insight,
  IntelligenceContext,
} from "../types";
import type { AtlasAIProvider } from "./AtlasAIProvider";
import { MockAtlasAIProvider } from "./MockAtlasAIProvider";
import { AtlasAiRateLimitError, invokeAtlasAiChat } from "./openaiEdgeClient";

const LIMITED_PREFIX =
  "Estou em modo limitado no momento (a Atlas IA online está indisponível). Resposta local, com base nos dados já carregados neste aparelho:";

/**
 * Provider OpenAI — chat via Edge Function (contexto montado no servidor).
 * Insights / narração permanecem no mock.
 */
export class OpenAIProvider implements AtlasAIProvider {
  readonly name = "openai";

  private readonly mock = new MockAtlasAIProvider();

  generateInsights(context: IntelligenceContext): Promise<Insight[]> {
    return this.mock.generateInsights(context);
  }

  async generateChatReply(
    messages: ChatMessage[],
    context: IntelligenceContext,
  ): Promise<ChatReplyResult> {
    if (!featureFlagService.isEnabled("openai")) {
      logger.info("Atlas AI chat: flag openai desabilitada — modo limitado");
      analytics.track("atlas_ai_chat_fallback", { reason: "feature_flag_off" });
      return this.toLimited(await this.mock.generateChatReply(messages, context), "feature_flag_off");
    }

    try {
      const { reply, model, contextSource } = await invokeAtlasAiChat(messages);
      logger.info("Atlas AI chat: resposta OpenAI recebida", {
        model: model ?? "unknown",
        replyLength: reply.length,
        contextSource: contextSource ?? "server",
      });
      analytics.track("atlas_ai_chat_success", {
        model: model ?? "unknown",
        replyLength: reply.length,
        contextSource: contextSource ?? "server",
      });
      return { content: reply, mode: "openai" };
    } catch (error) {
      const reason =
        error instanceof AtlasAiRateLimitError ? "rate_limited" : "error_or_timeout";
      logger.warning("Atlas AI chat: fallback para modo limitado", {
        reason,
        error: error instanceof Error ? error.message : String(error),
      });
      if (reason === "rate_limited") {
        analytics.track("atlas_ai_rate_limited", { scope: "edge" });
      }
      analytics.track("atlas_ai_chat_fallback", { reason });
      const mock = await this.mock.generateChatReply(messages, context);
      return this.toLimited(mock, reason);
    }
  }

  narrateEvent(event: FinancialEvent, context: IntelligenceContext): Promise<FeedItem[]> {
    return this.mock.narrateEvent(event, context);
  }

  private toLimited(mock: ChatReplyResult, reason: string): ChatReplyResult {
    return {
      content: `${LIMITED_PREFIX}\n\n${mock.content}`,
      mode: "limited",
      reason,
    };
  }
}
