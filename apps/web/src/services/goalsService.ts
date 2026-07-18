import { getSupabaseClient } from "../lib/supabase";
import type { Goal, GoalCategory, GoalStatus } from "../types/goal";
import { GOAL_CATEGORIES, GOAL_STATUSES } from "../types/goal";

const TABLE = "goals";

type GoalRow = {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  category?: string | null;
  status?: string | null;
  created_at: string;
  updated_at?: string | null;
};

function asCategory(value: string | null | undefined): GoalCategory {
  if (value && (GOAL_CATEGORIES as readonly string[]).includes(value)) {
    return value as GoalCategory;
  }
  return "other";
}

function asStatus(value: string | null | undefined): GoalStatus {
  if (value && (GOAL_STATUSES as readonly string[]).includes(value)) {
    return value as GoalStatus;
  }
  return "active";
}

function mapRowToGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? null,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    targetDate: row.target_date,
    category: asCategory(row.category),
    status: asStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
}

function deriveStatus(currentAmount: number, targetAmount: number, current: GoalStatus): GoalStatus {
  if (current === "paused" || current === "cancelled") return current;
  if (targetAmount > 0 && currentAmount >= targetAmount) return "completed";
  if (current === "completed" && currentAmount < targetAmount) return "active";
  return current === "completed" ? "completed" : "active";
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
  description?: string | null;
  category?: GoalCategory;
  status?: GoalStatus;
};

export async function createGoal(input: NewGoalInput): Promise<Goal> {
  const client = getSupabaseClient();
  const category = input.category ?? "other";
  const status = input.status ?? "active";

  const { data, error } = await client
    .from(TABLE)
    .insert({
      user_id: input.userId,
      title: input.title,
      target_amount: input.targetAmount,
      target_date: input.targetDate,
      description: input.description?.trim() ? input.description.trim() : null,
      category,
      status,
    })
    .select("*")
    .single();

  if (error) throw error;

  return mapRowToGoal(data as GoalRow);
}

export async function updateGoalProgress(
  id: string,
  userId: string,
  newAmount: number,
): Promise<Goal> {
  const client = getSupabaseClient();

  const { data: existing, error: readError } = await client
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (readError) throw readError;

  const row = existing as GoalRow;
  const status = deriveStatus(
    newAmount,
    Number(row.target_amount),
    asStatus(row.status),
  );

  const { data, error } = await client
    .from(TABLE)
    .update({ current_amount: newAmount, status })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;

  return mapRowToGoal(data as GoalRow);
}

export type UpdateGoalInput = {
  title?: string;
  description?: string | null;
  targetAmount?: number;
  targetDate?: string | null;
  category?: GoalCategory;
  status?: GoalStatus;
};

export async function updateGoal(
  id: string,
  userId: string,
  patch: UpdateGoalInput,
): Promise<Goal> {
  const client = getSupabaseClient();
  const payload: Record<string, unknown> = {};
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.description !== undefined) {
    payload.description = patch.description?.trim() ? patch.description.trim() : null;
  }
  if (patch.targetAmount !== undefined) payload.target_amount = patch.targetAmount;
  if (patch.targetDate !== undefined) payload.target_date = patch.targetDate;
  if (patch.category !== undefined) payload.category = patch.category;
  if (patch.status !== undefined) payload.status = patch.status;

  const { data, error } = await client
    .from(TABLE)
    .update(payload)
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
