import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart } from "lucide-react";
import AsyncStateView from "../../../components/AsyncStateView";
import FinancialProfileModal from "../../../components/FinancialProfileModal";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import MiniBarChart from "../../../components/ui/MiniBarChart";
import { featureFlagService } from "../../../config";
import { financialPlannerService } from "../services/FinancialPlannerService";
import { useFinancialPlanner } from "../hooks/useFinancialPlanner";
import "../components/FinancialPlannerPage.css";

function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const RISK_TONE = {
  baixo: "positiva",
  medio: "atencao",
  alto: "critica",
} as const;

function FinancialPlannerPage() {
  const { plan, configured, loading, error, reload, perfil } = useFinancialPlanner();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    financialPlannerService.trackOpened();
  }, []);

  const showBudgetLink = featureFlagService.isEnabled("budgetPlanner");
  const showGoalsLink = featureFlagService.isEnabled("smartGoals");

  return (
    <div className="atlas-page-shell atlas-financial-planner-page">
      <header className="atlas-financial-planner-header">
        <div>
          <h1>
            <LineChart size={22} aria-hidden="true" /> Planejamento
          </h1>
          <p>
            Plano de ação derivado da sua renda, despesas, orçamento e metas —
            sem duplicar regras de negócio.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setModalOpen(true)}
          aria-label="Configurar renda e reserva"
        >
          {configured ? "Ajustar perfil" : "Configurar"}
        </Button>
      </header>

      <div className="atlas-fp-links" aria-label="Módulos relacionados">
        {showBudgetLink ? <Link to="/orcamento">Orçamento</Link> : null}
        {showGoalsLink ? <Link to="/metas">Metas</Link> : null}
      </div>

      <AsyncStateView
        loading={loading && !plan}
        error={error}
        isEmpty={!configured || !plan}
        emptyMessage={
          <div className="atlas-fp-empty">
            <h2>Planejamento ainda não configurado</h2>
            <p>
              Informe renda mensal e reserva mínima. Em seguida o Atlas calcula
              sobra, capacidade de aporte e previsão das metas.
            </p>
            <Button onClick={() => setModalOpen(true)}>Configurar planejamento</Button>
          </div>
        }
        onRetry={() => reload()}
        loadingMessage="Calculando seu plano..."
      >
        {plan ? (
          <>
            <section
              className="atlas-surface atlas-surface-pad atlas-fp-section"
              aria-labelledby="fp-resumo-titulo"
            >
              <h2 id="fp-resumo-titulo">Resumo do mês</h2>
              <div className="atlas-fp-grid">
                <div className="atlas-fp-stat">
                  <span>Saldo projetado</span>
                  <strong>{formatMoney(plan.projectedBalance)}</strong>
                </div>
                <div className="atlas-fp-stat">
                  <span>Renda mensal</span>
                  <strong>{formatMoney(plan.monthlyIncome)}</strong>
                </div>
                <div className="atlas-fp-stat">
                  <span>Despesas mensais</span>
                  <strong>{formatMoney(plan.monthlyExpenses)}</strong>
                </div>
                <div className="atlas-fp-stat">
                  <span>Sobra mensal</span>
                  <strong>{formatMoney(plan.monthlySurplus)}</strong>
                </div>
                <div className="atlas-fp-stat">
                  <span>Capacidade de aporte</span>
                  <strong>{formatMoney(plan.contributionCapacity)}</strong>
                </div>
                <div className="atlas-fp-stat">
                  <span>Capacidade de investimento</span>
                  <strong>{formatMoney(plan.investmentCapacity)}</strong>
                </div>
              </div>
              <div className="atlas-fp-grid">
                <div className="atlas-fp-stat">
                  <span>Posso gastar / dia</span>
                  <strong>{formatMoney(plan.dailySpendAllowance)}</strong>
                </div>
                <div className="atlas-fp-stat">
                  <span>Precisa guardar / mês</span>
                  <strong>{formatMoney(plan.requiredMonthlySave)}</strong>
                </div>
                <div className="atlas-fp-stat">
                  <span>Risco</span>
                  <Badge tone={RISK_TONE[plan.risk]}>{plan.risk}</Badge>
                </div>
              </div>
            </section>

            <section
              className="atlas-surface atlas-surface-pad atlas-fp-section"
              aria-labelledby="fp-metas-titulo"
            >
              <h2 id="fp-metas-titulo">Previsão das metas</h2>
              {plan.goalForecasts.length === 0 ? (
                <p className="atlas-fp-goal-meta">
                  Nenhuma meta ativa. Crie metas em{" "}
                  <Link to="/metas">Smart Goals</Link> para ver o ritmo de aporte.
                </p>
              ) : (
                <ul className="atlas-fp-goal-list">
                  {plan.goalForecasts.map((forecast) => (
                    <li
                      key={forecast.goalId}
                      className={`atlas-fp-goal-item${forecast.onTrack ? "" : " is-off"}`}
                    >
                      <div className="atlas-fp-goal-top">
                        <h3>{forecast.title}</h3>
                        <Badge tone={forecast.onTrack ? "positiva" : "atencao"}>
                          {forecast.onTrack ? "No ritmo" : "Ajustar"}
                        </Badge>
                      </div>
                      <p className="atlas-fp-goal-meta">
                        Falta {formatMoney(forecast.remainingAmount)}
                        {forecast.monthlyNeeded > 0
                          ? ` · ${formatMoney(forecast.monthlyNeeded)}/mês`
                          : ""}
                      </p>
                      <p className="atlas-fp-goal-meta">{forecast.etaLabel}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {plan.installmentCommitment > 0 || plan.pressureMonths.length > 0 ? (
              <section
                className="atlas-surface atlas-surface-pad atlas-fp-section"
                aria-labelledby="fp-parcelas-titulo"
              >
                <h2 id="fp-parcelas-titulo">Compromisso com parcelas</h2>
                <div className="atlas-fp-grid">
                  <div className="atlas-fp-stat">
                    <span>Parcelas neste mês</span>
                    <strong>{formatMoney(plan.installmentCommitment)}</strong>
                  </div>
                  <div className="atlas-fp-stat">
                    <span>Liberação futura</span>
                    <strong>{formatMoney(plan.releaseAfterInstallments)}</strong>
                  </div>
                </div>
                {plan.pressureMonths.length > 0 ? (
                  <p className="atlas-fp-goal-meta">
                    Maior pressão:{" "}
                    {plan.pressureMonths
                      .map((m) => `${m.label} (${formatMoney(m.amount)})`)
                      .join(" · ")}
                    .{" "}
                    <Link to="/parcelas">Ver parcelas</Link>
                  </p>
                ) : null}
              </section>
            ) : null}

            <section
              className="atlas-surface atlas-surface-pad atlas-fp-section"
              aria-labelledby="fp-evolucao-titulo"
            >
              <h2 id="fp-evolucao-titulo">Evolução mensal projetada</h2>
              <MiniBarChart
                items={plan.projections.map((p) => ({
                  label: p.label,
                  value: Math.max(0, p.projectedBalance),
                  tone:
                    p.projectedBalance < 0
                      ? "danger"
                      : p.projectedSurplus < 0
                        ? "warning"
                        : "success",
                }))}
                formatValue={formatMoney}
              />
            </section>
          </>
        ) : null}
      </AsyncStateView>

      {modalOpen ? (
        <FinancialProfileModal
          perfilAtual={perfil.profile}
          onFechar={() => setModalOpen(false)}
          onSalvar={async (dados) => {
            await perfil.salvar(dados);
            setModalOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

export default FinancialPlannerPage;
