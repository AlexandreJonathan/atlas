import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetInsightPreferencesForTests,
  dismissInsight,
  filterActiveInsights,
  getFeedbackSignals,
  getInsightHistory,
  recordInsightsSeen,
  setInsightFeedback,
} from "./insightPreferencesStore";

describe("insightPreferencesStore", () => {
  beforeEach(() => {
    __resetInsightPreferencesForTests();
  });

  it("registra histórico, dismiss e feedback", () => {
    recordInsightsSeen([
      {
        id: "rec-1",
        title: "Compromisso",
        description: "R$ 100 em parcelas",
        tone: "atencao",
        category: "despesas",
        sourceRule: "installments",
      },
    ]);

    expect(getInsightHistory()).toHaveLength(1);

    setInsightFeedback("rec-1", "useful");
    dismissInsight("rec-1");

    expect(filterActiveInsights([{ id: "rec-1" }, { id: "rec-2" }])).toEqual([
      { id: "rec-2" },
    ]);
    expect(getInsightHistory()[0]?.feedback).toBe("useful");
    expect(getInsightHistory()[0]?.dismissedAt).toBeTruthy();

    const signals = getFeedbackSignals();
    expect(signals.usefulByCategory.despesas).toBe(1);
    expect(signals.dismissedCount).toBe(1);
  });
});
