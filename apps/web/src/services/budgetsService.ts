import { getSupabaseClient } from "../lib/supabase";
import type {
  Budget,
  BudgetCategory,
  BudgetStatus,
  BudgetWithCategories,
  ExpenseCategory,
} from "../types/budget";
import { BUDGET_STATUSES, EXPENSE_CATEGORIES } from "../types/budget";

const BUDGETS_TABLE = "budgets";
const CATEGORIES_TABLE = "budget_categories";

type BudgetRow = {
  id: string;
  user_id: string;
  year: number;
  month: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type BudgetCategoryRow = {
  id: string;
  budget_id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  created_at: string;
  updated_at: string;
};

function asStatus(value: string): BudgetStatus {
  return (BUDGET_STATUSES as readonly string[]).includes(value)
    ? (value as BudgetStatus)
    : "active";
}

function asCategory(value: string): ExpenseCategory {
  return (EXPENSE_CATEGORIES as readonly string[]).includes(value)
    ? (value as ExpenseCategory)
    : "other";
}

function mapBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    userId: row.user_id,
    year: row.year,
    month: row.month,
    status: asStatus(row.status),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCategory(row: BudgetCategoryRow): BudgetCategory {
  return {
    id: row.id,
    budgetId: row.budget_id,
    userId: row.user_id,
    category: asCategory(row.category),
    limitAmount: Number(row.limit_amount),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listBudgetCategories(
  budgetId: string,
  userId: string,
): Promise<BudgetCategory[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(CATEGORIES_TABLE)
    .select("*")
    .eq("budget_id", budgetId)
    .eq("user_id", userId)
    .order("category", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as BudgetCategoryRow[]).map(mapCategory);
}

export async function getBudgetForPeriod(
  userId: string,
  year: number,
  month: number,
): Promise<BudgetWithCategories | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(BUDGETS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const budget = mapBudget(data as BudgetRow);
  const categories = await listBudgetCategories(budget.id, userId);
  return { ...budget, categories };
}

export async function ensureMonthBudget(
  userId: string,
  year: number,
  month: number,
  notes?: string | null,
): Promise<BudgetWithCategories> {
  const existing = await getBudgetForPeriod(userId, year, month);
  if (existing) {
    if (notes != null && notes !== existing.notes) {
      return updateBudgetNotes(existing.id, userId, notes);
    }
    return existing;
  }

  const client = getSupabaseClient();
  const { data, error } = await client
    .from(BUDGETS_TABLE)
    .insert({
      user_id: userId,
      year,
      month,
      status: "active",
      notes: notes?.trim() ? notes.trim() : null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return { ...mapBudget(data as BudgetRow), categories: [] };
}

export async function updateBudgetNotes(
  id: string,
  userId: string,
  notes: string | null,
): Promise<BudgetWithCategories> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(BUDGETS_TABLE)
    .update({ notes })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  const budget = mapBudget(data as BudgetRow);
  const categories = await listBudgetCategories(budget.id, userId);
  return { ...budget, categories };
}

export type UpsertBudgetCategoryInput = {
  budgetId: string;
  userId: string;
  category: ExpenseCategory;
  limitAmount: number;
};

export async function upsertBudgetCategory(
  input: UpsertBudgetCategoryInput,
): Promise<BudgetCategory> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(CATEGORIES_TABLE)
    .upsert(
      {
        budget_id: input.budgetId,
        user_id: input.userId,
        category: input.category,
        limit_amount: input.limitAmount,
      },
      { onConflict: "budget_id,category" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return mapCategory(data as BudgetCategoryRow);
}

export async function deleteBudgetCategory(
  id: string,
  userId: string,
): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from(CATEGORIES_TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function deleteBudget(id: string, userId: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from(BUDGETS_TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
