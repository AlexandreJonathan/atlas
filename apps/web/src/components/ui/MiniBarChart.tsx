import "./MiniBarChart.css";

type MiniBarChartItem = {
  label: string;
  value: number;
  tone?: "brand" | "success" | "warning" | "danger" | "info";
};

type MiniBarChartProps = {
  items: MiniBarChartItem[];
  formatValue?: (value: number) => string;
};

// Mini gráfico de barras horizontais em SVG/CSS puro (sem biblioteca de
// gráficos) — usado para comparar valores já calculados pelos hooks
// existentes (ex: receitas x despesas do mês). Ver roadmap/design-system.md.
function MiniBarChart({ items, formatValue }: MiniBarChartProps) {
  const maior = Math.max(1, ...items.map((item) => Math.abs(item.value)));

  return (
    <div className="atlas-mini-bar-chart">
      {items.map((item) => {
        const largura = Math.min(100, (Math.abs(item.value) / maior) * 100);
        return (
          <div className="atlas-mini-bar-row" key={item.label}>
            <span className="atlas-mini-bar-label">{item.label}</span>
            <div className="atlas-mini-bar-track">
              <div
                className={`atlas-mini-bar-fill atlas-mini-bar-fill-${item.tone ?? "brand"}`}
                style={{ width: `${largura}%` }}
              />
            </div>
            <span className="atlas-mini-bar-value tabular-nums">
              {formatValue ? formatValue(item.value) : item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default MiniBarChart;
