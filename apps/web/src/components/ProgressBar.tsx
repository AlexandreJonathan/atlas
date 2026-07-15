type ProgressBarProps = {
  value: number;
  label: string;
};

function ProgressBar({ value, label }: ProgressBarProps) {
  const percentual = Math.min(100, Math.max(0, Math.round(value * 100)));

  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-valuenow={percentual}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="progress-bar-fill" style={{ width: `${percentual}%` }} />
      <span className="progress-bar-texto">{percentual}%</span>
    </div>
  );
}

export default ProgressBar;
