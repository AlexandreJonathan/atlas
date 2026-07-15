import type { MicrointeractionEvent, MicrointeractionOptions } from "./types";

export type { MicrointeractionEvent, MicrointeractionOptions } from "./types";

/**
 * Dispara uma microinteração (animação, som ou vibração).
 * Implementação atual: no-op — arquitetura preparada para sprints futuras.
 *
 * Futuro esperado:
 * - celebration → confetti / animação de conquista
 * - success / error → feedback sonoro opcional
 * - tap → haptic via navigator.vibrate (quando disponível)
 */
export function triggerMicrointeraction(
  event: MicrointeractionEvent,
  options?: MicrointeractionOptions,
): void {
  void event;
  void options;
  // No-op intencional — ver roadmap/sprint-08.md
}
