/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Feature flags opcionais (true/false). Defaults em `src/config/AppConfig.ts`. */
  readonly VITE_FF_OPENAI?: string;
  readonly VITE_FF_OPEN_FINANCE?: string;
  readonly VITE_FF_INVESTMENTS?: string;
  readonly VITE_FF_NOTIFICATIONS?: string;
  readonly VITE_FF_SMART_GOALS?: string;
  readonly VITE_FF_BUDGET_PLANNER?: string;
  readonly VITE_FF_FINANCIAL_PLANNER?: string;
  readonly VITE_FF_ATLAS_INTELLIGENCE_V2?: string;
  /** Provider Open Finance pretendido: `mock` | `pluggy` (pluggy só após integração). */
  readonly VITE_OF_PROVIDER?: string;
  /** Financial Data Layer: `mock` (default) | `pluggy` (stub OF via PluggyProvider). */
  readonly VITE_FINANCIAL_DATA_PROVIDER?: string;
  /** DSN do Sentry (opcional). Sem valor, o SDK não é carregado. */
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
