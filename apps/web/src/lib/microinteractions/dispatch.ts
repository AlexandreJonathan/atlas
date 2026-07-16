import { pulseGlow, setSyncing } from "./glow";
import { triggerHaptic } from "./haptic";
import { playMoneyRain } from "./moneyRain";
import { playMoneySound, playTapSound } from "./sound";
import { showToast } from "./toast/toastStore";
import type { MicrointeractionEvent, MicrointeractionOptions, ToastTone } from "./types";

function toastToneFor(event: MicrointeractionEvent): ToastTone | null {
  if (event === "success" || event === "money_in" || event === "bank_connected" || event === "celebration") {
    return "success";
  }
  if (event === "error") return "error";
  if (event === "warning") return "warning";
  if (event === "info" || event === "bank_sync") return "info";
  return null;
}

function defaultMessage(event: MicrointeractionEvent): string | undefined {
  switch (event) {
    case "money_in":
      return "Receita registrada";
    case "bank_connected":
      return "Banco conectado com sucesso";
    case "bank_sync":
      return "Sincronizando bancos...";
    case "celebration":
      return "Conquista desbloqueada";
    case "success":
      return "Tudo certo";
    case "error":
      return "Algo deu errado";
    case "warning":
      return "Atenção";
    case "info":
      return "Informação";
    default:
      return undefined;
  }
}

/**
 * Dispara uma microinteração premium (som, chuva, glow, toast, haptic).
 * Sempre seguro chamar — respeita prefers-reduced-motion e preferência de som.
 */
export function triggerMicrointeraction(
  event: MicrointeractionEvent,
  options: MicrointeractionOptions = {},
): void {
  const intensity = options.intensity ?? 0.75;
  const message = options.message ?? defaultMessage(event);
  const wantToast = options.toast !== false;
  const wantSound = options.sound !== false;
  const wantRain = options.moneyRain !== false;

  if (event === "tap") {
    playTapSound(intensity);
    triggerHaptic(10);
    return;
  }

  if (event === "bank_sync") {
    if (wantSound) playTapSound(0.35);
    setSyncing(options.target, true);
    if (wantToast && message) {
      showToast({ tone: "info", title: options.title, message });
    }
    return;
  }

  if (event === "money_in" || event === "celebration") {
    if (wantSound) playMoneySound(intensity);
    if (wantRain) playMoneyRain(intensity);
    triggerHaptic([10, 40, 14]);
    pulseGlow(options.target ?? ".atlas-wealth-hero");
    if (wantToast && message) {
      const amountLabel =
        typeof options.amount === "number"
          ? ` ${options.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
          : "";
      showToast({
        tone: "success",
        title: options.title ?? (event === "money_in" ? "Dinheiro entrou" : "Celebração"),
        message: `${message}${amountLabel}`.trim(),
      });
    }
    return;
  }

  if (event === "bank_connected") {
    if (wantSound) playMoneySound(intensity * 0.85);
    if (wantRain) playMoneyRain(intensity * 0.6);
    triggerHaptic([8, 30, 12]);
    const el =
      typeof options.target === "string" || options.target instanceof HTMLElement
        ? options.target
        : null;
    if (el) {
      const node = typeof el === "string" ? document.querySelector(el) : el;
      node?.classList.add("atlas-mi-bank-connected");
      window.setTimeout(() => node?.classList.remove("atlas-mi-bank-connected"), 500);
    }
    pulseGlow(options.target);
    if (wantToast && message) {
      showToast({ tone: "success", title: options.title ?? "Open Finance", message });
    }
    return;
  }

  const tone = toastToneFor(event);
  if (tone && wantToast && message) {
    showToast({ tone, title: options.title, message });
  }

  if (event === "success" && wantSound) {
    playTapSound(0.45);
    triggerHaptic(12);
  }

  if (event === "error") {
    triggerHaptic([30, 40, 30]);
  }
}
