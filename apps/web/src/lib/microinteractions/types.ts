/**
 * Contrato futuro de microinterações (Sprint 8+).
 * Nesta missão a API existe, mas a implementação é no-op.
 */
export type MicrointeractionEvent = "celebration" | "success" | "error" | "tap";

export type MicrointeractionOptions = {
  /** Intensidade relativa (0–1), para vibração/som futuros. */
  intensity?: number;
};
