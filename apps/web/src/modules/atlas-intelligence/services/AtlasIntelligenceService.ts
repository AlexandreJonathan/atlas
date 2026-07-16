import { appConfig, featureFlagService } from "../../../config";
import { logger } from "../../../lib/logging";
import type { AtlasAIProvider } from "../providers/AtlasAIProvider";
import { MockAtlasAIProvider } from "../providers/MockAtlasAIProvider";
import type {
  ChatMessage,
  FeedItem,
  FinancialEvent,
  Insight,
  IntelligenceContext,
} from "../types";
import { prependFeedItems } from "../utils/feedStore";
import { rankInsights } from "../utils/format";

function createAtlasAiProvider(): AtlasAIProvider {
  if (appConfig.providers.atlasAi === "openai") {
    // Stub ainda não implementado — manter mock para não alterar UX.
    logger.warning("Atlas AI: provider openai solicitado; usando mock até a integração real");
  }
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

  generateChatReply(
    messages: ChatMessage[],
    context: IntelligenceContext,
  ): Promise<string> {
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

/** Instância padrão (mock até integração OpenAI). */
export const atlasIntelligenceService = new AtlasIntelligenceService(createAtlasAiProvider());
