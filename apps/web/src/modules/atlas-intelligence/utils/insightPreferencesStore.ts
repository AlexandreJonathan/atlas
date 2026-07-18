import type { InsightTone } from "../types";
import type { RecommendationCategory } from "../types/recommendation";

export type InsightFeedbackValue = "useful" | "not_useful";

export type InsightHistoryEntry = {
  id: string;
  title: string;
  description: string;
  tone: InsightTone;
  category: string;
  sourceRule?: string;
  seenAt: string;
  dismissedAt?: string;
  feedback?: InsightFeedbackValue;
};

type PreferencesState = {
  dismissedIds: string[];
  feedbackById: Record<string, InsightFeedbackValue>;
  history: InsightHistoryEntry[];
};

const STORAGE_KEY = "atlas.insightPreferences.v1";
const MAX_HISTORY = 50;

type Listener = (state: PreferencesState) => void;

const listeners = new Set<Listener>();

function emptyState(): PreferencesState {
  return { dismissedIds: [], feedbackById: {}, history: [] };
}

function readStorage(): PreferencesState {
  if (typeof localStorage === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<PreferencesState>;
    return {
      dismissedIds: Array.isArray(parsed.dismissedIds) ? parsed.dismissedIds : [],
      feedbackById:
        parsed.feedbackById && typeof parsed.feedbackById === "object"
          ? parsed.feedbackById
          : {},
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return emptyState();
  }
}

let state: PreferencesState = readStorage();

function persist(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota / private mode — preferências ficam só em memória
  }
}

function emit(): void {
  for (const listener of listeners) listener(state);
}

export function getInsightPreferences(): Readonly<PreferencesState> {
  return state;
}

export function subscribeInsightPreferences(listener: Listener): () => void {
  listeners.add(listener);
  queueMicrotask(() => listener(state));
  return () => listeners.delete(listener);
}

export function isInsightDismissed(id: string): boolean {
  return state.dismissedIds.includes(id);
}

export function filterActiveInsights<T extends { id: string }>(items: T[]): T[] {
  const dismissed = new Set(state.dismissedIds);
  return items.filter((item) => !dismissed.has(item.id));
}

export function recordInsightsSeen(
  items: Array<{
    id: string;
    title: string;
    description: string;
    tone: InsightTone;
    category: string | RecommendationCategory;
    sourceRule?: string;
  }>,
): void {
  if (items.length === 0) return;
  const now = new Date().toISOString();
  const byId = new Map(state.history.map((h) => [h.id, h]));
  for (const item of items) {
    const prev = byId.get(item.id);
    byId.set(item.id, {
      id: item.id,
      title: item.title,
      description: item.description,
      tone: item.tone,
      category: item.category,
      sourceRule: item.sourceRule,
      seenAt: prev?.seenAt ?? now,
      dismissedAt: prev?.dismissedAt,
      feedback: prev?.feedback ?? state.feedbackById[item.id],
    });
  }
  state = {
    ...state,
    history: Array.from(byId.values())
      .sort((a, b) => b.seenAt.localeCompare(a.seenAt))
      .slice(0, MAX_HISTORY),
  };
  persist();
  emit();
}

export function dismissInsight(id: string): void {
  if (state.dismissedIds.includes(id)) return;
  const now = new Date().toISOString();
  state = {
    ...state,
    dismissedIds: [...state.dismissedIds, id],
    history: state.history.map((h) =>
      h.id === id ? { ...h, dismissedAt: now } : h,
    ),
  };
  persist();
  emit();
}

export function setInsightFeedback(
  id: string,
  feedback: InsightFeedbackValue,
): void {
  state = {
    ...state,
    feedbackById: { ...state.feedbackById, [id]: feedback },
    history: state.history.map((h) =>
      h.id === id ? { ...h, feedback } : h,
    ),
  };
  persist();
  emit();
}

export function getInsightHistory(): InsightHistoryEntry[] {
  return state.history;
}

/** Estrutura para personalização futura (pesos por categoria / sourceRule). */
export function getFeedbackSignals(): {
  usefulByCategory: Record<string, number>;
  notUsefulByCategory: Record<string, number>;
  dismissedCount: number;
} {
  const usefulByCategory: Record<string, number> = {};
  const notUsefulByCategory: Record<string, number> = {};
  for (const entry of state.history) {
    if (entry.feedback === "useful") {
      usefulByCategory[entry.category] =
        (usefulByCategory[entry.category] ?? 0) + 1;
    } else if (entry.feedback === "not_useful") {
      notUsefulByCategory[entry.category] =
        (notUsefulByCategory[entry.category] ?? 0) + 1;
    }
  }
  return {
    usefulByCategory,
    notUsefulByCategory,
    dismissedCount: state.dismissedIds.length,
  };
}

export function __resetInsightPreferencesForTests(): void {
  state = emptyState();
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  listeners.clear();
}
