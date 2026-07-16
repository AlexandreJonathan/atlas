import { prefersReducedMotion } from "./preferences";

const OVERLAY_ID = "atlas-mi-money-rain";
const MAX_COINS = 28;
const DURATION_MS = 1800;

/**
 * Chuva de dinheiro com elementos DOM + CSS (GPU: transform/opacity).
 * Overlay único reutilizado; limpa sozinho após a animação.
 */
export function playMoneyRain(intensity = 0.7): void {
  if (typeof document === "undefined" || prefersReducedMotion()) return;

  let overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.className = "atlas-mi-money-rain";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
  }

  overlay.replaceChildren();

  const count = Math.round(12 + MAX_COINS * Math.min(1, Math.max(0.2, intensity)));
  const frag = document.createDocumentFragment();

  for (let i = 0; i < count; i += 1) {
    const coin = document.createElement("span");
    coin.className = "atlas-mi-coin";
    coin.textContent = "R$";
    const left = Math.random() * 100;
    const delay = Math.random() * 0.45;
    const duration = 1.1 + Math.random() * 0.9;
    const scale = 0.7 + Math.random() * 0.6;
    const drift = (Math.random() - 0.5) * 80;
    coin.style.left = `${left}%`;
    coin.style.setProperty("--mi-delay", `${delay}s`);
    coin.style.setProperty("--mi-duration", `${duration}s`);
    coin.style.setProperty("--mi-scale", String(scale));
    coin.style.setProperty("--mi-drift", `${drift}px`);
    frag.appendChild(coin);
  }

  overlay.appendChild(frag);

  window.setTimeout(() => {
    overlay?.replaceChildren();
  }, DURATION_MS + 400);
}
