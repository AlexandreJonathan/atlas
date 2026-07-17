import { FeatureFlagService } from "./FeatureFlagService";
import type {
  ActiveProviders,
  AppConfig,
  AppEnvironment,
  AtlasAiProviderId,
  FeatureFlags,
  OpenFinanceProviderId,
} from "./types";

/** Manter alinhado a `apps/web/package.json`. */
export const APP_VERSION = "0.9.0";

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

  return { openFinance, atlasAi };
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
  };
}

/** Configuração imutável do app — criada uma vez no boot. */
export const appConfig: AppConfig = createAppConfig();

/** Serviço de feature flags alimentado por `appConfig`. */
export const featureFlagService = new FeatureFlagService(appConfig.featureFlags);
