/**
 * Correlação Client → Edge → Logs / Sentry (Missão 26).
 * Header HTTP: `x-request-id`
 */

const HEADER = "x-request-id";

let currentRequestId: string | null = null;

export function getRequestIdHeaderName(): string {
  return HEADER;
}

export function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `atlas-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getRequestId(): string | undefined {
  return currentRequestId ?? undefined;
}

export function setRequestId(id: string | null): void {
  currentRequestId = id;
}

/** Escopo síncrono — restaura o id anterior ao sair. */
export function withRequestId<T>(id: string, fn: () => T): T {
  const previous = currentRequestId;
  currentRequestId = id;
  try {
    return fn();
  } finally {
    currentRequestId = previous;
  }
}

/** Escopo assíncrono — restaura o id anterior ao sair. */
export async function withRequestIdAsync<T>(id: string, fn: () => Promise<T>): Promise<T> {
  const previous = currentRequestId;
  currentRequestId = id;
  try {
    return await fn();
  } finally {
    currentRequestId = previous;
  }
}

/** Headers a anexar em `functions.invoke`. */
export function requestIdHeaders(id?: string): Record<string, string> {
  const value = id ?? getRequestId() ?? createRequestId();
  return { [HEADER]: value };
}
