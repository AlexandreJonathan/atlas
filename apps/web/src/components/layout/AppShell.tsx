import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useOnboarding } from "../../hooks/useOnboarding";
import {
  startOpenFinanceMicrointeractionBridge,
  ToastHost,
} from "../../lib/microinteractions";
import { useFinancialData } from "../../modules/financial-data";
import OnboardingWizard from "../onboarding/OnboardingWizard";
import "./AppShell.css";
import BottomNavigation from "./BottomNavigation";

// Shell autenticado: Bottom Navigation + Outlet das abas.
// Perfil/metas/despesas fixas vêm da Financial Data Layer (cache compartilhado).
function AppShell() {
  const { perfil, despesasFixas, metas, loading: financialLoading } = useFinancialData();

  const onboarding = useOnboarding({
    perfilJaConfigurado: perfil.profile != null,
    perfilCarregando: financialLoading || perfil.loading,
  });
  const [onboardingOcultoNestaSessao, setOnboardingOcultoNestaSessao] = useState(false);

  useEffect(() => startOpenFinanceMicrointeractionBridge(), []);

  if (onboarding.loading) {
    return <div className="atlas-page-loader">Carregando...</div>;
  }

  if (!onboarding.completo && !onboardingOcultoNestaSessao) {
    return (
      <>
        <ToastHost />
        <OnboardingWizard
          onboarding={onboarding}
          perfil={perfil}
          despesasFixas={despesasFixas}
          metas={metas}
          onPularPorAgora={() => setOnboardingOcultoNestaSessao(true)}
        />
      </>
    );
  }

  return (
    <div className="atlas-app-shell">
      <ToastHost />
      <div className="atlas-app-shell-content">
        <Outlet />
      </div>
      <BottomNavigation />
    </div>
  );
}

export default AppShell;
