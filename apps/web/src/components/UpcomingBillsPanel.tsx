import { CalendarClock } from "lucide-react";
import { useState } from "react";
import type { useBills } from "../hooks/useBills";
import type { BillType } from "../types/bill";
import BillModal from "./BillModal";
import BillsList from "./BillsList";
import "./Panels.css";
import Button from "./ui/Button";
import Card from "./ui/Card";

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
    <Card elevated className="atlas-panel" aria-labelledby="contas-titulo">
      <div className="atlas-panel-header">
        <span className="atlas-panel-title" id="contas-titulo">
          <CalendarClock size={20} aria-hidden="true" />
          Contas a vencer
        </span>
        <div className="atlas-panel-actions">
          <Button size="sm" variant="secondary" onClick={() => setModalAberto("a_pagar")}>
            + A Pagar
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setModalAberto("a_receber")}>
            + A Receber
          </Button>
        </div>
      </div>

      {contas.actionError && <p className="atlas-panel-erro-acao">{contas.actionError}</p>}

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
    </Card>
  );
}

export default UpcomingBillsPanel;
