import { analytics } from "../../../lib/analytics";
import { logger } from "../../../lib/logging";
import type { ChatMessage } from "../types";
import { atlasToolRegistry, parseToolCall } from "./AtlasToolRegistry";
import { ATLAS_TOOL_DEFINITIONS } from "./schemas";
import {
  invokeAtlasAiAgentTurn,
  type AgentChatMessage,
  type AgentToolCallDto,
} from "../providers/openaiEdgeClient";

export const ATLAS_AGENT_MAX_ROUNDS = 4;
export const ATLAS_TOOL_EXEC_RETRIES = 2;

const AGENT_BOOT_SYSTEM = [
  "Você é a Atlas Intelligence, assistente financeira do app Atlas.",
  "Fale em português do Brasil, tom claro e objetivo (2–4 frases).",
  "REGRAS OBRIGATÓRIAS:",
  "- Para qualquer pergunta sobre saldo, patrimônio, contas, cartões, metas, receitas, despesas ou investimentos, você DEVE chamar a ferramenta apropriada antes de responder.",
  "- Nunca invente números. Use apenas dados retornados pelas tools.",
  "- Se uma tool falhar, diga que não conseguiu carregar o dado agora.",
  "- Não ofereça produtos de investimento; a Atlas não vende investimentos.",
].join("\n");

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function toAgentMessages(messages: ChatMessage[]): AgentChatMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-12)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content.slice(0, 4000),
    }));
}

async function executeToolWithRetry(
  call: NonNullable<ReturnType<typeof parseToolCall>>,
  userId: string,
): Promise<{ tool_call_id: string; content: string }> {
  let lastError = "tool_failed";
  for (let attempt = 1; attempt <= ATLAS_TOOL_EXEC_RETRIES; attempt++) {
    const result = await atlasToolRegistry.execute(call, userId);
    if (result.ok) {
      return {
        tool_call_id: result.toolCallId,
        content: JSON.stringify({ ok: true, data: result.data }),
      };
    }
    lastError = result.error ?? "tool_failed";
    if (attempt < ATLAS_TOOL_EXEC_RETRIES) {
      await sleep(200 * attempt);
    }
  }

  return {
    tool_call_id: call.id,
    content: JSON.stringify({ ok: false, error: lastError }),
  };
}

function mapToolCalls(raw: AgentToolCallDto[]) {
  return raw
    .map((item) => parseToolCall(item))
    .filter((item): item is NonNullable<typeof item> => item != null);
}

/**
 * Loop OpenAI → Tool → FinancialDataService → resposta.
 * A OpenAI não responde com números sem passar pelas tools.
 */
export async function runAtlasToolAgent(
  messages: ChatMessage[],
  userId: string,
): Promise<{ reply: string; model?: string; toolsUsed: string[] }> {
  const history: AgentChatMessage[] = [
    { role: "system", content: AGENT_BOOT_SYSTEM },
    ...toAgentMessages(messages),
  ];

  const toolsUsed: string[] = [];
  let toolChoice: "required" | "auto" = "required";

  for (let round = 1; round <= ATLAS_AGENT_MAX_ROUNDS; round++) {
    logger.info("Atlas agent turn", { round, toolChoice, messageCount: history.length });
    analytics.track("atlas_ai_agent_turn", { round, toolChoice });

    const turn = await invokeAtlasAiAgentTurn({
      messages: history,
      tools: ATLAS_TOOL_DEFINITIONS,
      toolChoice,
    });

    if (turn.toolCalls && turn.toolCalls.length > 0) {
      const parsed = mapToolCalls(turn.toolCalls);
      if (parsed.length === 0) {
        throw new Error("OpenAI retornou tool_calls inválidas");
      }

      history.push({
        role: "assistant",
        content: turn.content ?? null,
        tool_calls: turn.toolCalls,
      });

      for (const call of parsed) {
        toolsUsed.push(call.name);
        const toolMessage = await executeToolWithRetry(call, userId);
        history.push({
          role: "tool",
          tool_call_id: toolMessage.tool_call_id,
          content: toolMessage.content,
        });
      }

      toolChoice = "auto";
      continue;
    }

    const reply = turn.reply?.trim();
    if (reply) {
      if (toolsUsed.length === 0 && round === 1) {
        logger.warning("Atlas agent: resposta sem tools no 1º turno — forçando tools");
        toolChoice = "required";
        continue;
      }
      analytics.track("atlas_ai_agent_completed", {
        rounds: round,
        toolsUsed: toolsUsed.join(","),
      });
      return { reply, model: turn.model, toolsUsed };
    }

    throw new Error("Resposta vazia do agente OpenAI");
  }

  throw new Error("Limite de rodadas do agente Atlas atingido");
}
