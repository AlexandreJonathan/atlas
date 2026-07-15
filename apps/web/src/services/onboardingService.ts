import { getSupabaseClient } from "../lib/supabase";
import type { OnboardingStatus } from "../types/onboarding";

const TABLE = "onboarding_status";

// Ver observação equivalente em transactionsService.ts/billsService.ts sobre
// a ausência de tipos gerados do schema do Supabase.
type OnboardingStatusRow = {
  user_id: string;
  current_step: number;
  completed_at: string | null;
  updated_at: string;
};

function mapRowToStatus(row: OnboardingStatusRow): OnboardingStatus {
  return {
    userId: row.user_id,
    currentStep: row.current_step,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  };
}

// Retorna `null` (não é erro) quando o usuário ainda não iniciou o
// onboarding — mesmo padrão de `financialProfileService.getProfile`.
export async function getStatus(userId: string): Promise<OnboardingStatus | null> {
  const client = getSupabaseClient();

  const { data, error } = await client.from(TABLE).select("*").eq("user_id", userId).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapRowToStatus(data as OnboardingStatusRow);
}

export type UpsertOnboardingStatusInput = {
  userId: string;
  currentStep: number;
  completedAt?: string | null;
};

// "upsert" em vez de create/update separados: o progresso é 1:1 por usuário
// (user_id é a própria chave primária), mesmo padrão de
// `financialProfileService.upsertProfile`. `completedAt` omitido (ou
// `null`) preserva o comportamento "ainda não concluído".
export async function upsertStatus(input: UpsertOnboardingStatusInput): Promise<OnboardingStatus> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(TABLE)
    .upsert(
      {
        user_id: input.userId,
        current_step: input.currentStep,
        completed_at: input.completedAt ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single();

  if (error) throw error;

  return mapRowToStatus(data as OnboardingStatusRow);
}
