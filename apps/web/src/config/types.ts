/** Ambiente de runtime da aplicação (derivado de `import.meta.env`). */
export type AppEnvironment = "development" | "production" | "test";

/** Provedor ativo de Open Finance (Adapter/Provider — Sprint 10). */
export type OpenFinanceProviderId = "mock" | "pluggy";

/** Provedor ativo de Atlas Intelligence (Adapter/Provider — Sprint 12). */
export type AtlasAiProviderId = "mock" | "openai";

/** Chaves de feature flag suportadas pela fundação de qualidade. */
export type FeatureFlagKey =
  | "openai"
  | "openFinance"
  | "investments"
  | "notifications";

export type FeatureFlags = Record<FeatureFlagKey, boolean>;

export type ActiveProviders = {
  openFinance: OpenFinanceProviderId;
  atlasAi: AtlasAiProviderId;
};

export type AppConfig = {
  env: AppEnvironment;
  version: string;
  isDev: boolean;
  isProd: boolean;
  featureFlags: FeatureFlags;
  providers: ActiveProviders;
};
