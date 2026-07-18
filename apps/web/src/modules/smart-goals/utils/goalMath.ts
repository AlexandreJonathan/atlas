import type { Goal } from "../../../types/goal";

export function goalProgressRatio(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(1, Math.max(0, goal.currentAmount / goal.targetAmount));
}

export function goalProgressPercent(goal: Goal): number {
  return Math.round(goalProgressRatio(goal) * 100);
}

export type RemainingTime = {
  label: string;
  overdue: boolean;
  days: number | null;
};

/** Tempo restante até o deadline (`targetDate`). */
export function remainingTime(goal: Goal, today = new Date()): RemainingTime {
  if (!goal.targetDate) {
    return { label: "Sem prazo", overdue: false, days: null };
  }

  const end = new Date(`${goal.targetDate}T12:00:00`);
  const start = new Date(today);
  start.setHours(12, 0, 0, 0);
  const diffMs = end.getTime() - start.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (goal.status === "completed") {
    return { label: "Concluída", overdue: false, days };
  }
  if (days < 0) {
    return { label: `${Math.abs(days)} dia(s) em atraso`, overdue: true, days };
  }
  if (days === 0) {
    return { label: "Vence hoje", overdue: false, days: 0 };
  }
  if (days === 1) {
    return { label: "1 dia restante", overdue: false, days: 1 };
  }
  return { label: `${days} dias restantes`, overdue: false, days };
}

export type SmartGoalsSummary = {
  total: number;
  completed: number;
  active: number;
  overallProgressPercent: number;
  nearest: Goal | null;
};

export function buildSmartGoalsSummary(goals: Goal[]): SmartGoalsSummary {
  const total = goals.length;
  const completed = goals.filter((g) => g.status === "completed").length;
  const active = goals.filter((g) => g.status === "active").length;

  let weighted = 0;
  let weight = 0;
  for (const goal of goals) {
    if (goal.status === "cancelled") continue;
    weighted += goalProgressRatio(goal) * goal.targetAmount;
    weight += goal.targetAmount;
  }
  const overallProgressPercent =
    weight > 0 ? Math.round((weighted / weight) * 100) : 0;

  const nearest =
    goals
      .filter((g) => g.status === "active" && g.targetDate)
      .slice()
      .sort((a, b) => String(a.targetDate).localeCompare(String(b.targetDate)))[0] ??
    goals.find((g) => g.status === "active") ??
    null;

  return {
    total,
    completed,
    active,
    overallProgressPercent,
    nearest,
  };
}
