import { z } from "zod";

/** Nomes das ferramentas do agente Atlas IA. */
export const ATLAS_TOOL_NAMES = [
  "getFinancialSnapshot",
  "getAccounts",
  "getTransactions",
  "getInvestments",
  "getGoals",
] as const;

export type AtlasToolName = (typeof ATLAS_TOOL_NAMES)[number];

export function isAtlasToolName(value: string): value is AtlasToolName {
  return (ATLAS_TOOL_NAMES as readonly string[]).includes(value);
}

/** Args vazios — tools leem o snapshot via FinancialDataService. */
export const emptyToolArgsSchema = z.object({}).strict();

export type EmptyToolArgs = z.infer<typeof emptyToolArgsSchema>;

export type AtlasToolArgsMap = {
  getFinancialSnapshot: EmptyToolArgs;
  getAccounts: EmptyToolArgs;
  getTransactions: EmptyToolArgs;
  getInvestments: EmptyToolArgs;
  getGoals: EmptyToolArgs;
};

/** Schema OpenAI (function calling) — tipado e estável. */
export type OpenAiToolDefinition = {
  type: "function";
  function: {
    name: AtlasToolName;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      additionalProperties: false;
    };
  };
};

export const ATLAS_TOOL_DEFINITIONS: OpenAiToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "getFinancialSnapshot",
      description:
        "Obtém o resumo financeiro consolidado (saldo, patrimônio, receitas/despesas do mês, quanto pode gastar).",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "getAccounts",
      description:
        "Lista contas bancárias e cartões conectados (Open Finance) e contas a pagar/receber do ledger Atlas.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "getTransactions",
      description: "Lista movimentações recentes (receitas e despesas) do ledger Atlas.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "getInvestments",
      description: "Obtém patrimônio investido e distribuição (estudo / Open Finance quando houver).",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "getGoals",
      description: "Lista metas financeiras e progresso (valor atual vs alvo).",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
];

export type AtlasToolCall = {
  id: string;
  name: AtlasToolName;
  arguments: Record<string, unknown>;
};

export type AtlasToolResult = {
  toolCallId: string;
  name: AtlasToolName;
  ok: boolean;
  data?: unknown;
  error?: string;
};
