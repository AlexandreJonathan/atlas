import { FeatureFlagService } from "./FeatureFlagService";
import type {
  ActiveProviders,
  AppConfig,
  AppEnvironment,
  AtlasAiProviderId,
  FeatureFlags,
  FinancialDataProviderId,
  OpenFinanceProviderId,
} from "./types";

/** Manter alinhado a `apps/web/package.json`. */
export const APP_VERSION = "0.9.2";

function resolveEnvironment(): AppEnvironment {
  const mode = import.meta.env.MODE;
  if (mode === "production") return "production";
  if (mode === "test") return "test";
  return "development";
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === "") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function resolveFeatureFlags(): FeatureFlags {
  // Defaults = comportamento atual da RC (sem mudar UX).
  return {
    openai: parseBool(import.meta.env.VITE_FF_OPENAI, false),
    openFinance: parseBool(import.meta.env.VITE_FF_OPEN_FINANCE, true),
    investments: parseBool(import.meta.env.VITE_FF_INVESTMENTS, true),
    notifications: parseBool(import.meta.env.VITE_FF_NOTIFICATIONS, false),
  };
}

function resolveProviders(flags: FeatureFlags): ActiveProviders {
  const ofEnv = import.meta.env.VITE_OF_PROVIDER?.trim().toLowerCase();
  const openFinance: OpenFinanceProviderId =
    flags.openFinance && ofEnv === "pluggy" ? "pluggy" : "mock";

  // OpenAI (chat via Edge Function) só quando a flag estiver ligada.
  const atlasAi: AtlasAiProviderId = flags.openai ? "openai" : "mock";

  const fdEnv = import.meta.env.VITE_FINANCIAL_DATA_PROVIDER?.trim().toLowerCase();
  const financialData: FinancialDataProviderId = fdEnv === "pluggy" ? "pluggy" : "mock";

  return { openFinance, atlasAi, financialData };
}

function resolveObservability(): AppConfig["observability"] {
  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();
  return { sentryDsn: dsn ? dsn : null };
}

function createAppConfig(): AppConfig {
  const env = resolveEnvironment();
  const featureFlags = resolveFeatureFlags();
  return {
    env,
    version: APP_VERSION,
    isDev: env === "development",
    isProd: env === "production",
    featureFlags,
    providers: resolveProviders(featureFlags),
    observability: resolveObservability(),
  };
}

/** Configuração imutável do app — criada uma vez no boot. */
export const appConfig: AppConfig = createAppConfig();

/** Serviço de feature flags alimentado por `appConfig`. */
export const featureFlagService = new FeatureFlagService(appConfig.featureFlags);
