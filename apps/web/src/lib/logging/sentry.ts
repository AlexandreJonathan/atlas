import { appConfig } from "../../config";
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

/**
 * Encaminha warning/error para Sentry quando inicializado.
 * Sem DSN / antes do init permanece no-op.
 */
export class SentryLogSink implements LogSink {
  write(entry: LogEntry): void {
    if (!sentry) return;
    if (entry.level !== "warning" && entry.level !== "error") return;

    if (entry.error !== undefined) {
      sentry.captureException(entry.error, {
        level: entry.level === "warning" ? "warning" : "error",
        extra: { message: entry.message, ...entry.context },
      });
      return;
    }

    sentry.captureMessage(entry.message, {
      level: entry.level === "warning" ? "warning" : "error",
      extra: entry.context,
    });
  }
}
