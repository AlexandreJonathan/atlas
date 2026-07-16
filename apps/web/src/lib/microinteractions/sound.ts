import { isSoundEnabled, prefersReducedMotion } from "./preferences";

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  return audioCtx;
}

/**
 * Som sintético de "dinheiro" / moeda via Web Audio API.
 * Sem assets externos — leve e sem dependências.
 */
export function playMoneySound(intensity = 0.7): void {
  if (prefersReducedMotion() || !isSoundEnabled()) return;

  const ctx = getContext();
  if (!ctx) return;

  void ctx.resume().catch(() => undefined);

  const now = ctx.currentTime;
  const gainMaster = ctx.createGain();
  gainMaster.gain.value = Math.min(1, Math.max(0.05, intensity)) * 0.18;
  gainMaster.connect(ctx.destination);

  const notes = [880, 1174.66, 1396.91];
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const t0 = now + index * 0.055;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(1, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
    osc.connect(gain);
    gain.connect(gainMaster);
    osc.start(t0);
    osc.stop(t0 + 0.24);
  });
}

/** Clique curto para tap / sync. */
export function playTapSound(intensity = 0.4): void {
  if (prefersReducedMotion() || !isSoundEnabled()) return;
  const ctx = getContext();
  if (!ctx) return;
  void ctx.resume().catch(() => undefined);

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 420;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(Math.min(1, intensity) * 0.08, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.09);
}
