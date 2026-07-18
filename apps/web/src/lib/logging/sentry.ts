import { appConfig } from "../../config";
import { getRequestId } from "../observability";
import type { LogEntry, LogSink } from "./types";

type SentryModule = typeof import("@sentry/react");

let sentry: SentryModule | null = null;

/** Inicializa Sentry quando `VITE_SENTRY_DSN` estiver definido (import dinâmico). */
export async function initSentry(): Promise<void> {
  const dsn = appConfig.observability.sentryDsn;
  if (!dsn || sentry) return;

  sentry = await import("@sentry/react");
  sentry.init({
    dsn,
    environment: appConfig.env,
    release: `atlas-web@${appConfig.version}`,
    tracesSampleRate: appConfig.isProd ? 0.1 : 0,
    sendDefaultPii: false,
  });
}

function applyRequestIdTag(): void {
  if (!sentry) return;
  const requestId = getRequestId();
  if (requestId) {
    sentry.setTag("request_id", requestId);
  }
}

/**
 * Encaminha warning/error para Sentry quando inicializado.
 * Sem DSN / antes do init permanece no-op.
 * Sempre anexa tag `request_id` quando houver correlação ativa.
 */
export class SentryLogSink implements LogSink {
  write(entry: LogEntry): void {
    if (!sentry) return;
    if (entry.level !== "warning" && entry.level !== "error") return;

    applyRequestIdTag();

    const requestId =
      typeof entry.context?.requestId === "string" ? entry.context.requestId : getRequestId();

    if (entry.error !== undefined) {
      sentry.captureException(entry.error, {
        level: entry.level === "warning" ? "warning" : "error",
        tags: requestId ? { request_id: requestId } : undefined,
        extra: { message: entry.message, ...entry.context },
      });
      return;
    }

    sentry.captureMessage(entry.message, {
      level: entry.level === "warning" ? "warning" : "error",
      tags: requestId ? { request_id: requestId } : undefined,
      extra: entry.context,
    });
  }
}
