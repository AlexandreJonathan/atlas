import { getSupabaseClient } from "../../../lib/supabase";
import { serializeContextForChat } from "../prompts/templates";
import type { ChatMessage, IntelligenceContext } from "../types";

export const ATLAS_AI_CHAT_FUNCTION = "atlas-ai-chat";
export const ATLAS_AI_CHAT_TIMEOUT_MS = 20_000;
export const ATLAS_AI_CHAT_MAX_ATTEMPTS = 3;

type EdgeChatSuccess = {
  reply: string;
  model?: string;
};

type EdgeChatErrorBody = {
  error?: string;
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

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error && error.message.startsWith("ATLAS_AI_TIMEOUT")) {
    return true;
  }
  if (typeof error === "object" && error !== null) {
    const maybe = error as { context?: { status?: number }; message?: string };
    const status = maybe.context?.status;
    if (typeof status === "number") {
      return status === 408 || status === 429 || status >= 500;
    }
    if (typeof maybe.message === "string" && /network|fetch|timeout/i.test(maybe.message)) {
      return true;
    }
  }
  return false;
}

/**
 * Invoca a Edge Function `atlas-ai-chat` com timeout e retry.
 * Nunca recebe a OPENAI_API_KEY — só o JWT da sessão Supabase.
 */
export async function invokeAtlasAiChat(
  messages: ChatMessage[],
  context: IntelligenceContext,
): Promise<EdgeChatSuccess> {
  const client = getSupabaseClient();
  const payload = {
    messages: messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content })),
    context: serializeContextForChat(context),
  };

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
        lastError = result.error;
        if (attempt < ATLAS_AI_CHAT_MAX_ATTEMPTS && isRetryableError(result.error)) {
          await sleep(250 * attempt);
          continue;
        }
        throw result.error;
      }

      const data = result.data;
      if (data && typeof data === "object" && "reply" in data && typeof data.reply === "string") {
        return {
          reply: data.reply,
          model: "model" in data && typeof data.model === "string" ? data.model : undefined,
        };
      }

      const detail =
        data && typeof data === "object" && "error" in data && data.error
          ? String(data.error)
          : "Resposta inválida da Edge Function";
      throw new Error(detail);
    } catch (error) {
      lastError = error;
      if (attempt < ATLAS_AI_CHAT_MAX_ATTEMPTS && isRetryableError(error)) {
        await sleep(250 * attempt);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
