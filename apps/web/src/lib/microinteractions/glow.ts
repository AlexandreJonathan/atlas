import { prefersReducedMotion } from "./preferences";

function resolveTarget(target?: HTMLElement | string | null): HTMLElement | null {
  if (!target) return null;
  if (typeof target === "string") {
    return document.querySelector(target);
  }
  return target;
}

/**
 * Aplica glow temporário em um card/elemento (saldo aumentou, sync, etc.).
 */
export function pulseGlow(
  target?: HTMLElement | string | null,
  className = "atlas-mi-glow",
  durationMs = 1200,
): void {
  if (prefersReducedMotion()) return;
  const el = resolveTarget(target);
  if (!el) return;

  el.classList.remove(className);
  // force reflow para reiniciar animação
  void el.offsetWidth;
  el.classList.add(className);

  window.setTimeout(() => {
    el.classList.remove(className);
  }, durationMs);
}

/** Marca elemento como sincronizando (ícone/spin CSS). */
export function setSyncing(target: HTMLElement | string | null | undefined, syncing: boolean): void {
  const el = resolveTarget(target);
  if (!el) return;
  el.classList.toggle("atlas-mi-syncing", syncing);
}
