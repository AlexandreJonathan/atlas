import { CheckCircle2 } from "lucide-react";
import Button from "../ui/Button";

type FinishStepProps = {
  rendaMensal: number | null;
  reservaMinima: number | null;
  totalDespesasFixas: number;
  totalMetas: number;
  processando: boolean;
  onConcluir: () => void;
};

function FinishStep({
  rendaMensal,
  reservaMinima,
  totalDespesasFixas,
  totalMetas,
  processando,
  onConcluir,
}: FinishStepProps) {
  return (
    <div className="atlas-onboarding-step">
      <span className="atlas-onboarding-step-icon">
        <CheckCircle2 size={26} aria-hidden="true" />
      </span>

      <h2>Tudo pronto!</h2>
      <p>Confira o que configuramos. Você pode ajustar tudo isso a qualquer momento no Início.</p>

      <div className="atlas-onboarding-resumo">
        <div className="atlas-onboarding-resumo-linha">
          <span>Renda mensal</span>
          <strong className="tabular-nums">R$ {(rendaMensal ?? 0).toFixed(2)}</strong>
        </div>
        <div className="atlas-onboarding-resumo-linha">
          <span>Reserva mínima</span>
          <strong className="tabular-nums">R$ {(reservaMinima ?? 0).toFixed(2)}</strong>
        </div>
        <div className="atlas-onboarding-resumo-linha">
          <span>Despesas fixas</span>
          <strong className="tabular-nums">R$ {totalDespesasFixas.toFixed(2)}</strong>
        </div>
        <div className="atlas-onboarding-resumo-linha">
          <span>Metas criadas</span>
          <strong className="tabular-nums">{totalMetas}</strong>
        </div>
      </div>

      <div className="atlas-onboarding-acoes">
        <Button type="button" onClick={onConcluir} loading={processando}>
          {processando ? "Finalizando..." : "Concluir e começar a usar o Atlas"}
        </Button>
      </div>
    </div>
  );
}

export default FinishStep;
