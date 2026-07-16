import { ChevronRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { MOCK_INVESTMENTS } from "../../data/mockInvestments";
import "./InvestmentsTeaser.css";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function InvestmentsTeaser() {
  const { patrimonioInvestido, rendimentoMensalPercentual } = MOCK_INVESTMENTS;

  return (
    <section className="atlas-surface atlas-invest-teaser" aria-labelledby="invest-teaser-titulo">
      <div className="atlas-home-block-header">
        <h2 id="invest-teaser-titulo">
          <TrendingUp size={18} aria-hidden="true" /> Investimentos
        </h2>
      </div>

      <p className="atlas-invest-teaser-valor tabular-nums">{formatarMoeda(patrimonioInvestido)}</p>
      <p className="atlas-invest-teaser-delta">
        Rendimento no mês · +{rendimentoMensalPercentual.toFixed(2)}%
      </p>
      <p className="atlas-invest-teaser-disclaimer">A Atlas não vende investimentos.</p>

      <Link to="/investimentos" className="atlas-home-block-link">
        Ver investimentos
        <ChevronRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}

export default InvestmentsTeaser;
