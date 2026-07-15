export type InvestmentAllocation = {
  label: string;
  value: number;
  tone: "brand" | "success" | "warning" | "info";
};

export type InvestmentOpportunity = {
  id: string;
  title: string;
  description: string;
};

export type MockInvestmentsSnapshot = {
  patrimonioInvestido: number;
  rendimentoMensalPercentual: number;
  rendimentoMensalValor: number;
  distribuicao: InvestmentAllocation[];
  oportunidades: InvestmentOpportunity[];
};

/** Dados simulados — preparação estrutural; não há integração real de investimentos. */
export const MOCK_INVESTMENTS: MockInvestmentsSnapshot = {
  patrimonioInvestido: 12500,
  rendimentoMensalPercentual: 0.82,
  rendimentoMensalValor: 102.5,
  distribuicao: [
    { label: "Renda fixa", value: 7000, tone: "brand" },
    { label: "Fundos", value: 3500, tone: "info" },
    { label: "Ações", value: 2000, tone: "success" },
  ],
  oportunidades: [
    {
      id: "opp-1",
      title: "Entenda a diferença entre CDB e Tesouro Direto",
      description: "Conteúdo educativo para comparar liquidez, risco e rentabilidade.",
    },
    {
      id: "opp-2",
      title: "O que é diversificação de carteira?",
      description: "Por que espalhar investimentos reduz o impacto de oscilações.",
    },
    {
      id: "opp-3",
      title: "Reserva de emergência vs. investimento",
      description: "Quando priorizar liquidez e quando buscar rendimento.",
    },
  ],
};
