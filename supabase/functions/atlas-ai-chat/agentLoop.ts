/**
 * Loop do agente OpenAI — 100% no servidor (Missão 24).
 */

import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.1";
import {
  AGENT_SYSTEM_PROMPT,
  SERVER_TOOL_DEFINITIONS,
  type ConversationMessage,
} from "./agentTrust.ts";
import { executeServerToolCalls, type ToolCallRaw } from "./agentTools.ts";

export const ATLAS_AGENT_MAX_ROUNDS = 4;

type OpenAiChatMessage = Record<string, unknown>;

async function callOpenAi(input: {
  apiKey: string;
  model: string;
  messages: OpenAiChatMessage[];
  toolChoice: "required" | "auto";
}): Promise<{
  content: string | null;
  toolCalls: ToolCallRaw[];
  usage: unknown;
}> {
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      temperature: 0.3,
      max_tokens: 600,
      messages: input.messages,
      tools: SERVER_TOOL_DEFINITIONS,
      tool_choice: input.toolChoice,
    }),
  });

  const openaiJson = await openaiRes.json();
  if (!openaiRes.ok) {
    console.error("[atlas-ai-chat] OpenAI agent error", openaiRes.status);
    throw new Error("OPENAI_REQUEST_FAILED");
  }

  const message = openaiJson?.choices?.[0]?.message;
  const toolCalls = Array.isArray(message?.tool_calls)
    ? (message.tool_calls as ToolCallRaw[])
    : [];

  return {
    content: typeof message?.content === "string" ? message.content : null,
    toolCalls,
    usage: openaiJson?.usage ?? null,
  };
}

export async function runServerAgentLoop(input: {
  apiKey: string;
  model: string;
  conversation: ConversationMessage[];
  userClient: SupabaseClient;
  admin: SupabaseClient;
  userId: string;
}): Promise<{
  reply: string;
  toolsUsed: string[];
  usage: unknown;
}> {
  const history: OpenAiChatMessage[] = [
    { role: "system", content: AGENT_SYSTEM_PROMPT },
    ...input.conversation.map((m) => ({ role: m.role, content: m.content })),
  ];

  const toolsUsed: string[] = [];
  let toolChoice: "required" | "auto" = "required";
  let lastUsage: unknown = null;

  for (let round = 1; round <= ATLAS_AGENT_MAX_ROUNDS; round++) {
    console.info("[atlas-ai-chat] agent round", {
      userId: input.userId,
      round,
      toolChoice,
      messageCount: history.length,
    });

    const turn = await callOpenAi({
      apiKey: input.apiKey,
      model: input.model,
      messages: history,
      toolChoice,
    });
    lastUsage = turn.usage;

    if (turn.toolCalls.length > 0) {
      // Rejeita tool names desconhecidos (allowlist); não confia no schema do cliente.
      const unknown = turn.toolCalls.filter(
        (c) => !c.function?.name || !SERVER_TOOL_DEFINITIONS.some((d) => d.function.name === c.function?.name),
      );
      if (unknown.length === turn.toolCalls.length) {
        throw new Error("UNKNOWN_TOOLS_ONLY");
      }

      history.push({
        role: "assistant",
        content: turn.content,
        tool_calls: turn.toolCalls,
      });

      const executed = await executeServerToolCalls(
        turn.toolCalls,
        input.userClient,
        input.admin,
        input.userId,
      );

      if (executed.rejected.length > 0) {
        console.warn("[atlas-ai-chat] rejected tools", {
          userId: input.userId,
          rejected: executed.rejected,
        });
      }

      for (const name of executed.toolsUsed) {
        toolsUsed.push(name);
      }
      for (const msg of executed.toolMessages) {
        history.push(msg);
      }

      toolChoice = "auto";
      continue;
    }

    const reply = turn.content?.trim() ?? "";
    if (reply) {
      if (toolsUsed.length === 0 && round === 1) {
        console.warn("[atlas-ai-chat] reply without tools on round 1 — forcing tools");
        toolChoice = "required";
        continue;
      }
      return { reply, toolsUsed, usage: lastUsage };
    }

    throw new Error("EMPTY_MODEL_REPLY");
  }

  throw new Error("AGENT_ROUND_LIMIT");
}
