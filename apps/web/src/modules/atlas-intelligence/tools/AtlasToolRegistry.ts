import { analytics } from "../../../lib/analytics";
import { logger } from "../../../lib/logging";
import {
  financialDataService,
  type FinancialDataService,
} from "../../financial-data";
import {
  ATLAS_TOOL_DEFINITIONS,
  emptyToolArgsSchema,
  isAtlasToolName,
  type AtlasToolCall,
  type AtlasToolName,
  type AtlasToolResult,
  type OpenAiToolDefinition,
} from "./schemas";

const TOOL_TIMEOUT_MS = 12_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`ATLAS_TOOL_TIMEOUT:${label} after ${ms}ms`));
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

/**
 * Registry local (legado / testes / modo limitado offline).
 * Missão 24: o caminho OpenAI executa tools somente na Edge (allowlist + RLS).
 * Este registry NÃO deve ser usado para alimentar o LLM em produção.
 */
export class AtlasToolRegistry {
  private readonly service: FinancialDataService;

  constructor(service: FinancialDataService = financialDataService) {
    this.service = service;
  }

  listDefinitions(): OpenAiToolDefinition[] {
    return ATLAS_TOOL_DEFINITIONS;
  }

  async execute(
    call: AtlasToolCall,
    userId: string,
  ): Promise<AtlasToolResult> {
    const started = Date.now();
    analytics.track("atlas_ai_tool_called", { tool: call.name });

    try {
      emptyToolArgsSchema.parse(call.arguments ?? {});
      const data = await withTimeout(
        this.runTool(call.name, userId),
        TOOL_TIMEOUT_MS,
        call.name,
      );
      logger.info("Atlas tool OK", {
        tool: call.name,
        durationMs: Date.now() - started,
      });
      analytics.track("atlas_ai_tool_success", {
        tool: call.name,
        durationMs: Date.now() - started,
      });
      return { toolCallId: call.id, name: call.name, ok: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tool failed";
      logger.warning("Atlas tool falhou", {
        tool: call.name,
        error: message,
        durationMs: Date.now() - started,
      });
      analytics.track("atlas_ai_tool_error", {
        tool: call.name,
        reason: message.slice(0, 120),
      });
      return { toolCallId: call.id, name: call.name, ok: false, error: message };
    }
  }

  private async runTool(name: AtlasToolName, userId: string): Promise<unknown> {
    const snapshot = await this.service.ensureLoaded(userId);

    switch (name) {
      case "getFinancialSnapshot":
        return {
          saldo: snapshot.saldo,
          patrimonio: snapshot.patrimonio,
          investimentosPatrimonio: snapshot.investimentosPatrimonio,
          receitas: snapshot.receitas,
          despesas: snapshot.despesas,
          receitasDoMes: snapshot.receitasDoMes,
          despesasDoMes: snapshot.despesasDoMes,
          quantoPossoGastar: snapshot.quantoPossoGastar,
          providerName: snapshot.providerName,
          fetchedAt: snapshot.fetchedAt,
        };

      case "getAccounts":
        return {
          bankAccounts: snapshot.accounts.slice(0, 20).map((a) => ({
            id: a.id,
            bankId: a.bankId,
            bankName: a.bankName,
            name: a.name,
            type: a.type,
            balance: a.balance,
          })),
          cards: snapshot.cards.slice(0, 20).map((c) => ({
            id: c.id,
            bankName: c.bankName,
            name: c.name,
            lastFour: c.lastFour,
            limit: c.limit,
            used: c.used,
            available: c.available,
          })),
          bills: snapshot.bills.slice(0, 20).map((b) => ({
            id: b.id,
            description: b.description,
            amount: b.amount,
            dueDate: b.dueDate,
            status: b.status,
            type: b.type,
          })),
          contasVencidas: snapshot.contasVencidas.slice(0, 10),
          contasVencendoEmBreve: snapshot.contasVencendoEmBreve.slice(0, 10),
        };

      case "getTransactions":
        return {
          transactions: snapshot.transactions.slice(0, 30).map((t) => ({
            id: t.id,
            type: t.type,
            description: t.description,
            amount: t.amount,
            createdAt: t.createdAt,
          })),
          receitasDoMes: snapshot.receitasDoMes,
          despesasDoMes: snapshot.despesasDoMes,
        };

      case "getInvestments":
        return {
          patrimonioInvestido: snapshot.investimentosPatrimonio,
          openFinanceInvestments: (snapshot.openFinance?.investments ?? [])
            .slice(0, 20)
            .map((i) => ({
              id: i.id,
              bankName: i.bankName,
              name: i.name,
              type: i.type,
              balance: i.balance,
            })),
          studyPreview: {
            patrimonioInvestido: snapshot.investments.patrimonioInvestido,
            rendimentoMensalPercentual: snapshot.investments.rendimentoMensalPercentual,
            distribuicao: snapshot.investments.distribuicao,
          },
        };

      case "getGoals":
        return {
          goals: this.service.getMetas().map((g) => ({
            id: g.id,
            title: g.title,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount,
            targetDate: g.targetDate,
            progressPct:
              g.targetAmount > 0
                ? Math.round((g.currentAmount / g.targetAmount) * 100)
                : 0,
          })),
        };

      default: {
        const _exhaustive: never = name;
        throw new Error(`Tool desconhecida: ${String(_exhaustive)}`);
      }
    }
  }
}

export function parseToolCall(raw: {
  id?: string;
  function?: { name?: string; arguments?: string };
}): AtlasToolCall | null {
  const id = raw.id;
  const name = raw.function?.name;
  if (!id || !name || !isAtlasToolName(name)) return null;

  let args: Record<string, unknown> = {};
  if (typeof raw.function?.arguments === "string" && raw.function.arguments.trim()) {
    try {
      const parsed: unknown = JSON.parse(raw.function.arguments);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        args = parsed as Record<string, unknown>;
      }
    } catch {
      args = {};
    }
  }

  return { id, name, arguments: args };
}

export const atlasToolRegistry = new AtlasToolRegistry();
