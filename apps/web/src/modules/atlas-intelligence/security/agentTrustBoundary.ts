/**
 * Trust boundary do cliente (Missão 24).
 * O front só monta histórico user/assistant — nunca tools, schemas ou role=tool.
 *
 * SYNC: allowlist/códigos devem coincidir com
 * supabase/functions/atlas-ai-chat/agentTrust.ts
 */

import type { ChatMessage } from "../types";
import { ATLAS_TOOL_NAMES, type AtlasToolName } from "../tools/schemas";

export const ATLAS_TOOL_ALLOWLIST: readonly AtlasToolName[] = ATLAS_TOOL_NAMES;

export type TrustViolation =
  | "client_tools_forbidden"
  | "client_tool_choice_forbidden"
  | "client_context_forbidden"
  | "client_system_forbidden"
  | "client_tool_role_forbidden"
  | "client_assistant_tool_calls_forbidden"
  | "messages_required"
  | "invalid_message";

export type SafeAgentMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AgentClientPayload = {
  mode: "agent";
  messages: SafeAgentMessage[];
};

/** Payload bruto que um atacante poderia tentar enviar. */
export type RawAgentPayload = {
  mode?: unknown;
  messages?: unknown;
  tools?: unknown;
  toolChoice?: unknown;
  context?: unknown;
};

/**
 * Valida o contrato do cliente para mode=agent.
 * Espelha a Edge — qualquer violação deve ser rejeitada no servidor também.
 */
export function validateAgentClientPayload(
  payload: RawAgentPayload,
): { ok: true; messages: SafeAgentMessage[] } | { ok: false; code: TrustViolation } {
  if (Object.prototype.hasOwnProperty.call(payload, "tools") && payload.tools != null) {
    return { ok: false, code: "client_tools_forbidden" };
  }
  if (
    Object.prototype.hasOwnProperty.call(payload, "toolChoice") &&
    payload.toolChoice != null
  ) {
    return { ok: false, code: "client_tool_choice_forbidden" };
  }
  if (Object.prototype.hasOwnProperty.call(payload, "context") && payload.context != null) {
    return { ok: false, code: "client_context_forbidden" };
  }

  if (!Array.isArray(payload.messages)) {
    return { ok: false, code: "messages_required" };
  }

  const messages: SafeAgentMessage[] = [];
  for (const raw of payload.messages.slice(-12)) {
    if (!raw || typeof raw !== "object") {
      return { ok: false, code: "invalid_message" };
    }
    const m = raw as {
      role?: unknown;
      content?: unknown;
      tool_calls?: unknown;
      tool_call_id?: unknown;
    };
    if (m.role === "tool") {
      return { ok: false, code: "client_tool_role_forbidden" };
    }
    if (m.role === "system") {
      return { ok: false, code: "client_system_forbidden" };
    }
    if (m.role === "assistant" && m.tool_calls != null) {
      return { ok: false, code: "client_assistant_tool_calls_forbidden" };
    }
    if (m.role !== "user" && m.role !== "assistant") {
      return { ok: false, code: "invalid_message" };
    }
    if (typeof m.content !== "string" || !m.content.trim()) {
      return { ok: false, code: "invalid_message" };
    }
    messages.push({
      role: m.role,
      content: m.content.slice(0, 4000),
    });
  }

  if (messages.length === 0) {
    return { ok: false, code: "messages_required" };
  }

  return { ok: true, messages };
}

/** Monta o único payload permitido do cliente para o agente. */
export function buildSafeAgentPayload(messages: ChatMessage[]): AgentClientPayload {
  const safe: SafeAgentMessage[] = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-12)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content.slice(0, 4000),
    }));

  const validated = validateAgentClientPayload({ mode: "agent", messages: safe });
  if (!validated.ok) {
    throw new Error(`ATLAS_TRUST:${validated.code}`);
  }

  return { mode: "agent", messages: validated.messages };
}

export function isAllowedToolName(value: string): value is AtlasToolName {
  return (ATLAS_TOOL_ALLOWLIST as readonly string[]).includes(value);
}

/** Simula rejeição de tool inexistente (allowlist). */
export function assertToolAllowed(name: string): AtlasToolName {
  if (!isAllowedToolName(name)) {
    throw new Error(`tool_not_allowed:${name}`);
  }
  return name;
}
