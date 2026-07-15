import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import "./Input.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
};

// Campo de formulário do Design System — encapsula label/ícone/erro em um
// único componente, mas mantém compatibilidade total com `register()` do
// react-hook-form (spread de `...rest` + `ref` encaminhada).
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, icon, id, className, ...rest },
  ref,
) {
  const inputId = id ?? (typeof rest.name === "string" ? rest.name : undefined);
  const describedBy = error ? `${inputId}-erro` : hint ? `${inputId}-dica` : undefined;

  return (
    <div className="atlas-field">
      {label && (
        <label className="atlas-field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={`atlas-input-wrapper ${error ? "atlas-input-wrapper-error" : ""}`}>
        {icon && (
          <span className="atlas-input-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`atlas-input ${icon ? "atlas-input-has-icon" : ""} ${className ?? ""}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
      </div>
      {hint && !error && (
        <span id={`${inputId}-dica`} className="atlas-field-hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${inputId}-erro`} className="atlas-field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

export default Input;
