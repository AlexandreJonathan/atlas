import { getSupabaseClient } from "../../../lib/supabase";
import type { ChatMessage } from "../types";
import type { OpenAiToolDefinition } from "../tools/schemas";

export const ATLAS_AI_CHAT_FUNCTION = "atlas-ai-chat";
export const ATLAS_AI_CHAT_TIMEOUT_MS = 25_000;
export const ATLAS_AI_CHAT_MAX_ATTEMPTS = 3;

export class AtlasAiRateLimitError extends Error {
  readonly retryAfterSec?: number;

  constructor(retryAfterSec?: number) {
    super("ATLAS_AI_RATE_LIMIT");
    this.name = "AtlasAiRateLimitError";
    this.retryAfterSec = retryAfterSec;
  }
}

export type AgentToolCallDto = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type AgentChatMessage =
  | { role: "system" | "user" | "assistant"; content: string | null; tool_calls?: AgentToolCallDto[] }
  | { role: "tool"; tool_call_id: string; content: string };

type EdgeChatSuccess = {
  reply?: string;
  content?: string | null;
  toolCalls?: AgentToolCallDto[];
  model?: string;
  contextSource?: string;
  mode?: "agent" | "legacy";
};

type EdgeChatErrorBody = {
  error?: string;
  scope?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`ATLAS_AI_TIMEOUT after ${ms}ms`));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function extractStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "context" in error) {
    const status = (error as { context?: { status?: number } }).context?.status;
    return typeof status === "number" ? status : undefined;
  }
  return undefined;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof AtlasAiRateLimitError) return false;
  if (error instanceof Error && error.message.startsWith("ATLAS_AI_TIMEOUT")) return true;
  const status = extractStatus(error);
  if (typeof status === "number") {
    if (status === 429) return false;
    return status === 408 || status >= 500;
  }
  if (typeof error === "object" && error !== null) {
    const message = (error as { message?: string }).message;
    if (typeof message === "string" && /network|fetch|timeout/i.test(message)) return true;
  }
  return false;
}

async function invokeRaw(payload: Record<string, unknown>): Promise<EdgeChatSuccess> {
  const client = getSupabaseClient();
  let lastError: unknown = new Error("Falha ao chamar atlas-ai-chat");

  for (let attempt = 1; attempt <= ATLAS_AI_CHAT_MAX_ATTEMPTS; attempt++) {
    try {
      const result = await withTimeout(
        client.functions.invoke<EdgeChatSuccess | EdgeChatErrorBody>(ATLAS_AI_CHAT_FUNCTION, {
          body: payload,
        }),
        ATLAS_AI_CHAT_TIMEOUT_MS,
      );

      if (result.error) {
        const status = extractStatus(result.error);
        if (status === 429) throw new AtlasAiRateLimitError();
        lastError = result.error;
        if (attempt < ATLAS_AI_CHAT_MAX_ATTEMPTS && isRetryableError(result.error)) {
          await sleep(250 * attempt);
          continue;
        }
        throw result.error;
      }

      const data = result.data;
      if (data && typeof data === "object" && "error" in data && data.error === "rate_limited") {
        throw new AtlasAiRateLimitError();
      }

      if (data && typeof data === "object") {
        const toolCalls = Array.isArray((data as EdgeChatSuccess).toolCalls)
          ? (data as EdgeChatSuccess).toolCalls
          : undefined;
        const reply =
          typeof (data as EdgeChatSuccess).reply === "string"
            ? (data as EdgeChatSuccess).reply
            : undefined;
        if (toolCalls?.length || typeof reply === "string") {
          return {
            reply,
            content: (data as EdgeChatSuccess).content ?? reply ?? null,
            toolCalls,
            model: (data as EdgeChatSuccess).model,
            contextSource: (data as EdgeChatSuccess).contextSource,
            mode: (data as EdgeChatSuccess).mode,
          };
        }
      }

      const detail =
        data && typeof data === "object" && "error" in data && data.error
          ? String(data.error)
          : "Resposta inválida da Edge Function";
      throw new Error(detail);
    } catch (error) {
      lastError = error;
      if (error instanceof AtlasAiRateLimitError) throw error;
      if (attempt < ATLAS_AI_CHAT_MAX_ATTEMPTS && isRetryableError(error)) {
        await sleep(250 * attempt);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

/**
 * Invoca a Edge Function em modo legado (sem tools) — fallback.
 * Envia apenas mensagens — o contexto financeiro é montado no servidor.
 */
export async function invokeAtlasAiChat(messages: ChatMessage[]): Promise<{
  reply: string;
  model?: string;
  contextSource?: string;
}> {
  const payload = {
    mode: "legacy",
    messages: messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content })),
  };

  const data = await invokeRaw(payload);
  if (!data.reply) throw new Error("Resposta vazia da Edge Function");
  return {
    reply: data.reply,
    model: data.model,
    contextSource: data.contextSource,
  };
}

/** Um turno do agente (pode devolver tool_calls ou reply final). */
export async function invokeAtlasAiAgentTurn(input: {
  messages: AgentChatMessage[];
  tools: OpenAiToolDefinition[];
  toolChoice: "auto" | "required" | "none";
}): Promise<EdgeChatSuccess> {
  return invokeRaw({
    mode: "agent",
    messages: input.messages,
    tools: input.tools,
    toolChoice: input.toolChoice,
  });
}
