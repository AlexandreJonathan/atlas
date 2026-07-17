import { featureFlagService } from "../../../config";
import { analytics } from "../../../lib/analytics";
import { logger } from "../../../lib/logging";
import { getSupabaseClient } from "../../../lib/supabase";
import type {
  ChatMessage,
  ChatReplyResult,
  FeedItem,
  FinancialEvent,
  Insight,
  IntelligenceContext,
} from "../types";
import { runAtlasToolAgent } from "../tools/runAtlasToolAgent";
import type { AtlasAIProvider } from "./AtlasAIProvider";
import { MockAtlasAIProvider } from "./MockAtlasAIProvider";
import { AtlasAiRateLimitError, invokeAtlasAiChat } from "./openaiEdgeClient";

const LIMITED_PREFIX =
  "Estou em modo limitado no momento (a Atlas IA online está indisponível). Resposta local, com base nos dados já carregados neste aparelho:";

/**
 * Provider OpenAI — agente com Tool Calling (execução na Edge / RLS).
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
      const {
        data: { session },
      } = await getSupabaseClient().auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error("Sessão ausente para o agente Atlas IA");
      }

      const { reply, model, toolsUsed } = await runAtlasToolAgent(messages, userId);
      logger.info("Atlas AI chat: resposta do agente", {
        model: model ?? "unknown",
        replyLength: reply.length,
        toolsUsed: toolsUsed.join(","),
      });
      analytics.track("atlas_ai_chat_success", {
        model: model ?? "unknown",
        replyLength: reply.length,
        contextSource: "server_tools",
        toolsUsed: toolsUsed.join(","),
      });
      return { content: reply, mode: "openai" };
    } catch (error) {
      const reason =
        error instanceof AtlasAiRateLimitError ? "rate_limited" : "error_or_timeout";
      logger.warning("Atlas AI agent falhou — tentando legado / fallback", {
        reason,
        error: error instanceof Error ? error.message : String(error),
      });

      if (reason === "rate_limited") {
        analytics.track("atlas_ai_rate_limited", { scope: "edge" });
        analytics.track("atlas_ai_chat_fallback", { reason });
        const mock = await this.mock.generateChatReply(messages, context);
        return this.toLimited(mock, reason);
      }

      // Fallback: modo legado na Edge (contexto RLS) antes do mock local.
      try {
        const legacy = await invokeAtlasAiChat(messages);
        analytics.track("atlas_ai_chat_fallback", { reason: "agent_to_legacy" });
        return { content: legacy.reply, mode: "openai", reason: "agent_to_legacy" };
      } catch (legacyError) {
        logger.warning("Atlas AI legado também falhou — modo limitado", {
          error: legacyError instanceof Error ? legacyError.message : String(legacyError),
        });
        analytics.track("atlas_ai_chat_fallback", { reason });
        const mock = await this.mock.generateChatReply(messages, context);
        return this.toLimited(mock, reason);
      }
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
