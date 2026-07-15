import { ArrowDownCircle, ArrowUpCircle, PiggyBank, Wallet } from "lucide-react";
import type { useFinancialSummary } from "../hooks/useFinancialSummary";
import "./FinancialSummaryCards.css";
import MiniBarChart from "./ui/MiniBarChart";
import StatCard from "./ui/StatCard";

type FinancialSummaryCardsProps = {
  resumo: ReturnType<typeof useFinancialSummary>;
};

function formatarMoeda(valor: number) {
  return `R$ ${valor.toFixed(2)}`;
}

function FinancialSummaryCards({ resumo }: FinancialSummaryCardsProps) {
  if (resumo.loading) {
    return <p className="atlas-panel-estado-vazio">Calculando sua situação financeira...</p>;
  }

  if (resumo.error) {
    return (
      <p className="atlas-panel-estado-erro">
        Não foi possível calcular seu resumo financeiro. Tente novamente nas seções abaixo.
      </p>
    );
  }

  return (
    <div className="atlas-summary">
      <div className="atlas-summary-cards">
        <StatCard icon={<Wallet size={20} />} label="Saldo atual" value={formatarMoeda(resumo.saldo)} />
        <StatCard
          icon={<ArrowUpCircle size={20} />}
          label="Receitas"
          value={formatarMoeda(resumo.receitas)}
          tone="success"
        />
        <StatCard
          icon={<ArrowDownCircle size={20} />}
          label="Despesas"
          value={formatarMoeda(resumo.despesas)}
          tone="danger"
        />
        <StatCard
          icon={<PiggyBank size={20} />}
          label="Quanto posso gastar"
          value={formatarMoeda(resumo.quantoPossoGastar)}
          tone={resumo.quantoPossoGastar < 0 ? "danger" : "info"}
        />
      </div>

      <div className="atlas-summary-chart">
        <span className="atlas-summary-chart-titulo">Receitas x despesas do mês</span>
        <MiniBarChart
          items={[
            { label: "Receitas", value: resumo.receitasDoMes, tone: "success" },
            { label: "Despesas", value: resumo.despesasDoMes, tone: "danger" },
          ]}
          formatValue={formatarMoeda}
        />
      </div>
    </div>
  );
}

export default FinancialSummaryCards;
