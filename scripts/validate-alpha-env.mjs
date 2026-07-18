#!/usr/bin/env node
/**
 * Atlas — validação pré-deploy Alpha (Missão 28).
 *
 * Uso:
 *   node scripts/validate-alpha-env.mjs
 *   node scripts/validate-alpha-env.mjs --strict   # falha se faltar item Alpha
 *   node scripts/validate-alpha-env.mjs --json
 *
 * Não imprime valores de secrets — só presença / formato / DNS.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import dns from "node:dns/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const WEB = resolve(ROOT, "apps/web");

const args = new Set(process.argv.slice(2));
const STRICT = args.has("--strict");
const AS_JSON = args.has("--json");

/** @typedef {"ok"|"warn"|"fail"|"skip"} Status */
/** @typedef {{ id: string, status: Status, message: string, fix?: string }} Check */

/** @type {Check[]} */
const checks = [];

function add(id, status, message, fix) {
  checks.push({ id, status, message, fix });
}

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function loadFrontEnv() {
  const local = parseEnvFile(resolve(WEB, ".env.local"));
  const dotenv = parseEnvFile(resolve(WEB, ".env"));
  // .env.local vence
  return { ...dotenv, ...local, ...process.env };
}

function truthy(value) {
  if (value == null || value === "") return false;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

async function checkDns(hostname) {
  try {
    const records = await dns.lookup(hostname);
    return Boolean(records?.address);
  } catch {
    return false;
  }
}

async function checkHttpHead(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(timer);
    return res.status;
  } catch {
    return null;
  }
}

function runSupabase(argsList) {
  const result = spawnSync("npx", ["supabase", ...argsList], {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
    env: process.env,
    timeout: 60_000,
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status,
  };
}

async function main() {
  const env = loadFrontEnv();

  // --- Front files ---
  if (existsSync(resolve(WEB, "package.json"))) {
    add("web_package", "ok", "apps/web/package.json encontrado");
  } else {
    add("web_package", "fail", "apps/web/package.json ausente", "Clone o monorepo completo");
  }

  const envLocal = existsSync(resolve(WEB, ".env.local"));
  const envFile = existsSync(resolve(WEB, ".env"));
  if (envLocal || envFile) {
    add(
      "front_env_file",
      "ok",
      `Arquivo de env front: ${[envLocal && ".env.local", envFile && ".env"].filter(Boolean).join(" + ")}`,
    );
  } else {
    add(
      "front_env_file",
      "fail",
      "Nenhum apps/web/.env.local ou .env",
      "Copie apps/web/.env.example → .env.local e preencha",
    );
  }

  // --- Required VITE ---
  const url = env.VITE_SUPABASE_URL?.trim() ?? "";
  const anon = env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

  if (!url) {
    add("VITE_SUPABASE_URL", "fail", "Ausente", "Defina a Project URL do Supabase");
  } else if (!/^https:\/\/.+\.supabase\.co\/?$/.test(url.replace(/\/$/, ""))) {
    add(
      "VITE_SUPABASE_URL",
      "warn",
      "Formato inesperado (esperado https://<ref>.supabase.co)",
      "Confira Settings → API → Project URL",
    );
  } else {
    add("VITE_SUPABASE_URL", "ok", "Presente (valor omitido)");
    try {
      const host = new URL(url).hostname;
      const dnsOk = await checkDns(host);
      if (dnsOk) {
        add("supabase_dns", "ok", `DNS OK para ${host}`);
        const status = await checkHttpHead(url);
        if (status != null) {
          add("supabase_http", "ok", `Host responde HTTP (status ${status})`);
        } else {
          add(
            "supabase_http",
            "warn",
            "DNS OK mas HEAD na Project URL falhou",
            "Verifique se o projeto está ativo no Dashboard",
          );
        }
      } else {
        add(
          "supabase_dns",
          "fail",
          `DNS não resolve: ${host}`,
          "Corrija VITE_SUPABASE_URL — projeto inexistente ou typo (bloqueio Missão 27)",
        );
      }
    } catch {
      add("supabase_dns", "fail", "URL inválida", "Use a Project URL do Dashboard");
    }
  }

  if (!anon) {
    add(
      "VITE_SUPABASE_ANON_KEY",
      "fail",
      "Ausente",
      "Cole a anon/publishable key (nunca service_role)",
    );
  } else if (anon.includes("service_role") || anon.length < 20) {
    add(
      "VITE_SUPABASE_ANON_KEY",
      "fail",
      "Valor suspeito (curto demais ou service_role)",
      "Use apenas a chave pública anon/publishable",
    );
  } else {
    add("VITE_SUPABASE_ANON_KEY", "ok", `Presente (len=${anon.length}, valor omitido)`);
  }

  // --- Feature flags / Alpha front ---
  const openaiFlag = truthy(env.VITE_FF_OPENAI);
  if (openaiFlag) {
    add("VITE_FF_OPENAI", "ok", "true — chat OpenAI habilitado no front");
  } else {
    add(
      "VITE_FF_OPENAI",
      STRICT ? "fail" : "warn",
      "false/ausente — IA ficará em modo limitado",
      "Para Alpha com IA: VITE_FF_OPENAI=true",
    );
  }

  const sentry = env.VITE_SENTRY_DSN?.trim() ?? "";
  if (sentry.startsWith("https://") && sentry.includes("sentry")) {
    add("VITE_SENTRY_DSN", "ok", "Presente (valor omitido)");
  } else if (!sentry) {
    add(
      "VITE_SENTRY_DSN",
      STRICT ? "fail" : "warn",
      "Ausente — erros de UI não irão ao Sentry",
      "Defina VITE_SENTRY_DSN para Alpha de qualidade",
    );
  } else {
    add("VITE_SENTRY_DSN", "warn", "Formato duvidoso", "Use o DSN completo do Sentry");
  }

  const fdl = (env.VITE_FINANCIAL_DATA_PROVIDER ?? "mock").toLowerCase();
  const of = (env.VITE_OF_PROVIDER ?? "mock").toLowerCase();
  if (fdl === "pluggy" || of === "pluggy") {
    add(
      "providers_pluggy",
      "ok",
      `Providers front: financialData=${fdl}, of=${of} — exigirá secrets Pluggy na Edge`,
    );
  } else {
    add(
      "providers_mock",
      "ok",
      `Providers front em mock (FDL=${fdl}, OF=${of}) — OK se Alpha sem Open Finance real`,
    );
  }

  // --- Edge source present ---
  for (const name of ["atlas-ai-chat", "pluggy-proxy"]) {
    const index = resolve(ROOT, "supabase/functions", name, "index.ts");
    if (existsSync(index)) {
      add(`edge_source_${name}`, "ok", `Código supabase/functions/${name} presente`);
    } else {
      add(`edge_source_${name}`, "fail", `Código ausente: ${name}`, "Atualize o repositório");
    }
  }

  // --- Supabase CLI / secrets (optional if not logged in) ---
  const hasToken = Boolean(process.env.SUPABASE_ACCESS_TOKEN?.trim());
  const linked = existsSync(resolve(ROOT, "supabase/.temp/project-ref"));

  if (!hasToken && !linked) {
    add(
      "supabase_cli_auth",
      STRICT ? "fail" : "warn",
      "CLI não autenticada / projeto não linkado",
      "npx supabase login && npx supabase link --project-ref <REF>",
    );
  } else {
    add(
      "supabase_cli_auth",
      "ok",
      hasToken
        ? "SUPABASE_ACCESS_TOKEN definido"
        : "Projeto linkado (supabase/.temp/project-ref)",
    );
  }

  const secretsResult = runSupabase(["secrets", "list"]);
  if (!secretsResult.ok) {
    add(
      "supabase_secrets_list",
      STRICT ? "fail" : "warn",
      "Não foi possível listar secrets (login/link necessário)",
      "npx supabase login && npx supabase link --project-ref <REF>",
    );
  } else {
    const text = `${secretsResult.stdout}\n${secretsResult.stderr}`;
    const needAi = [
      ["OPENAI_API_KEY", openaiFlag || STRICT],
      ["ALLOWED_ORIGINS", openaiFlag || STRICT],
    ];
    for (const [name, required] of needAi) {
      if (text.includes(name)) {
        add(`secret_${name}`, "ok", `Secret ${name} listado`);
      } else {
        add(
          `secret_${name}`,
          required ? "fail" : "warn",
          `Secret ${name} não encontrado na lista`,
          `npx supabase secrets set ${name}=...`,
        );
      }
    }
    const needPluggy = fdl === "pluggy" || of === "pluggy";
    for (const name of ["PLUGGY_CLIENT_ID", "PLUGGY_CLIENT_SECRET"]) {
      if (text.includes(name)) {
        add(`secret_${name}`, "ok", `Secret ${name} listado`);
      } else {
        add(
          `secret_${name}`,
          needPluggy ? "fail" : "warn",
          `Secret ${name} não listado`,
          needPluggy
            ? `npx supabase secrets set ${name}=...`
            : "Opcional enquanto providers estiverem em mock",
        );
      }
    }
  }

  const fnList = runSupabase(["functions", "list"]);
  if (!fnList.ok) {
    add(
      "edge_deploy_list",
      STRICT ? "fail" : "warn",
      "Não foi possível listar Edge Functions deployadas",
      "Após login: npx supabase functions list",
    );
  } else {
    const text = `${fnList.stdout}\n${fnList.stderr}`;
    for (const name of ["atlas-ai-chat", "pluggy-proxy"]) {
      if (text.includes(name)) {
        add(`edge_deployed_${name}`, "ok", `Função ${name} aparece no projeto`);
      } else {
        add(
          `edge_deployed_${name}`,
          STRICT ? "fail" : "warn",
          `Função ${name} não listada como deployada`,
          `npx supabase functions deploy ${name}`,
        );
      }
    }
  }

  // --- Summary ---
  const fail = checks.filter((c) => c.status === "fail");
  const warn = checks.filter((c) => c.status === "warn");
  const ok = checks.filter((c) => c.status === "ok");

  if (AS_JSON) {
    console.log(
      JSON.stringify(
        {
          strict: STRICT,
          summary: { ok: ok.length, warn: warn.length, fail: fail.length },
          readyForAlphaDeploy: fail.length === 0,
          checks,
        },
        null,
        2,
      ),
    );
  } else {
    console.log("\nAtlas — validate-alpha-env\n");
    for (const c of checks) {
      const icon =
        c.status === "ok" ? "[OK]  " : c.status === "warn" ? "[WARN]" : "[FAIL]";
      console.log(`${icon} ${c.id}: ${c.message}`);
      if (c.fix && c.status !== "ok") {
        console.log(`       → ${c.fix}`);
      }
    }
    console.log("\n---");
    console.log(`OK=${ok.length}  WARN=${warn.length}  FAIL=${fail.length}`);
    if (fail.length === 0) {
      console.log(
        STRICT
          ? "Resultado: pronto para seguir o guia docs/alpha-deploy.md"
          : "Resultado: sem falhas bloqueantes (avisos podem restar). Use --strict para Alpha completo.",
      );
    } else {
      console.log("Resultado: NÃO pronto — corrija os FAIL antes do deploy.");
      console.log("Guia: docs/alpha-deploy.md");
      console.log("Checklist: docs/alpha-production-checklist.md");
    }
    console.log("");
  }

  if (fail.length > 0) process.exit(1);
  if (STRICT && warn.length > 0) {
    // In strict mode, remaining warns about optional mock paths are already fail when required.
    // Exit 0 if only ok+intentional.
  }
  process.exit(0);
}

main().catch((error) => {
  console.error("validate-alpha-env crashed:", error);
  process.exit(2);
});
