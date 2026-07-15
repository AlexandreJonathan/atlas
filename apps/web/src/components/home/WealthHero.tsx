import MiniBarChart from "../ui/MiniBarChart";
import "./WealthHero.css";

type WealthHeroProps = {
  patrimonioTotal: number;
  saldoDisponivel: number;
  receitasDoMes: number;
  despesasDoMes: number;
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function WealthHero({ patrimonioTotal, saldoDisponivel, receitasDoMes, despesasDoMes }: WealthHeroProps) {
  const saldoNegativo = saldoDisponivel < 0;

  return (
    <section className="atlas-wealth-hero" aria-label="Patrimônio e saldo">
      <div className="atlas-wealth-hero-glow" aria-hidden="true" />

      <p className="atlas-wealth-hero-label">Patrimônio total</p>
      <p className="atlas-wealth-hero-patrimonio tabular-nums">{formatarMoeda(patrimonioTotal)}</p>

      <div className="atlas-wealth-hero-saldo">
        <span className="atlas-wealth-hero-saldo-label">Saldo disponível</span>
        <span
          className={`atlas-wealth-hero-saldo-valor tabular-nums${
            saldoNegativo ? " atlas-wealth-hero-saldo-valor-negativo" : ""
          }`}
        >
          {formatarMoeda(saldoDisponivel)}
        </span>
      </div>

      <div className="atlas-wealth-hero-chart">
        <MiniBarChart
          items={[
            { label: "Receitas", value: receitasDoMes, tone: "success" },
            { label: "Despesas", value: despesasDoMes, tone: "danger" },
          ]}
          formatValue={formatarMoeda}
        />
      </div>
    </section>
  );
}

export default WealthHero;
