import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Receipt,
  Target,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { gerarAtlasIntelligenceCopy, saudacaoPorHorario } from "../lib/atlasIntelligenceCopy";
import type { TransactionType } from "../types/transaction";
import AtlasIntelligencePanel from "../components/AtlasIntelligencePanel";
import BillModal from "../components/BillModal";
import FixedExpensesPanel from "../components/FixedExpensesPanel";
import GoalModal from "../components/GoalModal";
import GoalsPanel from "../components/GoalsPanel";
import "../components/Panels.css";
import PlanningPanel from "../components/PlanningPanel";
import TransactionModal from "../components/TransactionModal";
import TransactionsList from "../components/TransactionsList";
import UpcomingBillsPanel from "../components/UpcomingBillsPanel";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import MiniBarChart from "../components/ui/MiniBarChart";
import StatCard from "../components/ui/StatCard";
import "./HomePage.css";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

  const atlasCopy = useMemo(
    () => gerarAtlasIntelligenceCopy(recomendacoes.recomendacoes),
    [recomendacoes.recomendacoes],
  );

  const primeiroNome = (user?.user_metadata?.nome as string | undefined)?.split(" ")[0];
  const saudacao = saudacaoPorHorario(new Date().getHours());
  const patrimonioTotal = resumo.saldo + MOCK_INVESTMENTS.patrimonioInvestido;

  return (
    <div className="atlas-home">
      <header className="atlas-home-header">
        <h1>
          {saudacao}
          {primeiroNome ? `, ${primeiroNome}` : ""}.
        </h1>
        {!recomendacoes.loading && <p>{atlasCopy.resumo}</p>}
      </header>

      <main className="atlas-home-main">
        <section className="atlas-home-hero-stats" aria-label="Patrimônio e saldo">
          <StatCard
            icon={<Landmark size={20} />}
            label="Patrimônio total"
            value={formatarMoeda(patrimonioTotal)}
            tone="brand"
            hint="Saldo + investimentos simulados"
          />
          <StatCard
            icon={<Wallet size={20} />}
            label="Saldo disponível"
            value={formatarMoeda(resumo.saldo)}
            tone={resumo.saldo < 0 ? "danger" : "success"}
          />
        </section>

        <section className="atlas-home-shortcuts" aria-label="Atalhos rápidos">
          <Button size="sm" onClick={() => setModalAberto({ kind: "transaction", tipo: "receita" })}>
            <ArrowUpRight size={16} aria-hidden="true" />
            Adicionar Receita
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setModalAberto({ kind: "transaction", tipo: "despesa" })}
          >
            <ArrowDownLeft size={16} aria-hidden="true" />
            Adicionar Despesa
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setModalAberto({ kind: "bill" })}>
            <Receipt size={16} aria-hidden="true" />
            Pagar Conta
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setModalAberto({ kind: "goal" })}>
            <Target size={16} aria-hidden="true" />
            Metas
          </Button>
        </section>

        <AtlasIntelligencePanel estado={recomendacoes} />

        <UpcomingBillsPanel contas={contas} />

        <GoalsPanel metas={metas} />

        <Card elevated className="atlas-home-section" aria-labelledby="movimentacoes-titulo">
          <h2 id="movimentacoes-titulo" className="atlas-home-section-titulo">
            Últimas movimentações
          </h2>
          {transacoes.actionError && <p className="atlas-panel-erro-acao">{transacoes.actionError}</p>}
          <TransactionsList
            transactions={transacoes.transactions}
            loading={transacoes.loading}
            error={transacoes.error}
            onRemover={transacoes.remover}
            onTentarNovamente={transacoes.recarregar}
          />
        </Card>

        <Card elevated className="atlas-home-section" aria-labelledby="evolucao-titulo">
          <h2 id="evolucao-titulo" className="atlas-home-section-titulo">
            Evolução financeira
          </h2>
          <p className="atlas-home-section-hint">Receitas e despesas do mês atual</p>
          <MiniBarChart
            items={[
              { label: "Receitas", value: resumo.receitasDoMes, tone: "success" },
              { label: "Despesas", value: resumo.despesasDoMes, tone: "danger" },
            ]}
            formatValue={formatarMoeda}
          />
        </Card>

        <PlanningPanel perfil={perfil} planejamento={planejamento} />
        <FixedExpensesPanel despesasFixas={despesasFixas} />
      </main>

      {modalAberto?.kind === "transaction" && (
        <TransactionModal
          tipo={modalAberto.tipo}
          onFechar={() => setModalAberto(null)}
          onSalvar={(dados) => transacoes.adicionar({ type: modalAberto.tipo, ...dados })}
        />
      )}

      {modalAberto?.kind === "bill" && (
        <BillModal
          tipo="a_pagar"
          onFechar={() => setModalAberto(null)}
          onSalvar={(dados) => contas.criar({ type: "a_pagar", ...dados })}
        />
      )}

      {modalAberto?.kind === "goal" && (
        <GoalModal onFechar={() => setModalAberto(null)} onSalvar={(dados) => metas.criar(dados)} />
      )}
    </div>
  );
}

export default HomePage;
