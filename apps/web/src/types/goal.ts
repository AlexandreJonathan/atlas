import type { z } from "zod";
import type { goalContributionSchema, goalSchema } from "../validations/goalSchema";

/** Categorias Smart Goals (Atlas v1.0). */
export const GOAL_CATEGORIES = [
  "emergency",
  "travel",
  "purchase",
  "debt",
  "education",
  "investment",
  "other",
] as const;

export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

/** Status persistido — progresso % continua derivado dos valores. */
export const GOAL_STATUSES = ["active", "completed", "paused", "cancelled"] as const;

export type GoalStatus = (typeof GOAL_STATUSES)[number];

export const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
  emergency: "Reserva de emergência",
  travel: "Viagem",
  purchase: "Compra",
  debt: "Dívida",
  education: "Educação",
  investment: "Investimento",
  other: "Outro",
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  active: "Em andamento",
  completed: "Concluída",
  paused: "Pausada",
  cancelled: "Cancelada",
};

export type Goal = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  /** Prazo (deadline) — coluna `target_date` no banco. */
  targetDate: string | null;
  category: GoalCategory;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
};

export type GoalFormData = z.infer<typeof goalSchema>;
export type GoalContributionFormData = z.infer<typeof goalContributionSchema>;
