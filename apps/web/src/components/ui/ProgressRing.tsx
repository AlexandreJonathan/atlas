import "./ProgressRing.css";

type ProgressRingProps = {
  value: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  tone?: "brand" | "success" | "warning" | "danger";
  centerText?: string;
};

// Anel de progresso em SVG puro (sem biblioteca de gráficos) — usado em
// metas e no painel de planejamento. Ver roadmap/design-system.md.
function ProgressRing({ value, label, size = 96, strokeWidth = 10, tone = "brand", centerText }: ProgressRingProps) {
  const percentual = Math.min(100, Math.max(0, value * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentual / 100);

  return (
    <div
      className="atlas-progress-ring"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(percentual)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="atlas-progress-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          className={`atlas-progress-ring-fill atlas-progress-ring-fill-${tone}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {centerText && <span className="atlas-progress-ring-text">{centerText}</span>}
    </div>
  );
}

export default ProgressRing;
