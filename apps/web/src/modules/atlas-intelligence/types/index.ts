/**
 * Tipos de domínio da Atlas Intelligence.
 * Independentes de OpenAI, Supabase e Open Finance.
 */

export type InsightTone = "positiva" | "atencao" | "critica" | "informativa";

export type InsightCategory =
  | "economia"
  | "despesa"
  | "conta"
  | "meta"
  | "patrimonio"
  | "investimento"
  | "geral";

export type Insight = {
  id: string;
  tone: InsightTone;
  title: string;
  message: string;
  /** 1 = mais importante. */
  priority: number;
  category: InsightCategory;
  createdAt: string;
};

export type FeedItemKind =
  | "pix"
  | "saldo"
  | "insight"
  | "receita"
  | "despesa"
  | "conta"
  | "meta"
  | "recomendacao"
  | "sync";

export type FeedItem = {
  id: string;
  kind: FeedItemKind;
  title: string;
  message: string;
  createdAt: string;
};

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

/** Resultado do chat — distingue LLM real de modo limitado (mock/fallback). */
export type ChatReplyMode = "openai" | "limited";

export type ChatReplyResult = {
  content: string;
  mode: ChatReplyMode;
  reason?: string;
};

/** Snapshot de entrada do motor — somente leitura, sem mutar fontes. */
export type IntelligenceContext = {
  saldo: number;
  patrimonio: number;
  receitasDoMes: number;
  despesasDoMes: number;
  /** Comparativo opcional (quando houver histórico). */
  receitasMesAnterior?: number;
  despesasMesAnterior?: number;
  contasProximas: Array<{
    id: string;
    description: string;
    dueDate: string;
    amount: number;
  }>;
  contasVencidas: Array<{
    id: string;
    description: string;
    amount: number;
  }>;
  metas: Array<{
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
  }>;
  investimentosPatrimonio: number;
  risco?: "baixo" | "medio" | "alto" | null;
  transacoesRecentes: Array<{
    id: string;
    type: "receita" | "despesa";
    description: string;
    amount: number;
  }>;
};

export type FinancialEventKind =
  | "pix_received"
  | "income_added"
  | "expense_added"
  | "balance_updated"
  | "goal_progress"
  | "bill_due_soon"
  | "bank_synced";

export type FinancialEvent = {
  kind: FinancialEventKind;
  title?: string;
  amount?: number;
  counterpartName?: string;
  occurredAt?: string;
};
