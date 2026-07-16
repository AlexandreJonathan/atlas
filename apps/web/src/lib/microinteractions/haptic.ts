import { prefersReducedMotion } from "./preferences";

/** Vibração curta quando disponível (mobile). */
export function triggerHaptic(pattern: number | number[] = 12): void {
  if (prefersReducedMotion()) return;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}
