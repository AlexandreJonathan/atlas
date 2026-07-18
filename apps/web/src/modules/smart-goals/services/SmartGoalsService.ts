import { analytics } from "../../../lib/analytics";
import { logger } from "../../../lib/logging";
import {
  createGoal,
  deleteGoal,
  listGoals,
  updateGoal,
  updateGoalProgress,
  type NewGoalInput,
  type UpdateGoalInput,
} from "../../../services/goalsService";
import type { Goal } from "../../../types/goal";
import {
  buildSmartGoalsSummary,
  type SmartGoalsSummary,
} from "../utils/goalMath";

/**
 * Porta de domínio Smart Goals — Repository via goalsService (Supabase).
 * UI e Intelligence não acessam o client diretamente.
 */
export class SmartGoalsService {
  async list(userId: string): Promise<Goal[]> {
    return listGoals(userId);
  }

  async create(input: NewGoalInput): Promise<Goal> {
    const goal = await createGoal(input);
    analytics.track("smart_goal_created", {
      category: goal.category,
      hasDeadline: Boolean(goal.targetDate),
    });
    logger.info("Smart Goal criada", { goalId: goal.id, category: goal.category });
    return goal;
  }

  async contribute(id: string, userId: string, amount: number): Promise<Goal> {
    const goals = await listGoals(userId);
    const current = goals.find((g) => g.id === id);
    if (!current) throw new Error("Meta não encontrada.");
    const next = await updateGoalProgress(id, userId, current.currentAmount + amount);
    analytics.track("smart_goal_contribution", {
      goalId: id,
      amount,
      status: next.status,
    });
    return next;
  }

  async update(id: string, userId: string, patch: UpdateGoalInput): Promise<Goal> {
    const goal = await updateGoal(id, userId, patch);
    analytics.track("smart_goal_updated", { goalId: id, status: goal.status });
    return goal;
  }

  async remove(id: string, userId: string): Promise<void> {
    await deleteGoal(id, userId);
    analytics.track("smart_goal_deleted", { goalId: id });
  }

  summarize(goals: Goal[]): SmartGoalsSummary {
    return buildSmartGoalsSummary(goals);
  }
}

export const smartGoalsService = new SmartGoalsService();
