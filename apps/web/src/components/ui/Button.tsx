import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
};

// Componente base de botão do Design System — ver roadmap/design-system.md.
// Substitui as ~10 classes de botão duplicadas que existiam antes desta
// missão (.btn-primary, .btn-logout, .btn-remover, .btn-primario, etc.).
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", fullWidth = false, loading = false, disabled, className, children, ...rest },
  ref,
) {
  const classes = [
    "atlas-btn",
    `atlas-btn-${variant}`,
    `atlas-btn-${size}`,
    fullWidth ? "atlas-btn-full" : "",
    loading ? "atlas-btn-loading" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <span className="atlas-btn-spinner" aria-hidden="true" />}
      <span className="atlas-btn-content">{children}</span>
    </button>
  );
});

export default Button;
