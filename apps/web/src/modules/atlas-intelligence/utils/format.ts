import type { Insight } from "../types";

/** Ordena por prioridade (menor número primeiro) e limita. */
export function rankInsights(insights: Insight[], limit = 3): Insight[] {
  return [...insights]
    .sort((a, b) => a.priority - b.priority || b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function formatMoneyBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function percentProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export function isTomorrowISO(dueDateIso: string): boolean {
  const hoje = new Date();
  const amanha = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
  const due = new Date(`${dueDateIso}T12:00:00`);
  return (
    due.getFullYear() === amanha.getFullYear() &&
    due.getMonth() === amanha.getMonth() &&
    due.getDate() === amanha.getDate()
  );
}

export function isTodayISO(dueDateIso: string): boolean {
  const hoje = new Date();
  const due = new Date(`${dueDateIso}T12:00:00`);
  return (
    due.getFullYear() === hoje.getFullYear() &&
    due.getMonth() === hoje.getMonth() &&
    due.getDate() === hoje.getDate()
  );
}
