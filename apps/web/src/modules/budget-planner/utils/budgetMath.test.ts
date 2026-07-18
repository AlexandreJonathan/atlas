import { describe, expect, it } from "vitest";
import type { BudgetWithCategories } from "../../../types/budget";
import type { Transaction } from "../../../types/transaction";
import {
  alertLevel,
  budgetCapacityForGoals,
  buildBudgetMonthSummary,
  buildCategorySpendViews,
  isTransactionInMonth,
  sumSpentByCategory,
} from "./budgetMath";

const budget: BudgetWithCategories = {
  id: "b1",
  userId: "u1",
  year: 2026,
  month: 7,
  status: "active",
  notes: null,
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
  categories: [
    {
      id: "c1",
      budgetId: "b1",
      userId: "u1",
      category: "food",
      limitAmount: 1000,
      createdAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
    },
    {
      id: "c2",
      budgetId: "b1",
      userId: "u1",
      category: "transport",
      limitAmount: 500,
      createdAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
    },
  ],
};

function tx(
  partial: Partial<Transaction> & Pick<Transaction, "amount" | "createdAt" | "type">,
): Transaction {
  return {
    id: partial.id ?? "t",
    userId: "u1",
    description: partial.description ?? "item",
    category: partial.category ?? "food",
    ...partial,
  };
}

describe("budgetMath", () => {
  it("classifica alertas por uso do limite", () => {
    expect(alertLevel(0.5)).toBe("ok");
    expect(alertLevel(0.8)).toBe("warning");
    expect(alertLevel(1)).toBe("exceeded");
  });

  it("soma apenas despesas do mês na categoria", () => {
    const transactions = [
      tx({ type: "despesa", amount: 200, category: "food", createdAt: "2026-07-10T12:00:00.000Z" }),
      tx({ type: "despesa", amount: 50, category: "food", createdAt: "2026-06-10T12:00:00.000Z" }),
      tx({ type: "receita", amount: 1000, category: null, createdAt: "2026-07-10T12:00:00.000Z" }),
      tx({ type: "despesa", amount: 80, category: "transport", createdAt: "2026-07-15T12:00:00.000Z" }),
    ];

    const spent = sumSpentByCategory(transactions, 2026, 7);
    expect(spent.food).toBe(200);
    expect(spent.transport).toBe(80);
    expect(isTransactionInMonth(transactions[1]!, 2026, 7)).toBe(false);
  });

  it("monta views e resumo mensal com restante e alertas", () => {
    const transactions = [
      tx({ type: "despesa", amount: 900, category: "food", createdAt: "2026-07-05T12:00:00.000Z" }),
      tx({ type: "despesa", amount: 600, category: "transport", createdAt: "2026-07-05T12:00:00.000Z" }),
    ];

    const spent = sumSpentByCategory(transactions, 2026, 7);
    const views = buildCategorySpendViews(budget.categories, spent);
    expect(views).toHaveLength(2);
    expect(views.find((v) => v.category === "transport")?.alert).toBe("exceeded");
    expect(views.find((v) => v.category === "food")?.alert).toBe("warning");

    const summary = buildBudgetMonthSummary(budget, transactions);
    expect(summary?.totalLimit).toBe(1500);
    expect(summary?.totalSpent).toBe(1500);
    expect(summary?.exceededCount).toBe(1);
    expect(summary?.warningCount).toBe(1);
    expect(budgetCapacityForGoals(summary)).toBe(0);
  });
});
