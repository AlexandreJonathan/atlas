/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Feature flags opcionais (true/false). Defaults em `src/config/AppConfig.ts`. */
  readonly VITE_FF_OPENAI?: string;
  readonly VITE_FF_OPEN_FINANCE?: string;
  readonly VITE_FF_INVESTMENTS?: string;
  readonly VITE_FF_NOTIFICATIONS?: string;
  /** Provider Open Finance pretendido: `mock` | `pluggy` (pluggy só após integração). */
  readonly VITE_OF_PROVIDER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
