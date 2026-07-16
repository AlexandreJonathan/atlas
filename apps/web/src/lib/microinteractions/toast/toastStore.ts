import type { ToastTone } from "../types";

export type ToastItem = {
  id: string;
  tone: ToastTone;
  title?: string;
  message: string;
};

type Listener = (items: ToastItem[]) => void;

const TOAST_TTL_MS = 3400;
const MAX_TOASTS = 4;

let items: ToastItem[] = [];
const listeners = new Set<Listener>();
const timers = new Map<string, number>();

function notify(): void {
  for (const listener of listeners) {
    listener(items);
  }
}

function removeToast(id: string): void {
  const timer = timers.get(id);
  if (timer) {
    window.clearTimeout(timer);
    timers.delete(id);
  }
  items = items.filter((item) => item.id !== id);
  notify();
}

export function showToast(input: {
  tone: ToastTone;
  message: string;
  title?: string;
  ttlMs?: number;
}): string {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const next: ToastItem = {
    id,
    tone: input.tone,
    title: input.title,
    message: input.message,
  };

  items = [next, ...items].slice(0, MAX_TOASTS);
  notify();

  const ttl = input.ttlMs ?? TOAST_TTL_MS;
  const timer = window.setTimeout(() => removeToast(id), ttl);
  timers.set(id, timer);
  return id;
}

export function dismissToast(id: string): void {
  removeToast(id);
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  // Não notifica de forma síncrona no subscribe (evita setState no corpo do effect).
  queueMicrotask(() => listener(items));
  return () => listeners.delete(listener);
}
