import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useFinancialProfile } from "../../hooks/useFinancialProfile";
import { useFixedExpenses } from "../../hooks/useFixedExpenses";
import { useGoals } from "../../hooks/useGoals";
import { useOnboarding } from "../../hooks/useOnboarding";
import {
  startOpenFinanceMicrointeractionBridge,
  ToastHost,
} from "../../lib/microinteractions";
import OnboardingWizard from "../onboarding/OnboardingWizard";
import "./AppShell.css";
import BottomNavigation from "./BottomNavigation";

// Shell autenticado: Bottom Navigation + Outlet das abas. O onboarding
// continua substituindo o app inteiro até ser concluído ou adiado na sessão
// (mesma regra que vivia no Dashboard monolítico).
function AppShell() {
  const perfil = useFinancialProfile();
  const despesasFixas = useFixedExpenses();
  const metas = useGoals();

  const onboarding = useOnboarding({
    perfilJaConfigurado: perfil.profile != null,
    perfilCarregando: perfil.loading,
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
