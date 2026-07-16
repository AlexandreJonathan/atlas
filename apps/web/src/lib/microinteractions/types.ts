/**
 * Contrato de microinterações premium da Atlas (Missão 12 / Sprint 11).
 * Camada puramente de feedback visual/sonoro — sem regras de negócio.
 */

export type MicrointeractionEvent =
  | "celebration"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "tap"
  | "money_in"
  | "bank_connected"
  | "bank_sync";

export type ToastTone = "success" | "error" | "warning" | "info";

export type MicrointeractionOptions = {
  /** Intensidade relativa (0–1), para vibração/som. */
  intensity?: number;
  /** Mensagem de toast (quando aplicável). */
  message?: string;
  /** Título opcional do toast. */
  title?: string;
  /** Valor monetário associado (ex.: receita). */
  amount?: number;
  /** Se false, não toca som mesmo quando o evento normalmente tocaria. */
  sound?: boolean;
  /** Se false, não mostra toast. */
  toast?: boolean;
  /** Se false, não dispara chuva de dinheiro. */
  moneyRain?: boolean;
  /** Elemento ou seletor CSS para glow / sync. */
  target?: HTMLElement | string | null;
};
