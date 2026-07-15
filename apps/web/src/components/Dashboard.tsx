import { LogOut, Plus } from "lucide-react";
import { useMemo, useState } from "react";
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
import { gerarAtlasIntelligenceCopy } from "../lib/atlasIntelligenceCopy";
import type { TransactionType } from "../types/transaction";
import AtlasIntelligencePanel from "./AtlasIntelligencePanel";
import "./Dashboard.css";
import FinancialSummaryCards from "./FinancialSummaryCards";
import FixedExpensesPanel from "./FixedExpensesPanel";
import GoalsPanel from "./GoalsPanel";
import OnboardingWizard from "./onboarding/OnboardingWizard";
import "./Panels.css";
import PlanningPanel from "./PlanningPanel";
import TransactionModal from "./TransactionModal";
import TransactionsList from "./TransactionsList";
import AtlasLogo from "./ui/AtlasLogo";
import Button from "./ui/Button";
import Card from "./ui/Card";
import UpcomingBillsPanel from "./UpcomingBillsPanel";

// Dashboard.tsx é só o orquestrador/layout: cada seção busca seus próprios
// dados (useTransactions/useBills/useGoals/useFinancialProfile/
// useFixedExpenses, chamados uma única vez aqui para não duplicar
// requisições) e é responsável pelo seu próprio loading/erro/estado vazio —
// a falha ou lentidão de uma fonte não trava nem esconde as demais.
function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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

  // Prévia da Atlas Intelligence exibida já no cabeçalho (Fase 3) — o
  // texto completo (saudação + resumo + recomendações) fica na seção
  // dedicada abaixo (AtlasIntelligencePanel, Fase 4). Mesmo dado, dois
  // níveis de detalhe.
  const atlasCopy = useMemo(
    () => gerarAtlasIntelligenceCopy(recomendacoes.recomendacoes),
    [recomendacoes.recomendacoes],
  );

  const primeiroNome = (user?.user_metadata?.nome as string | undefined)?.split(" ")[0];

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
    return <div className="atlas-page-loader">Carregando...</div>;
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
    <div className="atlas-dashboard">
      <header className="atlas-dashboard-header">
        <AtlasLogo size={32} />

        <div className="atlas-dashboard-greeting">
          <h1>Olá{primeiroNome ? `, ${primeiroNome}` : ""}!</h1>
          {!recomendacoes.loading && <p>{atlasCopy.resumo}</p>}
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut size={16} aria-hidden="true" />
          Sair
        </Button>
      </header>

      <main className="atlas-dashboard-main">
        <AtlasIntelligencePanel estado={recomendacoes} />

        <section aria-labelledby="resumo-titulo" className="atlas-dashboard-section">
          <h2 id="resumo-titulo" className="atlas-dashboard-section-titulo">
            Situação financeira hoje
          </h2>
          <FinancialSummaryCards resumo={resumo} />
        </section>

        <PlanningPanel perfil={perfil} planejamento={planejamento} />

        <div className="atlas-dashboard-grid">
          <UpcomingBillsPanel contas={contas} />
          <GoalsPanel metas={metas} />
          <FixedExpensesPanel despesasFixas={despesasFixas} />
        </div>

        <Card elevated className="atlas-dashboard-section" aria-labelledby="movimentacoes-titulo">
          <div className="atlas-dashboard-section-header">
            <h2 id="movimentacoes-titulo" className="atlas-dashboard-section-titulo">
              Movimentações recentes
            </h2>
            <div className="atlas-dashboard-actions">
              <Button size="sm" onClick={() => setModalAberto("receita")}>
                <Plus size={16} aria-hidden="true" />
                Receita
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setModalAberto("despesa")}>
                <Plus size={16} aria-hidden="true" />
                Despesa
              </Button>
            </div>
          </div>

          {transacoes.actionError && <p className="atlas-panel-erro-acao">{transacoes.actionError}</p>}

          <TransactionsList
            transactions={transacoes.transactions}
            loading={transacoes.loading}
            error={transacoes.error}
            onRemover={transacoes.remover}
            onTentarNovamente={transacoes.recarregar}
          />
        </Card>
      </main>

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
