/** Ambiente de runtime da aplicação (derivado de `import.meta.env`). */
export type AppEnvironment = "development" | "production" | "test";

/** Provedor ativo de Open Finance (Adapter/Provider — Sprint 10). */
export type OpenFinanceProviderId = "mock" | "pluggy";

/** Provedor ativo de Atlas Intelligence (Adapter/Provider — Sprint 12). */
export type AtlasAiProviderId = "mock" | "openai";

/** Provedor ativo da Financial Data Layer (Missão 20). */
export type FinancialDataProviderId = "mock" | "pluggy";

/** Chaves de feature flag suportadas pela fundação de qualidade. */
export type FeatureFlagKey =
  | "openai"
  | "openFinance"
  | "investments"
  | "notifications"
  | "smartGoals"
  | "budgetPlanner"
  | "financialPlanner";

export type FeatureFlags = Record<FeatureFlagKey, boolean>;

export type ActiveProviders = {
  openFinance: OpenFinanceProviderId;
  atlasAi: AtlasAiProviderId;
  financialData: FinancialDataProviderId;
};

export type ObservabilityConfig = {
  /** DSN do Sentry; vazio = SDK não inicializa. */
  sentryDsn: string | null;
};

export type AppConfig = {
  env: AppEnvironment;
  version: string;
  isDev: boolean;
  isProd: boolean;
  featureFlags: FeatureFlags;
  providers: ActiveProviders;
  observability: ObservabilityConfig;
};
