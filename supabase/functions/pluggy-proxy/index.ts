/**
 * Pluggy proxy — Missão 21.
 *
 * Secrets (nunca no front): PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET
 * Opcional: ALLOWED_ORIGINS, PLUGGY_INCLUDE_SANDBOX
 *
 * Actions (POST JSON):
 * - connect_token
 * - register_item
 * - unregister_item
 * - sync_item
 * - get_snapshot
 * - list_connectors
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.49.1";

const PLUGGY_API = "https://api.pluggy.ai";

type Action =
  | "connect_token"
  | "register_item"
  | "unregister_item"
  | "sync_item"
  | "get_snapshot"
  | "list_connectors";

type Body = {
  action?: Action;
  itemId?: string;
  connectorId?: string | number;
  connectorName?: string;
};

type CachedKey = { token: string; expiresAt: number };
let cachedApiKey: CachedKey | null = null;

function resolveCorsOrigin(req: Request): string {
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = req.headers.get("Origin") ?? "";
  if (allowed.length === 0) return "*";
  if (origin && allowed.includes(origin)) return origin;
  return allowed[0] ?? "*";
}

function corsHeaders(req: Request): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": resolveCorsOrigin(req),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function jsonResponse(
  req: Request,
  body: unknown,
  status = 200,
  extra: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json", ...extra },
  });
}

async function getPluggyApiKey(): Promise<string> {
  const now = Date.now();
  if (cachedApiKey && cachedApiKey.expiresAt > now + 60_000) {
    return cachedApiKey.token;
  }

  const clientId = Deno.env.get("PLUGGY_CLIENT_ID");
  const clientSecret = Deno.env.get("PLUGGY_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error("PLUGGY_CREDENTIALS_MISSING");
  }

  const res = await fetch(`${PLUGGY_API}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ clientId, clientSecret }),
  });
  const data = await res.json();
  if (!res.ok || typeof data?.accessToken !== "string") {
    console.error("[pluggy-proxy] auth failed", res.status);
    throw new Error("PLUGGY_AUTH_FAILED");
  }

  cachedApiKey = {
    token: data.accessToken,
    // API key ~2h; renovamos com margem.
    expiresAt: now + 100 * 60 * 1000,
  };
  return data.accessToken;
}

async function pluggyFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const apiKey = await getPluggyApiKey();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("X-API-KEY", apiKey);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${PLUGGY_API}${path}`, { ...init, headers });
}

async function requireUser(req: Request): Promise<{ userId: string; admin: SupabaseClient }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) {
    throw new Error("SUPABASE_ENV_MISSING");
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) {
    throw new Error("UNAUTHORIZED");
  }

  return { userId: data.user.id, admin: createClient(supabaseUrl, serviceKey) };
}

async function handleConnectToken(userId: string): Promise<unknown> {
  const res = await pluggyFetch("/connect_token", {
    method: "POST",
    body: JSON.stringify({
      options: {
        clientUserId: userId,
        avoidDuplicates: true,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok || typeof data?.accessToken !== "string") {
    console.error("[pluggy-proxy] connect_token failed", res.status);
    throw new Error("CONNECT_TOKEN_FAILED");
  }
  console.info("[pluggy-proxy] connect_token ok", { userId });
  return {
    accessToken: data.accessToken,
    includeSandbox: (Deno.env.get("PLUGGY_INCLUDE_SANDBOX") ?? "true").toLowerCase() !== "false",
  };
}

async function handleRegisterItem(
  admin: SupabaseClient,
  userId: string,
  itemId: string,
  connectorId?: string | number,
  connectorName?: string,
): Promise<unknown> {
  let status = "updated";
  let name = connectorName ?? null;
  let connId = connectorId != null ? String(connectorId) : null;

  try {
    const itemRes = await pluggyFetch(`/items/${encodeURIComponent(itemId)}`);
    if (itemRes.ok) {
      const item = await itemRes.json();
      status = typeof item?.status === "string" ? item.status : status;
      if (item?.connector) {
        connId = item.connector.id != null ? String(item.connector.id) : connId;
        name = typeof item.connector.name === "string" ? item.connector.name : name;
      }
    }
  } catch (error) {
    console.warn("[pluggy-proxy] item lookup soft-fail", error);
  }

  const { error } = await admin.from("pluggy_connections").upsert(
    {
      user_id: userId,
      item_id: itemId,
      connector_id: connId,
      connector_name: name,
      status,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,item_id" },
  );
  if (error) {
    console.error("[pluggy-proxy] register upsert", error.message);
    throw new Error("REGISTER_FAILED");
  }

  console.info("[pluggy-proxy] register_item", { userId, itemId });
  return { ok: true, itemId, connectorId: connId, connectorName: name, status };
}

async function handleUnregisterItem(
  admin: SupabaseClient,
  userId: string,
  itemId: string,
): Promise<unknown> {
  const { error } = await admin
    .from("pluggy_connections")
    .delete()
    .eq("user_id", userId)
    .eq("item_id", itemId);
  if (error) throw new Error("UNREGISTER_FAILED");

  try {
    await pluggyFetch(`/items/${encodeURIComponent(itemId)}`, { method: "DELETE" });
  } catch (error) {
    console.warn("[pluggy-proxy] pluggy delete soft-fail", error);
  }

  return { ok: true };
}

async function handleSyncItem(
  admin: SupabaseClient,
  userId: string,
  itemId: string,
): Promise<unknown> {
  const { data: row } = await admin
    .from("pluggy_connections")
    .select("item_id")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .maybeSingle();
  if (!row) throw new Error("ITEM_NOT_FOUND");

  // Dispara atualização no Item (best-effort — alguns status podem rejeitar).
  const patchRes = await pluggyFetch(`/items/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
  if (!patchRes.ok) {
    console.warn("[pluggy-proxy] item patch status", patchRes.status);
  }

  await admin
    .from("pluggy_connections")
    .update({ last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("item_id", itemId);

  console.info("[pluggy-proxy] sync_item", { userId, itemId });
  return { ok: true, itemId };
}

async function fetchAllPages(
  pathWithQuery: string,
  maxPages = 5,
): Promise<Record<string, unknown>[]> {
  const results: Record<string, unknown>[] = [];
  let page = 1;
  while (page <= maxPages) {
    const sep = pathWithQuery.includes("?") ? "&" : "?";
    const res = await pluggyFetch(`${pathWithQuery}${sep}page=${page}&pageSize=50`);
    if (!res.ok) break;
    const data = await res.json();
    const batch = Array.isArray(data?.results) ? data.results : [];
    results.push(...batch);
    const totalPages = Number(data?.totalPages ?? 1);
    if (page >= totalPages || batch.length === 0) break;
    page += 1;
  }
  return results;
}

async function handleGetSnapshot(admin: SupabaseClient, userId: string): Promise<unknown> {
  const { data: connections, error } = await admin
    .from("pluggy_connections")
    .select("item_id, connector_id, connector_name, status, last_synced_at")
    .eq("user_id", userId);

  if (error) {
    console.error("[pluggy-proxy] list connections", error.message);
    throw new Error("CONNECTIONS_READ_FAILED");
  }

  const items = connections ?? [];
  const banks: unknown[] = [];
  const accounts: unknown[] = [];
  const cards: unknown[] = [];
  const investments: unknown[] = [];
  const balances: unknown[] = [];
  const transactions: unknown[] = [];

  for (const conn of items) {
    const itemId = String(conn.item_id);
    const bankId = itemId;
    const bankName = conn.connector_name ?? "Instituição";

    banks.push({
      id: bankId,
      name: bankName,
      iconKey: conn.connector_id ?? "unknown",
      status: "connected",
      lastSyncedAt: conn.last_synced_at ?? null,
      connectorId: conn.connector_id,
    });

    const accountRows = await fetchAllPages(`/accounts?itemId=${encodeURIComponent(itemId)}`);
    for (const acc of accountRows) {
      const type = String(acc.type ?? "");
      const subtype = String(acc.subtype ?? "");
      const balance = Number(acc.balance) || 0;
      const id = String(acc.id ?? "");
      const name = String(acc.name ?? acc.marketingName ?? "Conta");

      if (type === "CREDIT" || subtype.includes("CREDIT")) {
        const credit = (acc.creditData ?? {}) as Record<string, unknown>;
        const limit = Number(credit.creditLimit) || 0;
        const available = Number(credit.availableCreditLimit) || Math.max(0, limit - balance);
        const used = limit > 0 ? Math.max(0, limit - available) : balance;
        const number = String(acc.number ?? "0000");
        cards.push({
          id,
          bankId,
          bankName,
          name,
          lastFour: number.slice(-4),
          limit,
          used,
          available,
          currency: "BRL",
        });
      } else {
        let mappedType: "checking" | "savings" | "payment" = "checking";
        if (subtype.includes("SAVINGS")) mappedType = "savings";
        else if (subtype.includes("PAYMENT")) mappedType = "payment";
        accounts.push({
          id,
          bankId,
          bankName,
          name,
          type: mappedType,
          balance,
          currency: "BRL",
        });
        balances.push({
          bankId,
          available: balance,
          currency: "BRL",
          updatedAt: new Date().toISOString(),
        });
      }

      // Transações por conta (limitado para Alpha).
      const txRows = await fetchAllPages(
        `/transactions?accountId=${encodeURIComponent(id)}`,
        2,
      );
      for (const tx of txRows.slice(0, 40)) {
        transactions.push({
          id: String(tx.id ?? ""),
          accountId: id,
          bankId,
          description: String(tx.description ?? tx.descriptionRaw ?? "Movimento"),
          amount: Math.abs(Number(tx.amount) || 0),
          type: Number(tx.amount) >= 0 ? "receita" : "despesa",
          date: String(tx.date ?? tx.createdAt ?? ""),
          currency: String(tx.currencyCode ?? "BRL"),
        });
      }
    }

    const invRows = await fetchAllPages(`/investments?itemId=${encodeURIComponent(itemId)}`, 2);
    for (const inv of invRows) {
      investments.push({
        id: String(inv.id ?? ""),
        bankId,
        bankName,
        name: String(inv.name ?? "Investimento"),
        type: "other",
        balance: Number(inv.balance ?? inv.amount ?? 0) || 0,
        currency: "BRL",
      });
    }
  }

  console.info("[pluggy-proxy] get_snapshot", {
    userId,
    items: items.length,
    accounts: accounts.length,
    cards: cards.length,
    transactions: transactions.length,
  });

  return {
    banks,
    accounts,
    cards,
    investments,
    balances,
    transactions,
    pix: [],
    loans: [],
    fetchedAt: new Date().toISOString(),
  };
}

async function handleListConnectors(): Promise<unknown> {
  const res = await pluggyFetch("/connectors?countries=BR");
  const data = await res.json();
  if (!res.ok) {
    console.error("[pluggy-proxy] connectors failed", res.status);
    throw new Error("CONNECTORS_FAILED");
  }
  const results = Array.isArray(data?.results) ? data.results : [];
  const connectors = results.slice(0, 40).map((c: Record<string, unknown>) => ({
    id: String(c.id ?? ""),
    name: String(c.name ?? "Instituição"),
    primaryColor: c.primaryColor ?? null,
    institutionUrl: c.institutionUrl ?? null,
    type: c.type ?? null,
    health: c.health ?? null,
  }));
  return { connectors };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }
  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method not allowed" }, 405);
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(req, { error: "Invalid JSON body" }, 400);
  }

  const action = body.action;
  if (!action) {
    return jsonResponse(req, { error: "action required" }, 400);
  }

  try {
    const { userId, admin } = await requireUser(req);

    switch (action) {
      case "connect_token":
        return jsonResponse(req, await handleConnectToken(userId));
      case "register_item": {
        if (!body.itemId) return jsonResponse(req, { error: "itemId required" }, 400);
        return jsonResponse(
          req,
          await handleRegisterItem(
            admin,
            userId,
            body.itemId,
            body.connectorId,
            body.connectorName,
          ),
        );
      }
      case "unregister_item": {
        if (!body.itemId) return jsonResponse(req, { error: "itemId required" }, 400);
        return jsonResponse(req, await handleUnregisterItem(admin, userId, body.itemId));
      }
      case "sync_item": {
        if (!body.itemId) return jsonResponse(req, { error: "itemId required" }, 400);
        return jsonResponse(req, await handleSyncItem(admin, userId, body.itemId));
      }
      case "get_snapshot":
        return jsonResponse(req, await handleGetSnapshot(admin, userId));
      case "list_connectors":
        return jsonResponse(req, await handleListConnectors());
      default:
        return jsonResponse(req, { error: "Unknown action" }, 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNEXPECTED";
    if (message === "UNAUTHORIZED") {
      return jsonResponse(req, { error: "Unauthorized" }, 401);
    }
    if (message === "PLUGGY_CREDENTIALS_MISSING") {
      console.error("[pluggy-proxy] missing PLUGGY_CLIENT_ID/SECRET");
      return jsonResponse(req, { error: "Pluggy not configured" }, 503);
    }
    if (message === "ITEM_NOT_FOUND") {
      return jsonResponse(req, { error: "Item not found" }, 404);
    }
    console.error("[pluggy-proxy] error", message);
    return jsonResponse(req, { error: "Pluggy proxy error", code: message }, 502);
  }
});
