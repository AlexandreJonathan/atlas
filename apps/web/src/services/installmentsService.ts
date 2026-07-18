import { getSupabaseClient } from "../lib/supabase";
import type { ExpenseCategory } from "../types/budget";
import { EXPENSE_CATEGORIES } from "../types/budget";
import type {
  InstallmentPayment,
  InstallmentPaymentStatus,
  InstallmentPlan,
  InstallmentPlanStatus,
  InstallmentPlanWithPayments,
} from "../types/installment";
import {
  INSTALLMENT_PAYMENT_STATUSES,
  INSTALLMENT_PLAN_STATUSES,
} from "../types/installment";
import { buildPaymentSchedule } from "../lib/installmentSchedule";

const PLANS = "installment_plans";
const PAYMENTS = "installment_payments";

type PlanRow = {
  id: string;
  user_id: string;
  description: string;
  category: string;
  total_amount: number;
  installment_count: number;
  installment_amount: number;
  first_due_date: string;
  card_label: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type PaymentRow = {
  id: string;
  plan_id: string;
  user_id: string;
  sequence: number;
  due_date: string;
  amount: number;
  status: string;
  paid_at: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
};

function asCategory(value: string): ExpenseCategory {
  return (EXPENSE_CATEGORIES as readonly string[]).includes(value)
    ? (value as ExpenseCategory)
    : "other";
}

function asPlanStatus(value: string): InstallmentPlanStatus {
  return (INSTALLMENT_PLAN_STATUSES as readonly string[]).includes(value)
    ? (value as InstallmentPlanStatus)
    : "active";
}

function asPaymentStatus(value: string): InstallmentPaymentStatus {
  return (INSTALLMENT_PAYMENT_STATUSES as readonly string[]).includes(value)
    ? (value as InstallmentPaymentStatus)
    : "pending";
}

function mapPlan(row: PlanRow): InstallmentPlan {
  return {
    id: row.id,
    userId: row.user_id,
    description: row.description,
    category: asCategory(row.category),
    totalAmount: Number(row.total_amount),
    installmentCount: row.installment_count,
    installmentAmount: Number(row.installment_amount),
    firstDueDate: row.first_due_date,
    cardLabel: row.card_label,
    status: asPlanStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPayment(row: PaymentRow): InstallmentPayment {
  return {
    id: row.id,
    planId: row.plan_id,
    userId: row.user_id,
    sequence: row.sequence,
    dueDate: row.due_date,
    amount: Number(row.amount),
    status: asPaymentStatus(row.status),
    paidAt: row.paid_at,
    transactionId: row.transaction_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listInstallmentPayments(
  userId: string,
): Promise<InstallmentPayment[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(PAYMENTS)
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as PaymentRow[]).map(mapPayment);
}

export async function listInstallmentPlans(
  userId: string,
): Promise<InstallmentPlanWithPayments[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(PLANS)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const plans = ((data ?? []) as PlanRow[]).map(mapPlan);
  const payments = await listInstallmentPayments(userId);
  const byPlan = new Map<string, InstallmentPayment[]>();
  for (const payment of payments) {
    const list = byPlan.get(payment.planId) ?? [];
    list.push(payment);
    byPlan.set(payment.planId, list);
  }

  return plans.map((plan) => ({
    ...plan,
    payments: (byPlan.get(plan.id) ?? []).sort((a, b) => a.sequence - b.sequence),
  }));
}

export type NewInstallmentPlanInput = {
  userId: string;
  description: string;
  category: ExpenseCategory;
  totalAmount: number;
  installmentCount: number;
  installmentAmount: number;
  firstDueDate: string;
  cardLabel?: string | null;
};

export async function createInstallmentPlan(
  input: NewInstallmentPlanInput,
): Promise<InstallmentPlanWithPayments> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(PLANS)
    .insert({
      user_id: input.userId,
      description: input.description,
      category: input.category,
      total_amount: input.totalAmount,
      installment_count: input.installmentCount,
      installment_amount: input.installmentAmount,
      first_due_date: input.firstDueDate,
      card_label: input.cardLabel?.trim() ? input.cardLabel.trim() : null,
      status: "active",
    })
    .select("*")
    .single();

  if (error) throw error;
  const plan = mapPlan(data as PlanRow);

  const schedule = buildPaymentSchedule({
    firstDueDate: plan.firstDueDate,
    installmentCount: plan.installmentCount,
    installmentAmount: plan.installmentAmount,
  });

  const { data: paymentRows, error: payError } = await client
    .from(PAYMENTS)
    .insert(
      schedule.map((item) => ({
        plan_id: plan.id,
        user_id: input.userId,
        sequence: item.sequence,
        due_date: item.dueDate,
        amount: item.amount,
        status: "pending",
      })),
    )
    .select("*");

  if (payError) throw payError;

  return {
    ...plan,
    payments: ((paymentRows ?? []) as PaymentRow[])
      .map(mapPayment)
      .sort((a, b) => a.sequence - b.sequence),
  };
}

export async function getInstallmentPayment(
  paymentId: string,
  userId: string,
): Promise<InstallmentPayment> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(PAYMENTS)
    .select("*")
    .eq("id", paymentId)
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return mapPayment(data as PaymentRow);
}

export async function getInstallmentPlan(
  planId: string,
  userId: string,
): Promise<InstallmentPlan> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(PLANS)
    .select("*")
    .eq("id", planId)
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return mapPlan(data as PlanRow);
}

export async function markInstallmentPaymentPaid(
  paymentId: string,
  userId: string,
  transactionId?: string | null,
): Promise<InstallmentPayment> {
  const client = getSupabaseClient();
  const patch: {
    status: string;
    paid_at: string;
    transaction_id?: string;
  } = {
    status: "paid",
    paid_at: new Date().toISOString(),
  };
  if (transactionId) {
    patch.transaction_id = transactionId;
  }

  const { data, error } = await client
    .from(PAYMENTS)
    .update(patch)
    .eq("id", paymentId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return mapPayment(data as PaymentRow);
}

export async function deleteInstallmentPlan(
  planId: string,
  userId: string,
): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from(PLANS)
    .delete()
    .eq("id", planId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function refreshPlanStatusIfComplete(
  planId: string,
  userId: string,
): Promise<void> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(PAYMENTS)
    .select("status")
    .eq("plan_id", planId)
    .eq("user_id", userId);

  if (error) throw error;
  const rows = (data ?? []) as Array<{ status: string }>;
  if (rows.length === 0) return;
  const allDone = rows.every((r) => r.status === "paid" || r.status === "skipped");
  if (!allDone) return;

  await client
    .from(PLANS)
    .update({ status: "completed" })
    .eq("id", planId)
    .eq("user_id", userId);
}
