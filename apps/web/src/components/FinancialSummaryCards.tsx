import type { useFinancialSummary } from "../hooks/useFinancialSummary";

type FinancialSummaryCardsProps = {
  resumo: ReturnType<typeof useFinancialSummary>;
};

function FinancialSummaryCards({ resumo }: FinancialSummaryCardsProps) {
  if (resumo.loading) {
    return <p className="estado-carregando">Calculando sua situação financeira...</p>;
  }

  if (resumo.error) {
    return (
      <p className="estado-erro">
        Não foi possível calcular seu resumo financeiro. Tente novamente nas seções abaixo.
      </p>
    );
  }

  return (
    <div className="cards">
      <div className="card">
        <h3>Saldo Atual</h3>
        <h2>R$ {resumo.saldo.toFixed(2)}</h2>
      </div>

      <div className="card">
        <h3>Receitas</h3>
        <h2>R$ {resumo.receitas.toFixed(2)}</h2>
      </div>

      <div className="card">
        <h3>Despesas</h3>
        <h2>R$ {resumo.despesas.toFixed(2)}</h2>
      </div>

      <div className="card">
        <h3>Quanto posso gastar</h3>
        <h2 className={resumo.quantoPossoGastar < 0 ? "valor-negativo" : undefined}>
          R$ {resumo.quantoPossoGastar.toFixed(2)}
        </h2>
      </div>
    </div>
  );
}

export default FinancialSummaryCards;
