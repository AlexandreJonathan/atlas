/**
 * Eventos de produto rastreados pela fundação de analytics.
 * Nenhum envio externo nesta sprint — apenas buffer local + log.
 */
export type AnalyticsEventName =
  | "login"
  | "sign_up"
  | "onboarding_completed"
  | "home_opened"
  | "connect_bank_clicked"
  | "atlas_ai_opened"
  | "atlas_ai_chat_success"
  | "atlas_ai_chat_fallback";

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  timestamp: string;
  properties?: AnalyticsProperties;
};

/** Destino futuro (Segment, PostHog, etc.) — no-op nesta sprint. */
export interface AnalyticsSink {
  track(event: AnalyticsEvent): void;
}
