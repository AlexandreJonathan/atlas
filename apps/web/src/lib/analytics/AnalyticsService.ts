import { logger } from "../logging";
import type { AnalyticsEvent, AnalyticsEventName, AnalyticsProperties, AnalyticsSink } from "./types";

/** Sink no-op: reserva o contrato para um provedor externo futuro. */
class NoopAnalyticsSink implements AnalyticsSink {
  track(event: AnalyticsEvent): void {
    void event;
    // Integração futura — nenhum dado sai do cliente nesta sprint.
  }
}

class AnalyticsService {
  private readonly sink: AnalyticsSink;
  private readonly buffer: AnalyticsEvent[] = [];
  private readonly maxBuffer = 100;

  constructor(sink: AnalyticsSink = new NoopAnalyticsSink()) {
    this.sink = sink;
  }

  track(name: AnalyticsEventName, properties?: AnalyticsProperties): void {
    const event: AnalyticsEvent = {
      name,
      timestamp: new Date().toISOString(),
      properties,
    };

    this.buffer.push(event);
    if (this.buffer.length > this.maxBuffer) {
      this.buffer.shift();
    }

    logger.debug(`analytics:${name}`, properties as Record<string, unknown> | undefined);

    try {
      this.sink.track(event);
    } catch (error) {
      logger.warning("Falha ao encaminhar evento de analytics", { name, error });
    }
  }

  /** Útil para inspeção em testes/debug — não usado pela UI. */
  getBufferedEvents(): readonly AnalyticsEvent[] {
    return this.buffer;
  }
}

export const analytics = new AnalyticsService();
