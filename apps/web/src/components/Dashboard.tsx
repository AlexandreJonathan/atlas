import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useBills } from "../hooks/useBills";
import { useFinancialProfile } from "../hooks/useFinancialProfile";
import { useFinancialSummary } from "../hooks/useFinancialSummary";
import { useFixedExpenses } from "../hooks/useFixedExpenses";
import { useGoals } from "../hooks/useGoals";
import { useOnboarding } from "../hooks/useOnboarding";
import { usePlanning } from "../hooks/usePlanning";
import { useRecommendations } from "../hooks/useRecommendations";
import { useTransactions } from "../hooks/useTransactions";
import type { TransactionType } from "../types/transaction";
import "./Dashboard.css";
import FinancialSummaryCards from "./FinancialSummaryCards";
import FixedExpensesPanel from "./FixedExpensesPanel";
import GoalsPanel from "./GoalsPanel";
import OnboardingWizard from "./onboarding/OnboardingWizard";
import PlanningPanel from "./PlanningPanel";
import RecommendationsPanel from "./RecommendationsPanel";
import TransactionModal from "./TransactionModal";
import TransactionsList from "./TransactionsList";
import UpcomingBillsPanel from "./UpcomingBillsPanel";

// Dashboard.tsx é só o orquestrador/layout: cada seção busca seus próprios
// dados (useTransactions/useBills/useGoals/useFinancialProfile/
// useFixedExpenses, chamados uma única vez aqui para não duplicar
// requisições) e é responsável pelo seu próprio loading/erro/estado vazio —
// a falha ou lentidão de uma fonte não trava nem esconde as demais.
function Dashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const transacoes = useTransactions();
  const contas = useBills();
  const metas = useGoals();
  const perfil = useFinancialProfile();
  const despesasFixas = useFixedExpenses();

  const resumo = useFinancialSummary(transacoes, contas);
  const planejamento = usePlanning(perfil, despesasFixas, resumo, contas, metas);
  const recomendacoes = useRecommendations(resumo, contas, metas, planejamento);

  const onboarding = useOnboarding({
    perfilJaConfigurado: perfil.profile != null,
    perfilCarregando: perfil.loading,
  });
  const [onboardingOcultoNestaSessao, setOnboardingOcultoNestaSessao] = useState(false);

  const [modalAberto, setModalAberto] = useState<TransactionType | null>(null);

  async function handleLogout() {
    try {
      await signOut();
    } finally {
      navigate("/login");
    }
  }

  // Só decide entre onboarding e Dashboard normal depois de saber o status
  // real (evita mostrar o Dashboard "piscando" por trás do wizard, ou
  // vice-versa, enquanto o status ainda está sendo buscado/backfilled).
  if (onboarding.loading) {
    return <div className="carregando">Carregando...</div>;
  }

  // Enquanto o onboarding não é concluído (nem adiado nesta sessão), o
  // wizard substitui o Dashboard normal por completo — ver useOnboarding.ts
  // para a estratégia de backfill de usuários que já tinham dados antes da
  // Sprint 6.
  if (!onboarding.completo && !onboardingOcultoNestaSessao) {
    return (
      <OnboardingWizard
        onboarding={onboarding}
        perfil={perfil}
        despesasFixas={despesasFixas}
        metas={metas}
        onPularPorAgora={() => setOnboardingOcultoNestaSessao(true)}
      />
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>👋 Olá!</h1>
        <p>Bem-vindo à Atlas.</p>
        <button className="btn-logout" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <RecommendationsPanel estado={recomendacoes} />

      <section aria-labelledby="resumo-titulo" className="secao-resumo">
        <h2 id="resumo-titulo">💰 Situação financeira hoje</h2>
        <FinancialSummaryCards resumo={resumo} />
      </section>

      <div className="secao-planejamento">
        <PlanningPanel perfil={perfil} planejamento={planejamento} />
      </div>

      <div className="paineis-grid">
        <UpcomingBillsPanel contas={contas} />
        <GoalsPanel metas={metas} />
        <FixedExpensesPanel despesasFixas={despesasFixas} />
      </div>

      <div className="acoes">
        <button onClick={() => setModalAberto("receita")}>+ Nova Receita</button>
        <button onClick={() => setModalAberto("despesa")}>+ Nova Despesa</button>
      </div>

      {transacoes.actionError && <p className="erro-geral erro-acao">{transacoes.actionError}</p>}

      <div className="lista-movimentacoes">
        <h2>📋 Movimentações recentes</h2>

        <TransactionsList
          transactions={transacoes.transactions}
          loading={transacoes.loading}
          error={transacoes.error}
          onRemover={transacoes.remover}
          onTentarNovamente={transacoes.recarregar}
        />
      </div>

      {modalAberto && (
        <TransactionModal
          tipo={modalAberto}
          onFechar={() => setModalAberto(null)}
          onSalvar={(dados) => transacoes.adicionar({ type: modalAberto, ...dados })}
        />
      )}
    </div>
  );
}

export default Dashboard;
