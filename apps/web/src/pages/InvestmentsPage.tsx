import { BookOpen, PieChart, TrendingUp } from "lucide-react";
import { MOCK_INVESTMENTS } from "../data/mockInvestments";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import MiniBarChart from "../components/ui/MiniBarChart";
import StatCard from "../components/ui/StatCard";
import "./AccountsPage.css";
import "./InvestmentsPage.css";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function InvestmentsPage() {
  const { patrimonioInvestido, rendimentoMensalPercentual, rendimentoMensalValor, distribuicao, oportunidades } =
    MOCK_INVESTMENTS;

  return (
    <div className="atlas-page">
      <header className="atlas-page-header">
        <div>
          <h1>Investimentos</h1>
          <p>Acompanhe e estude — sem pressão para comprar</p>
        </div>
        <Badge tone="informativa">Dados simulados</Badge>
      </header>

      <main className="atlas-page-main">
        <p className="atlas-page-disclaimer" role="note">
          A Atlas não vende investimentos.
        </p>

        <div className="atlas-invest-stats">
          <StatCard
            icon={<PieChart size={20} />}
            label="Patrimônio investido"
            value={formatarMoeda(patrimonioInvestido)}
            tone="brand"
            hint="Prévia simulada"
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
