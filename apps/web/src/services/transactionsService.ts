import { getSupabaseClient } from "../lib/supabase";
import type { ExpenseCategory } from "../types/budget";
import { EXPENSE_CATEGORIES } from "../types/budget";
import type { Transaction, TransactionType } from "../types/transaction";

const TABLE = "transactions";

// O client do Supabase ainda não usa tipos gerados a partir do schema
// (`supabase gen types typescript`), então `data` retorna como `any`. Os
// casts abaixo para `TransactionRow` documentam o formato esperado das
// colunas e devem ser revistos/removidos quando a geração de tipos for
// adotada (ver roadmap/backlog.md).
type TransactionRow = {
  id: string;
  user_id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string | null;
  created_at: string;
};

function asExpenseCategory(value: string | null | undefined): ExpenseCategory | null {
  if (value == null || value === "") return null;
  return (EXPENSE_CATEGORIES as readonly string[]).includes(value)
    ? (value as ExpenseCategory)
    : "other";
}

function mapRowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    description: row.description,
    amount: Number(row.amount),
    category: asExpenseCategory(row.category),
    createdAt: row.created_at,
  };
}

export async function listTransactions(userId: string): Promise<Transaction[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as TransactionRow[]).map(mapRowToTransaction);
}

export type NewTransactionInput = {
  userId: string;
  type: TransactionType;
  description: string;
  amount: number;
  /** Obrigatório para despesas no Budget Planner; receitas podem omitir. */
  category?: ExpenseCategory | null;
};

export async function createTransaction(input: NewTransactionInput): Promise<Transaction> {
  const client = getSupabaseClient();

  const category =
    input.type === "despesa"
      ? (input.category ?? "other")
      : (input.category ?? null);

  const { data, error } = await client
    .from(TABLE)
    .insert({
      user_id: input.userId,
      type: input.type,
      description: input.description,
      amount: input.amount,
      category,
    })
    .select("*")
    .single();

  if (error) throw error;

  return mapRowToTransaction(data as TransactionRow);
}

// O RLS já garante que o Postgres rejeita/filtra linhas de outros usuários,
// mas o filtro por `user_id` também é aplicado aqui em defesa de profundidade
// (evita depender de uma única camada de segurança e deixa a intenção
// explícita na própria query).
export async function deleteTransaction(id: string, userId: string): Promise<void> {
  const client = getSupabaseClient();

  const { error } = await client.from(TABLE).delete().eq("id", id).eq("user_id", userId);

  if (error) throw error;
}
