import { useEffect, useState } from "react";
import { BrainCircuit, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { analytics } from "../lib/analytics";
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
import { useAuth } from "../hooks/useAuth";
import { usePlanning } from "../hooks/usePlanning";
import { triggerMicrointeraction } from "../lib/microinteractions";
import { AtlasInsights, useAtlasIntelligence } from "../modules/atlas-intelligence";
import { useFinancialData } from "../modules/financial-data";
import { BudgetSummaryCard, useBudgetPlanner } from "../modules/budget-planner";
import {
  SmartGoalsSummaryCard,
  buildSmartGoalsSummary,
} from "../modules/smart-goals";
import { featureFlagService } from "../config";
import type { TransactionType } from "../types/transaction";
import "./HomePage.css";

type ModalAberto =
  | { kind: "transaction"; tipo: TransactionType }
  | { kind: "bill" }
  | { kind: "goal" }
  | null;

function HomePage() {
  const { user } = useAuth();
  const financial = useFinancialData();
  const { transacoes, contas, metas, perfil, despesasFixas, resumo, snapshot, loading } = financial;

  const planejamento = usePlanning(perfil, despesasFixas, resumo, contas, metas);
  const intelligence = useAtlasIntelligence(snapshot, loading, planejamento);
  const budgetPlanner = useBudgetPlanner();

  const [modalAberto, setModalAberto] = useState<ModalAberto>(null);

  useEffect(() => {
    analytics.track("home_opened");
  }, []);

  const nome = user?.user_metadata?.nome as string | undefined;
  const patrimonioTotal = financial.patrimonio;

  function handleQuickAction(id: QuickActionId) {
    if (id === "receita") setModalAberto({ kind: "transaction", tipo: "receita" });
    else if (id === "despesa") setModalAberto({ kind: "transaction", tipo: "despesa" });
    else if (id === "conta") setModalAberto({ kind: "bill" });
    else setModalAberto({ kind: "goal" });
  }

  return (
    <div className="atlas-page-shell atlas-home">
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

        <BillsTimeline contas={contas} />

        <TransactionsPreview transacoes={transacoes} />

        <AtlasInsights insights={intelligence.topInsights} loading={intelligence.loading} />

        {featureFlagService.isEnabled("budgetPlanner") ? (
          <BudgetSummaryCard
            summary={budgetPlanner.summary}
            loading={budgetPlanner.loading || transacoes.loading}
          />
        ) : null}

        {featureFlagService.isEnabled("smartGoals") ? (
          <SmartGoalsSummaryCard
            summary={buildSmartGoalsSummary(metas.goals)}
            loading={metas.loading}
          />
        ) : null}

        <GoalsFocus metas={metas} />

        <PlanningSnapshot
          perfil={perfil}
          planejamento={planejamento}
          despesasFixas={despesasFixas}
        />

        <InvestmentsTeaser investments={financial.investments} />

        <Link to="/atlas-ia" className="atlas-surface atlas-home-ia-cta">
          <span className="atlas-home-ia-cta-icon" aria-hidden="true">
            <BrainCircuit size={20} />
          </span>
          <span className="atlas-home-ia-cta-copy">
            <strong>Continuar com a Atlas IA</strong>
            <small>Conversa e feed de atividade</small>
          </span>
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
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
              void intelligence.publishEvent({
                kind: "income_added",
                amount: dados.amount,
                title: dados.description,
              });
            } else {
              triggerMicrointeraction("success", {
                message: "Despesa registrada",
              });
              void intelligence.publishEvent({
                kind: "expense_added",
                amount: dados.amount,
                title: dados.description,
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
            void intelligence.publishEvent({
              kind: "bill_due_soon",
              title: dados.description,
              amount: dados.amount,
            });
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
            void intelligence.publishEvent({
              kind: "goal_progress",
              title: dados.title,
            });
          }}
        />
      )}
    </div>
  );
}

export default HomePage;
