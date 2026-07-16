import { useEffect, useRef } from "react";
import MiniBarChart from "../ui/MiniBarChart";
import { AnimatedNumber, pulseGlow } from "../../lib/microinteractions";
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
  const sectionRef = useRef<HTMLElement>(null);
  const prevSaldoRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevSaldoRef.current;
    if (prev != null && saldoDisponivel > prev && sectionRef.current) {
      pulseGlow(sectionRef.current);
    }
    prevSaldoRef.current = saldoDisponivel;
  }, [saldoDisponivel]);

  return (
    <section ref={sectionRef} className="atlas-wealth-hero" aria-label="Patrimônio e saldo">
      <div className="atlas-wealth-hero-glow" aria-hidden="true" />

      <p className="atlas-wealth-hero-label">Patrimônio total</p>
      <p className="atlas-wealth-hero-patrimonio tabular-nums">
        <AnimatedNumber value={patrimonioTotal} format={formatarMoeda} />
      </p>

      <div className="atlas-wealth-hero-saldo">
        <span className="atlas-wealth-hero-saldo-label">Saldo disponível</span>
        <span
          className={`atlas-wealth-hero-saldo-valor tabular-nums${
            saldoNegativo ? " atlas-wealth-hero-saldo-valor-negativo" : ""
          }`}
        >
          <AnimatedNumber value={saldoDisponivel} format={formatarMoeda} />
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
