import { useState } from "react";
import type { useBills } from "../hooks/useBills";
import type { BillType } from "../types/bill";
import BillModal from "./BillModal";
import BillsList from "./BillsList";

type UpcomingBillsPanelProps = {
  contas: ReturnType<typeof useBills>;
};

// Mostra apenas contas pendentes vencidas ou vencendo em breve — a lista
// completa de contas (incluindo pagas/futuras distantes) fica fora do
// escopo deste widget (registrado no backlog como possível "ver todas").
function UpcomingBillsPanel({ contas }: UpcomingBillsPanelProps) {
  const [modalAberto, setModalAberto] = useState<BillType | null>(null);

  const contasParaExibir = [...contas.contasVencidas, ...contas.contasVencendoEmBreve].sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate),
  );

  return (
    <section className="painel" aria-labelledby="contas-titulo">
      <div className="painel-header">
        <h2 id="contas-titulo">📅 Contas a vencer</h2>
        <div className="painel-acoes">
          <button onClick={() => setModalAberto("a_pagar")}>+ Conta a Pagar</button>
          <button onClick={() => setModalAberto("a_receber")}>+ Conta a Receber</button>
        </div>
      </div>

      {contas.actionError && <p className="erro-geral erro-acao">{contas.actionError}</p>}

      <BillsList
        bills={contasParaExibir}
        loading={contas.loading}
        error={contas.error}
        onMarcarComoPaga={contas.marcarComoPaga}
        onRemover={contas.remover}
        onTentarNovamente={contas.recarregar}
      />

      {modalAberto && (
        <BillModal
          tipo={modalAberto}
          onFechar={() => setModalAberto(null)}
          onSalvar={(dados) => contas.criar({ type: modalAberto, ...dados })}
        />
      )}
    </section>
  );
}

export default UpcomingBillsPanel;
