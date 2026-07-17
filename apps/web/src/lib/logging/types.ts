export type LogLevel = "debug" | "info" | "warning" | "error";

export type LogContext = Record<string, unknown>;

export type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: unknown;
};

/**
 * Destino de logs. `SentryLogSink` encaminha warning/error quando
 * `initSentry()` rodou com `VITE_SENTRY_DSN` — call sites permanecem `logger.*`.
 */
export interface LogSink {
  write(entry: LogEntry): void;
}
