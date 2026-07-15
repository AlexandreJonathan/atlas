import type { ReactNode } from "react";
import AtlasLogo from "./ui/AtlasLogo";
import Card from "./ui/Card";
import "./AuthLayout.css";

type AuthLayoutProps = {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
};

// Shell compartilhado por Login/Register/ForgotPassword/ResetPassword —
// antes desta missão, cada uma duplicava a mesma estrutura de
// `.login-container > .login-card` via CSS solto em App.css.
function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="atlas-auth-container">
      <Card elevated padding="lg" className="atlas-auth-card">
        <div className="atlas-auth-brand">
          <AtlasLogo size={36} />
        </div>

        <div className="atlas-auth-heading">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        {children}

        {footer && <div className="atlas-auth-footer">{footer}</div>}
      </Card>
    </div>
  );
}

export default AuthLayout;
