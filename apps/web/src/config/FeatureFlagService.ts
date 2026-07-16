import type { FeatureFlagKey, FeatureFlags } from "./types";

/**
 * Fonte única para ligar/desligar módulos sem espalhar `if` nas telas.
 * Defaults refletem o comportamento atual da RC (mocks ligados; OpenAI/notificações off).
 * Overrides opcionais via `VITE_FF_*` (ver `AppConfig`).
 */
export class FeatureFlagService {
  private readonly flags: FeatureFlags;

  constructor(flags: FeatureFlags) {
    this.flags = { ...flags };
  }

  isEnabled(key: FeatureFlagKey): boolean {
    return this.flags[key];
  }

  getAll(): FeatureFlags {
    return { ...this.flags };
  }
}
