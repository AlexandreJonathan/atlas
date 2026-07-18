import type { InsightTone } from "../../types";
import type { Recommendation, RecommendationCategory } from "../../types/recommendation";
import { formatMoneyBRL } from "../../utils/format";

export function nowISO(): string {
  return new Date().toISOString();
}

export function recommendation(partial: {
  id: string;
  title: string;
  description: string;
  priority: number;
  category: RecommendationCategory;
  suggestedAction: string;
  tone: InsightTone;
  sourceRule: string;
  createdAt?: string;
}): Recommendation {
  return {
    ...partial,
    createdAt: partial.createdAt ?? nowISO(),
  };
}

export { formatMoneyBRL };

export function percentDelta(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
