import { getSupabaseClient } from "../lib/supabase";
import type { FinancialProfile } from "../types/financialProfile";

const TABLE = "financial_profiles";

// Ver observação equivalente em transactionsService.ts/billsService.ts sobre
// a ausência de tipos gerados do schema do Supabase.
type FinancialProfileRow = {
  user_id: string;
  monthly_income: number;
  minimum_reserve: number;
  updated_at: string;
};

function mapRowToProfile(row: FinancialProfileRow): FinancialProfile {
  return {
    userId: row.user_id,
    monthlyIncome: Number(row.monthly_income),
    minimumReserve: Number(row.minimum_reserve),
    updatedAt: row.updated_at,
  };
}

// Retorna `null` (não é erro) quando o usuário ainda não configurou seu
// perfil — `maybeSingle` evita o erro "no rows" que `.single()` lançaria.
export async function getProfile(userId: string): Promise<FinancialProfile | null> {
  const client = getSupabaseClient();

  const { data, error } = await client.from(TABLE).select("*").eq("user_id", userId).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapRowToProfile(data as FinancialProfileRow);
}

export type UpsertFinancialProfileInput = {
  userId: string;
  monthlyIncome: number;
  minimumReserve: number;
};

// "upsert" em vez de create/update separados: o perfil é 1:1 por usuário
// (user_id é a própria chave primária), então salvar sempre substitui o
// valor existente ou cria um novo, sem o caller precisar saber qual dos
// dois casos se aplica.
export async function upsertProfile(input: UpsertFinancialProfileInput): Promise<FinancialProfile> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(TABLE)
    .upsert(
      {
        user_id: input.userId,
        monthly_income: input.monthlyIncome,
        minimum_reserve: input.minimumReserve,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single();

  if (error) throw error;

  return mapRowToProfile(data as FinancialProfileRow);
}
