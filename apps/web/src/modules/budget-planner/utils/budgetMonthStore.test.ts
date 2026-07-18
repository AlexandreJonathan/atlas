import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetSharedBudgetForTests,
  budgetMonthKey,
  getSharedBudgetState,
  loadSharedBudgetMonth,
} from "./budgetMonthStore";

describe("budgetMonthStore", () => {
  beforeEach(() => {
    __resetSharedBudgetForTests();
  });

  it("deduplica fetches concorrentes do mesmo mês", async () => {
    const fetcher = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                id: "b1",
                userId: "u1",
                year: 2026,
                month: 7,
                status: "active",
                notes: null,
                categories: [],
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-01T00:00:00.000Z",
              }),
            20,
          );
        }),
    );

    const key = budgetMonthKey("u1", 2026, 7);
    await Promise.all([
      loadSharedBudgetMonth(key, fetcher),
      loadSharedBudgetMonth(key, fetcher),
    ]);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(getSharedBudgetState().budget?.id).toBe("b1");
    expect(getSharedBudgetState().loaded).toBe(true);
  });
});
