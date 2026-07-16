import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./preferences";

type AnimatedNumberProps = {
  value: number;
  /** Formata o valor exibido (default: moeda BRL). */
  format?: (value: number) => string;
  durationMs?: number;
  className?: string;
};

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Contador animado 60fps via rAF — atualiza só o textContent do nó
 * (sem setState / re-renders a cada frame).
 */
function AnimatedNumber({
  value,
  format = formatBRL,
  durationMs = 700,
  className,
}: AnimatedNumberProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const fromRef = useRef(value);

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      fromRef.current = value;
      el.textContent = format(value);
      return;
    }

    const from = fromRef.current;
    const to = value;
    if (from === to) {
      el.textContent = format(to);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      const next = from + (to - from) * eased;
      el.textContent = format(next);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
        el.textContent = format(to);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      fromRef.current = to;
    };
  }, [value, durationMs, format]);

  return (
    <span ref={nodeRef} className={className}>
      {format(value)}
    </span>
  );
}

export default AnimatedNumber;
