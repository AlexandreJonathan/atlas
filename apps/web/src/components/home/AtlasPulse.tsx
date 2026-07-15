import { useMemo } from "react";
import type { useBills } from "../../hooks/useBills";
import type { usePlanning } from "../../hooks/usePlanning";
import type { useTransactions } from "../../hooks/useTransactions";
import { selecionarAtlasPulse } from "../../lib/atlasPulse";
import "./AtlasPulse.css";

type AtlasPulseProps = {
  contas: ReturnType<typeof useBills>;
  transacoes: ReturnType<typeof useTransactions>;
  planejamento: ReturnType<typeof usePlanning>;
  saldo: number;
};

const DOT: Record<string, string> = {
  positiva: "atlas-pulse-dot-positiva",
  atencao: "atlas-pulse-dot-atencao",
  informativa: "atlas-pulse-dot-informativa",
  marca: "atlas-pulse-dot-marca",
};

function AtlasPulse({ contas, transacoes, planejamento, saldo }: AtlasPulseProps) {
  const mensagem = useMemo(
    () =>
      selecionarAtlasPulse({
        contasVencendoEmBreve: contas.contasVencendoEmBreve,
        contasVencidas: contas.contasVencidas,
        transacoesRecentes: transacoes.transactions.slice(0, 8),
        saldo,
        risco: planejamento.resultado?.risco ?? null,
      }),
    [
      contas.contasVencendoEmBreve,
      contas.contasVencidas,
      transacoes.transactions,
      saldo,
      planejamento.resultado?.risco,
    ],
  );

  return (
    <aside className="atlas-pulse" aria-live="polite">
      <span className={`atlas-pulse-dot ${DOT[mensagem.tone]}`} aria-hidden="true" />
      <p className="atlas-pulse-text">{mensagem.text}</p>
    </aside>
  );
}

export default AtlasPulse;
