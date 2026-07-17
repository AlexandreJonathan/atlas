import type { BankId, KnownBankId } from "../types";
import { KNOWN_BANK_IDS } from "../types";
import "./BankLogo.css";

type BankLogoProps = {
  bankId: BankId;
  name: string;
  size?: number;
};

const INITIALS: Record<KnownBankId, string> = {
  nubank: "NU",
  inter: "IN",
  c6: "C6",
  itau: "IT",
  santander: "SA",
  bradesco: "BR",
  banco_do_brasil: "BB",
  caixa: "CX",
  pagbank: "PB",
  mercado_pago: "MP",
  wise: "WI",
};

function isKnownBankId(bankId: BankId): bankId is KnownBankId {
  return (KNOWN_BANK_IDS as readonly string[]).includes(bankId);
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

/** Placeholder visual de marca — fallback genérico para ids Pluggy desconhecidos. */
function BankLogo({ bankId, name, size = 44 }: BankLogoProps) {
  const known = isKnownBankId(bankId);
  const initials = known ? INITIALS[bankId] : initialsFromName(name);
  const className = known
    ? `atlas-bank-logo atlas-bank-logo-${bankId}`
    : "atlas-bank-logo atlas-bank-logo-unknown";

  return (
    <span
      className={className}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
      aria-hidden="true"
      title={name}
    >
      {initials}
    </span>
  );
}

export default BankLogo;
