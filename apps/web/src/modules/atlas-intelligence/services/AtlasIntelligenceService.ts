import { appConfig, featureFlagService } from "../../../config";
import { logger } from "../../../lib/logging";
import type { AtlasAIProvider } from "../providers/AtlasAIProvider";
import { MockAtlasAIProvider } from "../providers/MockAtlasAIProvider";
import { OpenAIProvider } from "../providers/OpenAIProvider";
import type {
  ChatMessage,
  ChatReplyResult,
  FeedItem,
  FinancialEvent,
  Insight,
  IntelligenceContext,
} from "../types";
import { recommendationEngine } from "../engine/recommendations/RecommendationEngine";
import type { Recommendation, RecommendationContext } from "../types/recommendation";
import { prependFeedItems } from "../utils/feedStore";
import { rankInsights } from "../utils/format";

/**
 * Factory Adapter/Provider:
 * - flag openai ligada → OpenAIProvider (chat via Edge Function; insights/mock local)
 * - caso contrário → MockAtlasAIProvider
 * Insights proativos v2 vêm do RecommendationEngine (local), não do LLM.
 */
function createAtlasAiProvider(): AtlasAIProvider {
  if (featureFlagService.isEnabled("openai") && appConfig.providers.atlasAi === "openai") {
    logger.info("Atlas AI: OpenAIProvider ativo", {
      provider: appConfig.providers.atlasAi,
    });
    return new OpenAIProvider();
  }

  logger.info("Atlas AI: MockAtlasAIProvider ativo");
  return new MockAtlasAIProvider();
}

/**
 * Única porta de entrada do app para Atlas Intelligence.
 * Telas e hooks usam este service — nunca o OpenAIProvider diretamente.
 */
export class AtlasIntelligenceService {
  private readonly provider: AtlasAIProvider;

  constructor(provider: AtlasAIProvider) {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.name;
  }

  /** Flag OpenAI (módulo de IA externa) — telas não precisam consultar diretamente. */
  isOpenAiEnabled(): boolean {
    return featureFlagService.isEnabled("openai");
  }

  generateInsights(context: IntelligenceContext): Promise<Insight[]> {
    return this.provider.generateInsights(context);
  }

  async getTopInsights(context: IntelligenceContext, limit = 3): Promise<Insight[]> {
    const all = await this.provider.generateInsights(context);
    return rankInsights(all, limit);
  }

  /** RecommendationEngine v2 — regras locais, sem OpenAI. */
  generateRecommendations(context: RecommendationContext): Recommendation[] {
    return recommendationEngine.evaluate(context);
  }

  getTopRecommendations(context: RecommendationContext, limit = 3): Recommendation[] {
    return recommendationEngine.getTop(context, limit);
  }

  generateChatReply(
    messages: ChatMessage[],
    context: IntelligenceContext,
  ): Promise<ChatReplyResult> {
    return this.provider.generateChatReply(messages, context);
  }

  async narrateAndPublish(
    event: FinancialEvent,
    context: IntelligenceContext,
  ): Promise<FeedItem[]> {
    const items = await this.provider.narrateEvent(event, context);
    prependFeedItems(items);
    return items;
  }
}

/** Instância padrão da aplicação. */
export const atlasIntelligenceService = new AtlasIntelligenceService(createAtlasAiProvider());
