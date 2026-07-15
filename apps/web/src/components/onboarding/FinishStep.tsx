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
    <div className="onboarding-passo">
      <h2>✅ Tudo pronto!</h2>
      <p>Confira o que configuramos. Você pode ajustar tudo isso a qualquer momento no Dashboard.</p>

      <div className="onboarding-resumo">
        <div>
          <span>Renda mensal</span>
          <strong>R$ {(rendaMensal ?? 0).toFixed(2)}</strong>
        </div>
        <div>
          <span>Reserva mínima</span>
          <strong>R$ {(reservaMinima ?? 0).toFixed(2)}</strong>
        </div>
        <div>
          <span>Despesas fixas</span>
          <strong>R$ {totalDespesasFixas.toFixed(2)}</strong>
        </div>
        <div>
          <span>Metas criadas</span>
          <strong>{totalMetas}</strong>
        </div>
      </div>

      <div className="onboarding-acoes">
        <button type="button" className="btn-primario" onClick={onConcluir} disabled={processando}>
          {processando ? "Finalizando..." : "Concluir e começar a usar o Atlas"}
        </button>
      </div>
    </div>
  );
}

export default FinishStep;
