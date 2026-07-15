import "./ProgressBar.css";

type ProgressBarProps = {
  value: number;
  label: string;
};

// Movido de components/ para components/ui/ nesta missão — mesma API e
// comportamento de antes, apenas com o visual do Design System.
function ProgressBar({ value, label }: ProgressBarProps) {
  const percentual = Math.min(100, Math.max(0, Math.round(value * 100)));

  return (
    <div
      className="atlas-progress-bar"
      role="progressbar"
      aria-valuenow={percentual}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="atlas-progress-bar-fill" style={{ width: `${percentual}%` }} />
      <span className="atlas-progress-bar-texto">{percentual}%</span>
    </div>
  );
}

export default ProgressBar;
