import { appConfig } from "../../config";
import { SentryLogSink } from "./sentry";
import type { LogContext, LogEntry, LogLevel, LogSink } from "./types";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warning: 30,
  error: 40,
};

/** Console detalhado — usado em development. */
class ConsoleLogSink implements LogSink {
  write(entry: LogEntry): void {
    const payload = {
      ...entry.context,
      ...(entry.error !== undefined ? { error: entry.error } : {}),
    };
    const args = Object.keys(payload).length > 0 ? [entry.message, payload] : [entry.message];

    switch (entry.level) {
      case "debug":
        console.debug("[Atlas]", ...args);
        break;
      case "info":
        console.info("[Atlas]", ...args);
        break;
      case "warning":
        console.warn("[Atlas]", ...args);
        break;
      case "error":
        console.error("[Atlas]", ...args);
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

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
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
  const sinks: LogSink[] = [new ConsoleLogSink()];
  // Sentry ativo só após initSentry() em main — sem DSN permanece no-op.
  sinks.push(new SentryLogSink());
  const minLevel: LogLevel = appConfig.isDev ? "debug" : "info";
  return new Logger(sinks, minLevel);
}

export const logger = createLogger();
