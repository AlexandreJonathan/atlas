/**
 * Atlas AI Chat — proxy OpenAI.
 *
 * Segredo OPENAI_API_KEY fica apenas neste runtime (Supabase Edge).
 * O front chama via supabase.functions.invoke("atlas-ai-chat").
 *
 * Deploy:
 *   supabase secrets set OPENAI_API_KEY=sk-...
 *   supabase functions deploy atlas-ai-chat
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ChatRole = "user" | "assistant" | "system";

type IncomingMessage = {
  role: ChatRole;
  content: string;
};

type FinancialContext = {
  saldo?: number;
  patrimonio?: number;
  receitasDoMes?: number;
  despesasDoMes?: number;
  investimentosPatrimonio?: number;
  risco?: string | null;
  contasProximas?: Array<{ description?: string; dueDate?: string; amount?: number }>;
  contasVencidas?: Array<{ description?: string; amount?: number }>;
  metas?: Array<{ title?: string; targetAmount?: number; currentAmount?: number }>;
  transacoesRecentes?: Array<{
    type?: string;
    description?: string;
    amount?: number;
  }>;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function formatBRL(value: number | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "não informado";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buildSystemPrompt(context: FinancialContext): string {
  const proximas = (context.contasProximas ?? [])
    .slice(0, 5)
    .map(
      (c) =>
        `- ${c.description ?? "Conta"} · ${formatBRL(c.amount)} · venc. ${c.dueDate ?? "?"}`,
    )
    .join("\n");

  const vencidas = (context.contasVencidas ?? [])
    .slice(0, 5)
    .map((c) => `- ${c.description ?? "Conta"} · ${formatBRL(c.amount)}`)
    .join("\n");

  const metas = (context.metas ?? [])
    .slice(0, 5)
    .map((m) => {
      const atual = m.currentAmount ?? 0;
      const alvo = m.targetAmount ?? 0;
      const pct = alvo > 0 ? Math.round((atual / alvo) * 100) : 0;
      return `- ${m.title ?? "Meta"}: ${formatBRL(atual)} de ${formatBRL(alvo)} (${pct}%)`;
    })
    .join("\n");

  const txs = (context.transacoesRecentes ?? [])
    .slice(0, 8)
    .map(
      (t) =>
        `- ${t.type ?? "mov"} · ${t.description ?? "sem descrição"} · ${formatBRL(t.amount)}`,
    )
    .join("\n");

  return [
    "Você é a Atlas Intelligence, assistente financeira pessoal do app Atlas.",
    "Fale em português do Brasil, com tom claro, empático e objetivo.",
    "REGRAS OBRIGATÓRIAS:",
    "- Use APENAS os números e fatos do CONTEXTO FINANCEIRO abaixo.",
    "- Nunca invente saldos, contas, metas, receitas, despesas ou patrimônios.",
    "- Se o usuário perguntar algo que não estiver no contexto, diga que não tem esse dado na Atlas agora.",
    "- Não ofereça produtos de investimento; a Atlas não vende investimentos.",
    "- Respostas curtas (2–4 frases), acionáveis quando possível.",
    "",
    "CONTEXTO FINANCEIRO (fonte única de verdade):",
    `Saldo disponível: ${formatBRL(context.saldo)}`,
    `Patrimônio estimado: ${formatBRL(context.patrimonio)}`,
    `Receitas do mês: ${formatBRL(context.receitasDoMes)}`,
    `Despesas do mês: ${formatBRL(context.despesasDoMes)}`,
    `Investimentos (teaser): ${formatBRL(context.investimentosPatrimonio)}`,
    `Risco financeiro: ${context.risco ?? "indefinido"}`,
    "",
    "Contas vencidas:",
    vencidas || "- nenhuma",
    "",
    "Contas próximas:",
    proximas || "- nenhuma",
    "",
    "Metas:",
    metas || "- nenhuma",
    "",
    "Transações recentes:",
    txs || "- nenhuma",
  ].join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    console.error("[atlas-ai-chat] OPENAI_API_KEY ausente");
    return jsonResponse({ error: "OPENAI_API_KEY not configured" }, 500);
  }

  let payload: { messages?: IncomingMessage[]; context?: FinancialContext };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  const context = payload.context ?? {};

  const history = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (history.length === 0) {
    return jsonResponse({ error: "messages required" }, 400);
  }

  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-4.1-mini";
  const openaiMessages = [
    { role: "system" as const, content: buildSystemPrompt(context) },
    ...history,
  ];

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: 450,
        messages: openaiMessages,
      }),
    });

    const openaiJson = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("[atlas-ai-chat] OpenAI error", openaiRes.status, openaiJson);
      return jsonResponse(
        {
          error: "OpenAI request failed",
          status: openaiRes.status,
          detail: openaiJson?.error?.message ?? null,
        },
        502,
      );
    }

    const reply = openaiJson?.choices?.[0]?.message?.content?.trim();
    if (!reply || typeof reply !== "string") {
      return jsonResponse({ error: "Empty model reply" }, 502);
    }

    return jsonResponse({
      reply,
      model,
      usage: openaiJson?.usage ?? null,
    });
  } catch (error) {
    console.error("[atlas-ai-chat] unexpected", error);
    return jsonResponse({ error: "Unexpected proxy error" }, 500);
  }
});
