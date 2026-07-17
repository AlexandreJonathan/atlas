/**
 * Execução de tools do agente — somente no servidor, via RLS (user JWT).
 * Não usa FinancialDataService do front; números não vêm do cliente.
 */

import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.1";
import {
  isAllowedToolName,
  type AtlasToolName,
} from "./agentTrust.ts";

function startOfMonthISO(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T12:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

type LedgerBundle = {
  saldo: number;
  patrimonio: number;
  receitasDoMes: number;
  despesasDoMes: number;
  investimentosPatrimonio: number;
  risco: string | null;
  transactions: Array<{
    id?: string;
    type: string;
    description: string;
    amount: number;
    createdAt: string | null;
  }>;
  bills: Array<{
    description: string;
    amount: number;
    dueDate: string;
    status: string;
    type: string;
  }>;
  contasVencidas: Array<{ description: string; amount: number }>;
  contasProximas: Array<{ description: string; dueDate: string; amount: number }>;
  goals: Array<{
    title: string;
    targetAmount: number;
    currentAmount: number;
    progressPct: number;
  }>;
  ofConnections: Array<{
    itemId: string;
    connectorName: string | null;
    status: string;
    lastSyncedAt: string | null;
  }>;
};

async function loadLedgerBundle(
  userClient: SupabaseClient,
  admin: SupabaseClient,
  userId: string,
): Promise<LedgerBundle> {
  const monthStart = startOfMonthISO();
  const hoje = todayISO();
  const emBreve = addDaysISO(hoje, 7);

  const [txRes, billsRes, goalsRes, profileRes, ofRes] = await Promise.all([
    userClient
      .from("transactions")
      .select("id, type, description, amount, created_at")
      .order("created_at", { ascending: false })
      .limit(40),
    userClient
      .from("bills")
      .select("type, description, amount, due_date, status")
      .eq("status", "pendente")
      .order("due_date", { ascending: true })
      .limit(30),
    userClient.from("goals").select("title, target_amount, current_amount").limit(10),
    userClient.from("financial_profiles").select("minimum_reserve").maybeSingle(),
    admin
      .from("pluggy_connections")
      .select("item_id, connector_name, status, last_synced_at")
      .eq("user_id", userId)
      .limit(20),
  ]);

  if (txRes.error) console.error("[atlas-ai-chat] tool tx", txRes.error.message);
  if (billsRes.error) console.error("[atlas-ai-chat] tool bills", billsRes.error.message);
  if (goalsRes.error) console.error("[atlas-ai-chat] tool goals", goalsRes.error.message);
  if (profileRes.error) console.error("[atlas-ai-chat] tool profile", profileRes.error.message);
  if (ofRes.error) console.error("[atlas-ai-chat] tool of", ofRes.error.message);

  const transactionsRaw = txRes.data ?? [];
  const billsRaw = billsRes.data ?? [];
  const goalsRaw = goalsRes.data ?? [];
  const profile = profileRes.data;

  let receitasDoMes = 0;
  let despesasDoMes = 0;
  let saldo = 0;

  for (const tx of transactionsRaw) {
    const amount = Number(tx.amount) || 0;
    if (tx.type === "receita") saldo += amount;
    else saldo -= amount;
    if (tx.created_at && tx.created_at >= monthStart) {
      if (tx.type === "receita") receitasDoMes += amount;
      else despesasDoMes += amount;
    }
  }

  const contasVencidas = billsRaw
    .filter((b) => b.due_date && b.due_date < hoje)
    .slice(0, 5)
    .map((b) => ({
      description: String(b.description ?? "Conta").slice(0, 120),
      amount: Number(b.amount) || 0,
    }));

  const contasProximas = billsRaw
    .filter((b) => b.due_date && b.due_date >= hoje && b.due_date <= emBreve)
    .slice(0, 5)
    .map((b) => ({
      description: String(b.description ?? "Conta").slice(0, 120),
      dueDate: String(b.due_date),
      amount: Number(b.amount) || 0,
    }));

  const bills = billsRaw.slice(0, 20).map((b) => ({
    description: String(b.description ?? "Conta").slice(0, 120),
    amount: Number(b.amount) || 0,
    dueDate: String(b.due_date ?? ""),
    status: String(b.status ?? ""),
    type: String(b.type ?? ""),
  }));

  const goals = goalsRaw.slice(0, 10).map((g) => {
    const targetAmount = Number(g.target_amount) || 0;
    const currentAmount = Number(g.current_amount) || 0;
    return {
      title: String(g.title ?? "Meta").slice(0, 120),
      targetAmount,
      currentAmount,
      progressPct: targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0,
    };
  });

  const transactions = transactionsRaw.slice(0, 30).map((t) => ({
    id: t.id ? String(t.id) : undefined,
    type: String(t.type ?? "mov"),
    description: String(t.description ?? "").slice(0, 120),
    amount: Number(t.amount) || 0,
    createdAt: t.created_at ? String(t.created_at) : null,
  }));

  const investimentosPatrimonio = 0;
  const patrimonio = saldo + investimentosPatrimonio;
  const reserva = Number(profile?.minimum_reserve) || 0;
  let risco: string | null = null;
  if (reserva > 0) {
    const ratio = patrimonio / reserva;
    if (patrimonio < 0 || ratio < 0.5) risco = "alto";
    else if (ratio < 1) risco = "medio";
    else risco = "baixo";
  }

  const ofConnections = (ofRes.data ?? []).map((row) => ({
    itemId: String(row.item_id),
    connectorName: row.connector_name ? String(row.connector_name) : null,
    status: String(row.status ?? "unknown"),
    lastSyncedAt: row.last_synced_at ? String(row.last_synced_at) : null,
  }));

  return {
    saldo,
    patrimonio,
    receitasDoMes,
    despesasDoMes,
    investimentosPatrimonio,
    risco,
    transactions,
    bills,
    contasVencidas,
    contasProximas,
    goals,
    ofConnections,
  };
}

function runTool(name: AtlasToolName, bundle: LedgerBundle): unknown {
  switch (name) {
    case "getFinancialSnapshot":
      return {
        saldo: bundle.saldo,
        patrimonio: bundle.patrimonio,
        investimentosPatrimonio: bundle.investimentosPatrimonio,
        receitasDoMes: bundle.receitasDoMes,
        despesasDoMes: bundle.despesasDoMes,
        risco: bundle.risco,
        source: "server_rls",
      };
    case "getAccounts":
      return {
        bills: bundle.bills,
        contasVencidas: bundle.contasVencidas,
        contasVencendoEmBreve: bundle.contasProximas,
        openFinanceConnections: bundle.ofConnections,
        note:
          "Saldos de contas/cartões Open Finance não são inventados aqui; use o hub Contas na UI após sync.",
        source: "server_rls",
      };
    case "getTransactions":
      return {
        transactions: bundle.transactions,
        receitasDoMes: bundle.receitasDoMes,
        despesasDoMes: bundle.despesasDoMes,
        source: "server_rls",
      };
    case "getInvestments":
      return {
        patrimonioInvestido: bundle.investimentosPatrimonio,
        openFinanceConnections: bundle.ofConnections,
        note: "Patrimônio OF detalhado fica no snapshot da UI após sync; Edge não inventa saldos.",
        source: "server_rls",
      };
    case "getGoals":
      return {
        goals: bundle.goals,
        source: "server_rls",
      };
    default: {
      const _exhaustive: never = name;
      throw new Error(`Tool desconhecida: ${String(_exhaustive)}`);
    }
  }
}

export type ToolCallRaw = {
  id?: string;
  type?: string;
  function?: { name?: string; arguments?: string };
};

/**
 * Executa tool_calls da OpenAI. Rejeita nomes fora da allowlist.
 */
export async function executeServerToolCalls(
  toolCalls: ToolCallRaw[],
  userClient: SupabaseClient,
  admin: SupabaseClient,
  userId: string,
): Promise<{
  toolsUsed: AtlasToolName[];
  toolMessages: Array<{ role: "tool"; tool_call_id: string; content: string }>;
  rejected: string[];
}> {
  const bundle = await loadLedgerBundle(userClient, admin, userId);
  const toolsUsed: AtlasToolName[] = [];
  const toolMessages: Array<{ role: "tool"; tool_call_id: string; content: string }> = [];
  const rejected: string[] = [];

  for (const call of toolCalls) {
    const id = typeof call.id === "string" ? call.id : "";
    const name = call.function?.name;
    if (!id || !name || !isAllowedToolName(name)) {
      rejected.push(name ?? "unknown");
      if (id) {
        toolMessages.push({
          role: "tool",
          tool_call_id: id,
          content: JSON.stringify({
            ok: false,
            error: "tool_not_allowed",
            name: name ?? null,
          }),
        });
      }
      continue;
    }

    // Args devem ser objeto vazio — schema injection / args maliciosos são ignorados.
    try {
      if (typeof call.function?.arguments === "string" && call.function.arguments.trim()) {
        const parsed: unknown = JSON.parse(call.function.arguments);
        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed) &&
          Object.keys(parsed as object).length > 0
        ) {
          toolMessages.push({
            role: "tool",
            tool_call_id: id,
            content: JSON.stringify({ ok: false, error: "invalid_tool_args" }),
          });
          continue;
        }
      }
    } catch {
      toolMessages.push({
        role: "tool",
        tool_call_id: id,
        content: JSON.stringify({ ok: false, error: "invalid_tool_args_json" }),
      });
      continue;
    }

    try {
      const data = runTool(name, bundle);
      toolsUsed.push(name);
      toolMessages.push({
        role: "tool",
        tool_call_id: id,
        content: JSON.stringify({ ok: true, data }),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "tool_failed";
      toolMessages.push({
        role: "tool",
        tool_call_id: id,
        content: JSON.stringify({ ok: false, error: message }),
      });
    }
  }

  return { toolsUsed, toolMessages, rejected };
}
