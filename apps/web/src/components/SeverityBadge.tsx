export type SeverityTone = "critica" | "atencao" | "positiva" | "informativa" | "neutra";

type SeverityBadgeProps = {
  tone: SeverityTone;
  label: string;
};

const CONFIG: Record<SeverityTone, { icon: string; className: string }> = {
  critica: { icon: "🔴", className: "severity-critica" },
  atencao: { icon: "🟡", className: "severity-atencao" },
  positiva: { icon: "✅", className: "severity-positiva" },
  informativa: { icon: "ℹ️", className: "severity-informativa" },
  neutra: { icon: "⚪", className: "severity-neutra" },
};

// Severidade é sempre comunicada por ícone + texto (nunca só cor), para
// não depender de percepção de cor (acessibilidade).
function SeverityBadge({ tone, label }: SeverityBadgeProps) {
  const config = CONFIG[tone];

  return (
    <span className={`severity-badge ${config.className}`}>
      <span aria-hidden="true">{config.icon}</span> {label}
    </span>
  );
}

export default SeverityBadge;
