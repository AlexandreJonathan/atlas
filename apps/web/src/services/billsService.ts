import { getSupabaseClient } from "../lib/supabase";
import type { Bill, BillStatus, BillType } from "../types/bill";

const TABLE = "bills";

// O client do Supabase ainda não usa tipos gerados a partir do schema
// (`supabase gen types typescript`), então `data` retorna como `any`. Os
// casts abaixo para `BillRow` documentam o formato esperado das colunas
// e devem ser revistos/removidos quando a geração de tipos for adotada
// (ver roadmap/backlog.md).
type BillRow = {
  id: string;
  user_id: string;
  type: BillType;
  description: string;
  amount: number;
  due_date: string;
  status: BillStatus;
  paid_at: string | null;
  created_at: string;
};

function mapRowToBill(row: BillRow): Bill {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    description: row.description,
    amount: Number(row.amount),
    dueDate: row.due_date,
    status: row.status,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  };
}

export async function listBills(userId: string): Promise<Bill[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as BillRow[]).map(mapRowToBill);
}

export type NewBillInput = {
  userId: string;
  type: BillType;
  description: string;
  amount: number;
  dueDate: string;
};

export async function createBill(input: NewBillInput): Promise<Bill> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(TABLE)
    .insert({
      user_id: input.userId,
      type: input.type,
      description: input.description,
      amount: input.amount,
      due_date: input.dueDate,
    })
    .select("*")
    .single();

  if (error) throw error;

  return mapRowToBill(data as BillRow);
}

// O RLS já garante que o Postgres rejeita/filtra linhas de outros usuários,
// mas o filtro por `user_id` também é aplicado aqui em defesa de profundidade
// (evita depender de uma única camada de segurança e deixa a intenção
// explícita na própria query).
export async function markBillAsPaid(id: string, userId: string): Promise<Bill> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(TABLE)
    .update({ status: "pago", paid_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;

  return mapRowToBill(data as BillRow);
}

export async function deleteBill(id: string, userId: string): Promise<void> {
  const client = getSupabaseClient();

  const { error } = await client.from(TABLE).delete().eq("id", id).eq("user_id", userId);

  if (error) throw error;
}
