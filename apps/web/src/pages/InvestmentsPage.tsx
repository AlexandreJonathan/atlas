import { BookOpen, PieChart, TrendingUp } from "lucide-react";
import { MOCK_INVESTMENTS } from "../data/mockInvestments";
import Card from "../components/ui/Card";
import MiniBarChart from "../components/ui/MiniBarChart";
import StatCard from "../components/ui/StatCard";
import { useFinancialData } from "../modules/financial-data";
import "./AccountsPage.css";
import "./InvestmentsPage.css";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function InvestmentsPage() {
  const { investments } = useFinancialData();
  const data = investments ?? MOCK_INVESTMENTS;
  const {
    patrimonioInvestido,
    rendimentoMensalPercentual,
    rendimentoMensalValor,
    distribuicao,
    oportunidades,
  } = data;

  return (
    <div className="atlas-page-shell atlas-page">
      <header className="atlas-page-header">
        <div>
          <p className="atlas-page-eyebrow">Estudo</p>
          <h1>Investimentos</h1>
          <p>Acompanhe e estude — sem pressão para comprar</p>
        </div>
      </header>

      <main className="atlas-page-main">
        <p className="atlas-page-note" role="note">
          A Atlas não vende investimentos. Aqui você só acompanha e estuda.
        </p>

        <div className="atlas-invest-stats">
          <StatCard
            icon={<PieChart size={20} />}
            label="Patrimônio investido"
            value={formatarMoeda(patrimonioInvestido)}
            tone="brand"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Rendimento no mês"
            value={`+${rendimentoMensalPercentual.toFixed(2)}%`}
            tone="success"
            hint={formatarMoeda(rendimentoMensalValor)}
          />
        </div>

        <Card elevated className="atlas-page-section" aria-labelledby="distribuicao-titulo">
          <h2 id="distribuicao-titulo" className="atlas-page-section-titulo">
            Distribuição
          </h2>
          <MiniBarChart items={distribuicao} formatValue={formatarMoeda} />
        </Card>

        <Card elevated className="atlas-page-section" aria-labelledby="oportunidades-titulo">
          <h2 id="oportunidades-titulo" className="atlas-page-section-titulo">
            <BookOpen size={20} aria-hidden="true" />
            Oportunidades para estudar
          </h2>
          <ul className="atlas-page-list">
            {oportunidades.map((item) => (
              <li key={item.id} className="atlas-page-list-item atlas-page-list-item-stack">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </li>
            ))}
          </ul>
        </Card>
      </main>
    </div>
  );
}

export default InvestmentsPage;
