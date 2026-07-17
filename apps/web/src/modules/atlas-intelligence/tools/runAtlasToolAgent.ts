import { analytics } from "../../../lib/analytics";
import { logger } from "../../../lib/logging";
import type { ChatMessage } from "../types";
import { invokeAtlasAiAgent } from "../providers/openaiEdgeClient";

/**
 * Orquestra o agente Atlas IA (Missão 24).
 * O loop, as tools e os resultados financeiros ocorrem somente na Edge.
 * O cliente envia apenas histórico user/assistant.
 */
export async function runAtlasToolAgent(
  messages: ChatMessage[],
  userId: string,
): Promise<{ reply: string; model?: string; toolsUsed: string[] }> {
  void userId; // identidade resolvida na Edge via JWT — mantido na assinatura por compatibilidade
  logger.info("Atlas agent: invocando Edge (server tools)", {
    messageCount: messages.length,
  });
  analytics.track("atlas_ai_agent_turn", { round: 1, toolChoice: "server" });

  const result = await invokeAtlasAiAgent(messages);

  analytics.track("atlas_ai_agent_completed", {
    rounds: 1,
    toolsUsed: result.toolsUsed.join(","),
  });

  return {
    reply: result.reply,
    model: result.model,
    toolsUsed: result.toolsUsed,
  };
}
