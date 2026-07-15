import { getSupabaseClient } from "../lib/supabase";
import type { Goal } from "../types/goal";

const TABLE = "goals";

// Ver observação equivalente em transactionsService.ts/billsService.ts sobre
// a ausência de tipos gerados do schema do Supabase.
type GoalRow = {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  created_at: string;
};

function mapRowToGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    targetDate: row.target_date,
    createdAt: row.created_at,
  };
}

export async function listGoals(userId: string): Promise<Goal[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as GoalRow[]).map(mapRowToGoal);
}

export type NewGoalInput = {
  userId: string;
  title: string;
  targetAmount: number;
  targetDate: string | null;
};

export async function createGoal(input: NewGoalInput): Promise<Goal> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(TABLE)
    .insert({
      user_id: input.userId,
      title: input.title,
      target_amount: input.targetAmount,
      target_date: input.targetDate,
    })
    .select("*")
    .single();

  if (error) throw error;

  return mapRowToGoal(data as GoalRow);
}

// Recebe o valor absoluto já calculado (currentAmount + aporte) pelo
// hook, evitando depender de um incremento atômico no banco — suficiente
// para o uso mono-usuário atual (ver roadmap/backlog.md para uma futura
// tabela de histórico de aportes/auditoria).
//
// O RLS já garante que o Postgres rejeita/filtra linhas de outros usuários,
// mas o filtro por `user_id` também é aplicado aqui em defesa de profundidade
// (evita depender de uma única camada de segurança e deixa a intenção
// explícita na própria query).
export async function updateGoalProgress(id: string, userId: string, newAmount: number): Promise<Goal> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(TABLE)
    .update({ current_amount: newAmount })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;

  return mapRowToGoal(data as GoalRow);
}

export async function deleteGoal(id: string, userId: string): Promise<void> {
  const client = getSupabaseClient();

  const { error } = await client.from(TABLE).delete().eq("id", id).eq("user_id", userId);

  if (error) throw error;
}
