import { useEffect, useState } from "react";
import {
  dismissInsight,
  getInsightHistory,
  getInsightPreferences,
  setInsightFeedback,
  subscribeInsightPreferences,
  type InsightFeedbackValue,
  type InsightHistoryEntry,
} from "../utils/insightPreferencesStore";

export function useInsightPreferences() {
  const [history, setHistory] = useState<InsightHistoryEntry[]>(() =>
    getInsightHistory(),
  );
  const [dismissedIds, setDismissedIds] = useState<string[]>(
    () => getInsightPreferences().dismissedIds,
  );
  const [feedbackById, setFeedbackById] = useState(
    () => getInsightPreferences().feedbackById,
  );

  useEffect(
    () =>
      subscribeInsightPreferences((state) => {
        setHistory(state.history);
        setDismissedIds(state.dismissedIds);
        setFeedbackById(state.feedbackById);
      }),
    [],
  );

  return {
    history,
    dismissedIds,
    feedbackById,
    dismiss: dismissInsight,
    setFeedback: (id: string, value: InsightFeedbackValue) =>
      setInsightFeedback(id, value),
  };
}
