export type {
  ChatMessage,
  ChatReplyMode,
  ChatReplyResult,
  ChatRole,
  FeedItem,
  FeedItemKind,
  FinancialEvent,
  FinancialEventKind,
  Insight,
  InsightCategory,
  InsightTone,
  IntelligenceContext,
} from "./types";

export type { AtlasAIProvider } from "./providers/AtlasAIProvider";
export { MockAtlasAIProvider } from "./providers/MockAtlasAIProvider";
export { OpenAIProvider } from "./providers/OpenAIProvider";
export {
  AtlasIntelligenceService,
  atlasIntelligenceService,
} from "./services/AtlasIntelligenceService";
export { gerarInsights } from "./engine/insightEngine";
export { useAtlasIntelligence } from "./hooks/useAtlasIntelligence";
export { rankInsights, formatMoneyBRL } from "./utils/format";
export {
  ATLAS_SYSTEM_PROMPT,
  buildChatPrompt,
  buildEventNarrationPrompt,
  buildInsightPrompt,
} from "./prompts/templates";

export { default as AtlasInsights } from "./components/AtlasInsights";
export { default as IntelligenceFeed } from "./components/IntelligenceFeed";

export {
  AtlasToolRegistry,
  atlasToolRegistry,
  parseToolCall,
} from "./tools/AtlasToolRegistry";
export {
  ATLAS_TOOL_DEFINITIONS,
  ATLAS_TOOL_NAMES,
  isAtlasToolName,
} from "./tools/schemas";
export type {
  AtlasToolCall,
  AtlasToolName,
  AtlasToolResult,
  OpenAiToolDefinition,
} from "./tools/schemas";
export { runAtlasToolAgent } from "./tools/runAtlasToolAgent";
export {
  buildSafeAgentPayload,
  validateAgentClientPayload,
  isAllowedToolName,
  assertToolAllowed,
  ATLAS_TOOL_ALLOWLIST,
} from "./security/agentTrustBoundary";
export type {
  TrustViolation,
  SafeAgentMessage,
  AgentClientPayload,
} from "./security/agentTrustBoundary";
