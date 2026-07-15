import { getSupabaseClient } from "../lib/supabase";
import type { FixedExpense } from "../types/fixedExpense";

const TABLE = "fixed_expenses";

// Ver observação equivalente em transactionsService.ts/billsService.ts sobre
// a ausência de tipos gerados do schema do Supabase.
type FixedExpenseRow = {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  created_at: string;
};

function mapRowToFixedExpense(row: FixedExpenseRow): FixedExpense {
  return {
    id: row.id,
    userId: row.user_id,
    description: row.description,
    amount: Number(row.amount),
    createdAt: row.created_at,
  };
}

export async function listFixedExpenses(userId: string): Promise<FixedExpense[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as FixedExpenseRow[]).map(mapRowToFixedExpense);
}

export type NewFixedExpenseInput = {
  userId: string;
  description: string;
  amount: number;
};

export async function createFixedExpense(input: NewFixedExpenseInput): Promise<FixedExpense> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(TABLE)
    .insert({
      user_id: input.userId,
      description: input.description,
      amount: input.amount,
    })
    .select("*")
    .single();

  if (error) throw error;

  return mapRowToFixedExpense(data as FixedExpenseRow);
}

// O RLS já garante que o Postgres rejeita/filtra linhas de outros usuários,
// mas o filtro por `user_id` também é aplicado aqui em defesa de profundidade
// (mesmo padrão adotado em billsService.ts/goalsService.ts na revisão da
// Sprint 4).
export async function deleteFixedExpense(id: string, userId: string): Promise<void> {
  const client = getSupabaseClient();

  const { error } = await client.from(TABLE).delete().eq("id", id).eq("user_id", userId);

  if (error) throw error;
}
