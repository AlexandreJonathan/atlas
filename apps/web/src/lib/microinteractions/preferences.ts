/** Preferências locais de microinteração (sem backend). */

const SOUND_KEY = "atlas.mi.sound";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = window.localStorage.getItem(SOUND_KEY);
    if (stored === "0") return false;
    if (stored === "1") return true;
  } catch {
    // storage indisponível
  }
  return true;
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(SOUND_KEY, enabled ? "1" : "0");
  } catch {
    // ignore
  }
}
