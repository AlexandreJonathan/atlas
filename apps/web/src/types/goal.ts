import type { z } from "zod";
import type { goalContributionSchema, goalSchema } from "../validations/goalSchema";

export type Goal = {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  createdAt: string;
};

export type GoalFormData = z.infer<typeof goalSchema>;
export type GoalContributionFormData = z.infer<typeof goalContributionSchema>;
