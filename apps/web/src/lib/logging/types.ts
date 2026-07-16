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
 * Destino de logs. Em produção, um sink futuro pode encaminhar a Sentry
 * sem alterar os call sites (`logger.error(...)`).
 */
export interface LogSink {
  write(entry: LogEntry): void;
}
