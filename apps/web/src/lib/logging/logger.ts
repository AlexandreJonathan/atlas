import { appConfig } from "../../config";
import { getRequestId } from "../observability";
import { SentryLogSink } from "./sentry";
import type { LogContext, LogEntry, LogLevel, LogSink } from "./types";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warning: 30,
  error: 40,
};

/**
 * Sink estruturado — uma linha JSON por evento (facilita correlação em prod).
 */
class StructuredConsoleLogSink implements LogSink {
  write(entry: LogEntry): void {
    const line = JSON.stringify({
      ts: entry.timestamp,
      level: entry.level,
      msg: entry.message,
      requestId: entry.context?.requestId ?? null,
      context: entry.context ?? undefined,
      error:
        entry.error instanceof Error
          ? { name: entry.error.name, message: entry.error.message }
          : entry.error !== undefined
            ? String(entry.error)
            : undefined,
    });

    switch (entry.level) {
      case "debug":
        console.debug(line);
        break;
      case "info":
        console.info(line);
        break;
      case "warning":
        console.warn(line);
        break;
      case "error":
        console.error(line);
        break;
    }
  }
}

class Logger {
  private readonly sinks: LogSink[];
  private readonly minLevel: LogLevel;

  constructor(sinks: LogSink[], minLevel: LogLevel) {
    this.sinks = sinks;
    this.minLevel = minLevel;
  }

  debug(message: string, context?: LogContext): void {
    this.write("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.write("info", message, context);
  }

  warning(message: string, context?: LogContext): void {
    this.write("warning", message, context);
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    this.write("error", message, context, error);
  }

  private write(level: LogLevel, message: string, context?: LogContext, error?: unknown): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.minLevel]) return;

    const requestId = getRequestId();
    const mergedContext: LogContext = {
      ...(context ?? {}),
      ...(requestId ? { requestId } : {}),
    };

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: Object.keys(mergedContext).length > 0 ? mergedContext : undefined,
      error,
    };

    for (const sink of this.sinks) {
      try {
        sink.write(entry);
      } catch {
        // Nunca deixar o logger quebrar a app.
      }
    }
  }
}

function createLogger(): Logger {
  const sinks: LogSink[] = [new StructuredConsoleLogSink()];
  // Sentry ativo só após initSentry() em main — sem DSN permanece no-op.
  sinks.push(new SentryLogSink());
  const minLevel: LogLevel = appConfig.isDev ? "debug" : "info";
  return new Logger(sinks, minLevel);
}

export const logger = createLogger();
