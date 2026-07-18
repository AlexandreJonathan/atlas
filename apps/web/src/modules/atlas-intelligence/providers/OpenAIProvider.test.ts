import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage, IntelligenceContext } from "../types";

vi.mock("../../../config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../config")>();
  return {
    ...actual,
    featureFlagService: {
      isEnabled: vi.fn(),
    },
  };
});

vi.mock("../../../lib/supabase", () => ({
  getSupabaseClient: vi.fn(),
}));

vi.mock("../tools/runAtlasToolAgent", () => ({
  runAtlasToolAgent: vi.fn(),
}));

vi.mock("./openaiEdgeClient", () => ({
  AtlasAiRateLimitError: class AtlasAiRateLimitError extends Error {
    constructor() {
      super("ATLAS_AI_RATE_LIMIT");
      this.name = "AtlasAiRateLimitError";
    }
  },
  invokeAtlasAiChat: vi.fn(),
}));

import { featureFlagService } from "../../../config";
import { getSupabaseClient } from "../../../lib/supabase";
import { runAtlasToolAgent } from "../tools/runAtlasToolAgent";
import { AtlasAiRateLimitError, invokeAtlasAiChat } from "./openaiEdgeClient";
import { OpenAIProvider } from "./OpenAIProvider";

const messages: ChatMessage[] = [{ role: "user", content: "Qual meu saldo?" }];
const context = {
  saldo: 100,
  patrimonio: 100,
  receitasDoMes: 0,
  despesasDoMes: 0,
  investimentosPatrimonio: 0,
  risco: null,
  contasVencidas: [],
  contasProximas: [],
  metas: [],
  transacoesRecentes: [],
} as unknown as IntelligenceContext;

describe("OpenAIProvider — caminhos críticos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("flag openai off → modo limitado sem chamar Edge", async () => {
    vi.mocked(featureFlagService.isEnabled).mockReturnValue(false);
    const provider = new OpenAIProvider();
    const result = await provider.generateChatReply(messages, context);

    expect(result.mode).toBe("limited");
    expect(result.reason).toBe("feature_flag_off");
    expect(result.content).toContain("modo limitado");
    expect(runAtlasToolAgent).not.toHaveBeenCalled();
  });

  it("agente OK → mode openai", async () => {
    vi.mocked(featureFlagService.isEnabled).mockReturnValue(true);
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: {
        getSession: vi.fn(async () => ({
          data: { session: { user: { id: "user-1" } } },
        })),
      },
    } as never);
    vi.mocked(runAtlasToolAgent).mockResolvedValue({
      reply: "Seu saldo é R$ 100.",
      model: "gpt-test",
      toolsUsed: ["getFinancialSnapshot"],
    });

    const provider = new OpenAIProvider();
    const result = await provider.generateChatReply(messages, context);

    expect(result).toEqual({ content: "Seu saldo é R$ 100.", mode: "openai" });
    expect(runAtlasToolAgent).toHaveBeenCalledWith(messages, "user-1");
  });

  it("rate limit → modo limitado sem legado", async () => {
    vi.mocked(featureFlagService.isEnabled).mockReturnValue(true);
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: {
        getSession: vi.fn(async () => ({
          data: { session: { user: { id: "user-1" } } },
        })),
      },
    } as never);
    vi.mocked(runAtlasToolAgent).mockRejectedValue(new AtlasAiRateLimitError());

    const provider = new OpenAIProvider();
    const result = await provider.generateChatReply(messages, context);

    expect(result.mode).toBe("limited");
    expect(result.reason).toBe("rate_limited");
    expect(invokeAtlasAiChat).not.toHaveBeenCalled();
  });

  it("falha do agente → fallback legado", async () => {
    vi.mocked(featureFlagService.isEnabled).mockReturnValue(true);
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: {
        getSession: vi.fn(async () => ({
          data: { session: { user: { id: "user-1" } } },
        })),
      },
    } as never);
    vi.mocked(runAtlasToolAgent).mockRejectedValue(new Error("agent down"));
    vi.mocked(invokeAtlasAiChat).mockResolvedValue({
      reply: "Resposta legado",
      contextSource: "server",
    });

    const provider = new OpenAIProvider();
    const result = await provider.generateChatReply(messages, context);

    expect(result).toEqual({
      content: "Resposta legado",
      mode: "openai",
      reason: "agent_to_legacy",
    });
  });
});
