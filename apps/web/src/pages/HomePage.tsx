import { useState } from "react";
import AtlasIntelligencePanel from "../components/AtlasIntelligencePanel";
import BillModal from "../components/BillModal";
import AtlasPulse from "../components/home/AtlasPulse";
import BillsTimeline from "../components/home/BillsTimeline";
import GoalsFocus from "../components/home/GoalsFocus";
import HomeHeader from "../components/home/HomeHeader";
import InvestmentsTeaser from "../components/home/InvestmentsTeaser";
import PlanningSnapshot from "../components/home/PlanningSnapshot";
import QuickActions, { type QuickActionId } from "../components/home/QuickActions";
import TransactionsPreview from "../components/home/TransactionsPreview";
import WealthHero from "../components/home/WealthHero";
import "../components/Panels.css";
import GoalModal from "../components/GoalModal";
import TransactionModal from "../components/TransactionModal";
import { MOCK_INVESTMENTS } from "../data/mockInvestments";
import { useAuth } from "../hooks/useAuth";
import { useBills } from "../hooks/useBills";
import { useFinancialProfile } from "../hooks/useFinancialProfile";
import { useFinancialSummary } from "../hooks/useFinancialSummary";
import { useFixedExpenses } from "../hooks/useFixedExpenses";
import { useGoals } from "../hooks/useGoals";
import { usePlanning } from "../hooks/usePlanning";
import { useRecommendations } from "../hooks/useRecommendations";
import { useTransactions } from "../hooks/useTransactions";
import { triggerMicrointeraction } from "../lib/microinteractions";
import type { TransactionType } from "../types/transaction";
import "./HomePage.css";

type ModalAberto =
  | { kind: "transaction"; tipo: TransactionType }
  | { kind: "bill" }
  | { kind: "goal" }
  | null;

function HomePage() {
  const { user } = useAuth();

  const transacoes = useTransactions();
  const contas = useBills();
  const metas = useGoals();
  const perfil = useFinancialProfile();
  const despesasFixas = useFixedExpenses();

  const resumo = useFinancialSummary(transacoes, contas);
  const planejamento = usePlanning(perfil, despesasFixas, resumo, contas, metas);
  const recomendacoes = useRecommendations(resumo, contas, metas, planejamento);

  const [modalAberto, setModalAberto] = useState<ModalAberto>(null);

  const nome = user?.user_metadata?.nome as string | undefined;
  const patrimonioTotal = resumo.saldo + MOCK_INVESTMENTS.patrimonioInvestido;

  function handleQuickAction(id: QuickActionId) {
    if (id === "receita") setModalAberto({ kind: "transaction", tipo: "receita" });
    else if (id === "despesa") setModalAberto({ kind: "transaction", tipo: "despesa" });
    else if (id === "conta") setModalAberto({ kind: "bill" });
    else setModalAberto({ kind: "goal" });
  }

  return (
    <div className="atlas-home">
      <HomeHeader nome={nome} email={user?.email} />

      <main className="atlas-home-main">
        <WealthHero
          patrimonioTotal={patrimonioTotal}
          saldoDisponivel={resumo.saldo}
          receitasDoMes={resumo.receitasDoMes}
          despesasDoMes={resumo.despesasDoMes}
        />

        <AtlasPulse
          contas={contas}
          transacoes={transacoes}
          planejamento={planejamento}
          saldo={resumo.saldo}
        />

        <QuickActions onAction={handleQuickAction} />

        <AtlasIntelligencePanel estado={recomendacoes} />

        <BillsTimeline contas={contas} />

        <GoalsFocus metas={metas} />

        <InvestmentsTeaser />

        <PlanningSnapshot
          perfil={perfil}
          planejamento={planejamento}
          despesasFixas={despesasFixas}
        />

        <TransactionsPreview transacoes={transacoes} />
      </main>

      {modalAberto?.kind === "transaction" && (
        <TransactionModal
          tipo={modalAberto.tipo}
          onFechar={() => setModalAberto(null)}
          onSalvar={async (dados) => {
            await transacoes.adicionar({ type: modalAberto.tipo, ...dados });
            if (modalAberto.tipo === "receita") {
              triggerMicrointeraction("money_in", {
                message: "Receita registrada",
                amount: dados.amount,
                target: ".atlas-wealth-hero",
              });
            } else {
              triggerMicrointeraction("success", {
                message: "Despesa registrada",
              });
            }
          }}
        />
      )}

      {modalAberto?.kind === "bill" && (
        <BillModal
          tipo="a_pagar"
          onFechar={() => setModalAberto(null)}
          onSalvar={async (dados) => {
            await contas.criar({ type: "a_pagar", ...dados });
            triggerMicrointeraction("success", { message: "Conta adicionada" });
          }}
        />
      )}

      {modalAberto?.kind === "goal" && (
        <GoalModal
          onFechar={() => setModalAberto(null)}
          onSalvar={async (dados) => {
            await metas.criar(dados);
            triggerMicrointeraction("celebration", {
              message: "Meta criada",
              moneyRain: false,
              target: ".atlas-wealth-hero",
            });
          }}
        />
      )}
    </div>
  );
}

export default HomePage;
