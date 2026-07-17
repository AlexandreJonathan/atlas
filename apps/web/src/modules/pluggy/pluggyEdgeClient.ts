import { getSupabaseClient } from "../../lib/supabase";
import { logger } from "../../lib/logging";
import type {
  PluggyConnectTokenResponse,
  PluggyConnectorDto,
  PluggyEdgeAction,
  PluggyEdgeSnapshot,
} from "./types";

export const PLUGGY_PROXY_FUNCTION = "pluggy-proxy";
export const PLUGGY_PROXY_TIMEOUT_MS = 25_000;
export const PLUGGY_PROXY_MAX_ATTEMPTS = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`PLUGGY_TIMEOUT after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function extractStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "context" in error) {
    const status = (error as { context?: { status?: number } }).context?.status;
    return typeof status === "number" ? status : undefined;
  }
  return undefined;
}

function isRetryable(error: unknown): boolean {
  if (error instanceof Error && error.message.startsWith("PLUGGY_TIMEOUT")) return true;
  const status = extractStatus(error);
  if (typeof status === "number") {
    if (status === 401 || status === 403 || status === 404) return false;
    return status === 408 || status === 429 || status >= 500;
  }
  return true;
}

async function invokePluggyProxy<T>(
  action: PluggyEdgeAction,
  body: Record<string, unknown> = {},
): Promise<T> {
  const client = getSupabaseClient();
  let lastError: unknown = new Error("Falha ao chamar pluggy-proxy");

  for (let attempt = 1; attempt <= PLUGGY_PROXY_MAX_ATTEMPTS; attempt++) {
    try {
      const result = await withTimeout(
        client.functions.invoke<T & { error?: string }>(PLUGGY_PROXY_FUNCTION, {
          body: { action, ...body },
        }),
        PLUGGY_PROXY_TIMEOUT_MS,
      );

      if (result.error) {
        lastError = result.error;
        if (attempt < PLUGGY_PROXY_MAX_ATTEMPTS && isRetryable(result.error)) {
          await sleep(300 * attempt);
          continue;
        }
        throw result.error;
      }

      const data = result.data;
      if (data && typeof data === "object" && "error" in data && data.error) {
        throw new Error(String(data.error));
      }
      return data as T;
    } catch (error) {
      lastError = error;
      logger.warning("pluggy-proxy invoke falhou", {
        action,
        attempt,
        error: error instanceof Error ? error.message : String(error),
      });
      if (attempt < PLUGGY_PROXY_MAX_ATTEMPTS && isRetryable(error)) {
        await sleep(300 * attempt);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

export function createPluggyConnectToken(): Promise<PluggyConnectTokenResponse> {
  return invokePluggyProxy<PluggyConnectTokenResponse>("connect_token");
}

export function registerPluggyItem(input: {
  itemId: string;
  connectorId?: string;
  connectorName?: string;
}): Promise<{ ok: boolean; itemId: string }> {
  return invokePluggyProxy("register_item", input);
}

export function unregisterPluggyItem(itemId: string): Promise<{ ok: boolean }> {
  return invokePluggyProxy("unregister_item", { itemId });
}

export function syncPluggyItem(itemId: string): Promise<{ ok: boolean }> {
  return invokePluggyProxy("sync_item", { itemId });
}

export function fetchPluggySnapshot(): Promise<PluggyEdgeSnapshot> {
  return invokePluggyProxy<PluggyEdgeSnapshot>("get_snapshot");
}

export async function listPluggyConnectors(): Promise<PluggyConnectorDto[]> {
  const data = await invokePluggyProxy<{ connectors: PluggyConnectorDto[] }>("list_connectors");
  return data.connectors ?? [];
}
