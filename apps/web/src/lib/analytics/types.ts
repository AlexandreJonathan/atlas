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
  | "atlas_ai_chat_fallback"
  | "atlas_ai_rate_limited"
  | "atlas_ai_tool_called"
  | "atlas_ai_tool_success"
  | "atlas_ai_tool_error"
  | "atlas_ai_agent_turn"
  | "atlas_ai_agent_completed"
  | "pluggy_connect_started"
  | "pluggy_connect_success"
  | "pluggy_connect_error"
  | "pluggy_disconnect"
  | "pluggy_sync_started"
  | "pluggy_sync_success"
  | "pluggy_sync_error"
  | "smart_goals_opened"
  | "smart_goal_created"
  | "smart_goal_contribution"
  | "smart_goal_updated"
  | "smart_goal_deleted"
  | "budget_planner_opened"
  | "budget_month_ensured"
  | "budget_category_limit_set"
  | "budget_category_limit_removed";

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
