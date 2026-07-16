import type { BankId } from "../types";
import "./BankLogo.css";

type BankLogoProps = {
  bankId: BankId;
  name: string;
  size?: number;
};

const INITIALS: Record<BankId, string> = {
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

/** Placeholder visual de marca — sem assets oficiais nesta missão. */
function BankLogo({ bankId, name, size = 44 }: BankLogoProps) {
  return (
    <span
      className={`atlas-bank-logo atlas-bank-logo-${bankId}`}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
      aria-hidden="true"
      title={name}
    >
      {INITIALS[bankId]}
    </span>
  );
}

export default BankLogo;
