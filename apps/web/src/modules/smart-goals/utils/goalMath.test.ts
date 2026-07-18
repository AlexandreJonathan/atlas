import { describe, expect, it } from "vitest";
import type { Goal } from "../../../types/goal";
import {
  buildSmartGoalsSummary,
  goalProgressPercent,
  remainingTime,
} from "./goalMath";

function goal(partial: Partial<Goal> & Pick<Goal, "id" | "title">): Goal {
  return {
    userId: "u1",
    description: null,
    targetAmount: 1000,
    currentAmount: 250,
    targetDate: "2026-08-01",
    category: "other",
    status: "active",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...partial,
  };
}

describe("goalMath — Smart Goals", () => {
  it("calcula percentual de progresso", () => {
    expect(goalProgressPercent(goal({ id: "1", title: "A", currentAmount: 250 }))).toBe(25);
    expect(goalProgressPercent(goal({ id: "2", title: "B", currentAmount: 1000 }))).toBe(100);
  });

  it("remainingTime marca atraso e dias restantes", () => {
    const today = new Date("2026-07-18T12:00:00");
    expect(remainingTime(goal({ id: "1", title: "A", targetDate: "2026-07-10" }), today).overdue).toBe(
      true,
    );
    expect(remainingTime(goal({ id: "2", title: "B", targetDate: "2026-07-20" }), today).days).toBe(
      2,
    );
    expect(remainingTime(goal({ id: "3", title: "C", targetDate: null }), today).label).toBe(
      "Sem prazo",
    );
  });

  it("buildSmartGoalsSummary agrega totais e meta mais próxima", () => {
    const summary = buildSmartGoalsSummary([
      goal({ id: "1", title: "Longe", targetDate: "2026-12-01", currentAmount: 100 }),
      goal({
        id: "2",
        title: "Perto",
        targetDate: "2026-08-01",
        currentAmount: 500,
        status: "active",
      }),
      goal({
        id: "3",
        title: "Feita",
        status: "completed",
        currentAmount: 1000,
        targetDate: "2026-07-01",
      }),
    ]);

    expect(summary.total).toBe(3);
    expect(summary.completed).toBe(1);
    expect(summary.active).toBe(2);
    expect(summary.nearest?.title).toBe("Perto");
    expect(summary.overallProgressPercent).toBeGreaterThan(0);
  });
});
