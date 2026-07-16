import { useEffect, useState } from "react";
import type { useFinancialProfile } from "../../hooks/useFinancialProfile";
import type { useFixedExpenses } from "../../hooks/useFixedExpenses";
import type { useGoals } from "../../hooks/useGoals";
import type { useOnboarding } from "../../hooks/useOnboarding";
import { analytics } from "../../lib/analytics";
import { getFriendlyErrorMessage } from "../../lib/errorMessages";
import AtlasLogo from "../ui/AtlasLogo";
import Card from "../ui/Card";
import ProgressBar from "../ui/ProgressBar";
import FinishStep from "./FinishStep";
import FirstGoalStep from "./FirstGoalStep";
import FixedExpensesStep from "./FixedExpensesStep";
import IncomeStep from "./IncomeStep";
import "./OnboardingWizard.css";
import ReserveStep from "./ReserveStep";
import WelcomeStep from "./WelcomeStep";

type OnboardingWizardProps = {
  onboarding: ReturnType<typeof useOnboarding>;
  perfil: ReturnType<typeof useFinancialProfile>;
  despesasFixas: ReturnType<typeof useFixedExpenses>;
  metas: ReturnType<typeof useGoals>;
  onPularPorAgora: () => void;
};

// Wizard de primeiro acesso (Sprint 6): substitui o Dashboard normal
// enquanto o onboarding não é concluído. O progresso (passo atual) é
// persistido a cada avanço via `useOnboarding`, para retomar corretamente
// em uma sessão futura caso o usuário saia no meio do fluxo. Renda e
// reserva mínima ficam em estado local até o passo 3 ser confirmado, quando
// são salvas juntas em uma única chamada a `perfil.salvar` (mesmo formato
// usado pelo `FinancialProfileModal`).
function OnboardingWizard({ onboarding, perfil, despesasFixas, metas, onPularPorAgora }: OnboardingWizardProps) {
  const [passo, setPasso] = useState(onboarding.passoAtual);
  const [rendaMensal, setRendaMensal] = useState<number | null>(perfil.profile?.monthlyIncome ?? null);
  const [reservaMinima, setReservaMinima] = useState<number | null>(perfil.profile?.minimumReserve ?? null);
  const [erro, setErro] = useState("");
  const [processando, setProcessando] = useState(false);

  // Corrige um caso de borda: se o usuário recarregar a página exatamente no
  // passo 3 (reserva mínima) — passo persistido, mas ainda dentro da janela
  // em que a renda mensal só existe em estado local (só é salva junto com a
  // reserva ao confirmar este passo) — "rendaMensal" se perde no remount.
  // Sem essa guarda, a confirmação da reserva salvaria "monthlyIncome: 0",
  // violando a constraint do banco (`monthly_income > 0`) e mostrando um
  // erro genérico sem explicação. Volta automaticamente ao passo 2 para o
  // usuário reinformar a renda antes de prosseguir.
  useEffect(() => {
    if (passo === 3 && rendaMensal == null) {
      Promise.resolve().then(() => setPasso(2));
    }
  }, [passo, rendaMensal]);

  async function irPara(proximoPasso: number) {
    setErro("");
    setProcessando(true);

    try {
      await onboarding.avancarPara(proximoPasso);
      setPasso(proximoPasso);
    } catch (erroCapturado) {
      setErro(getFriendlyErrorMessage(erroCapturado, "Não foi possível salvar seu progresso."));
    } finally {
      setProcessando(false);
    }
  }

  async function handleReservaConfirmada(valor: number) {
    setErro("");
    setProcessando(true);

    try {
      await perfil.salvar({ monthlyIncome: rendaMensal ?? 0, minimumReserve: valor });
      setReservaMinima(valor);
      await onboarding.avancarPara(4);
      setPasso(4);
    } catch (erroCapturado) {
      setErro(getFriendlyErrorMessage(erroCapturado, "Não foi possível salvar seu perfil financeiro."));
    } finally {
      setProcessando(false);
    }
  }

  async function handleConcluir() {
    setErro("");
    setProcessando(true);

    try {
      await onboarding.concluir();
      analytics.track("onboarding_completed");
    } catch (erroCapturado) {
      setErro(getFriendlyErrorMessage(erroCapturado, "Não foi possível concluir a configuração."));
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="atlas-onboarding-overlay">
      <Card
        elevated
        glow
        padding="lg"
        className="atlas-onboarding-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-titulo"
      >
        <div className="atlas-onboarding-brand">
          <AtlasLogo size={32} />
        </div>

        <div className="atlas-onboarding-progresso">
          <span id="onboarding-titulo">
            Passo {passo} de {onboarding.totalPassos}
          </span>
          <ProgressBar
            value={passo / onboarding.totalPassos}
            label={`Progresso do onboarding: passo ${passo} de ${onboarding.totalPassos}`}
          />
        </div>

        {erro && <p className="atlas-erro-geral">{erro}</p>}

        {passo === 1 && <WelcomeStep onAvancar={() => irPara(2)} />}

        {passo === 2 && (
          <IncomeStep
            valorInicial={rendaMensal}
            processando={processando}
            onAvancar={(valor) => {
              setRendaMensal(valor);
              irPara(3);
            }}
          />
        )}

        {passo === 3 && (
          <ReserveStep
            valorInicial={reservaMinima}
            processando={processando}
            onVoltar={() => setPasso(2)}
            onAvancar={handleReservaConfirmada}
          />
        )}

        {passo === 4 && (
          <FixedExpensesStep despesasFixas={despesasFixas} onVoltar={() => setPasso(3)} onAvancar={() => irPara(5)} />
        )}

        {passo === 5 && (
          <FirstGoalStep metas={metas} onVoltar={() => setPasso(4)} onAvancar={() => irPara(6)} />
        )}

        {passo === 6 && (
          <FinishStep
            rendaMensal={rendaMensal}
            reservaMinima={reservaMinima}
            totalDespesasFixas={despesasFixas.totalDespesasFixas}
            totalMetas={metas.goals.length}
            processando={processando}
            onConcluir={handleConcluir}
          />
        )}

        {passo < 6 && (
          <button type="button" className="atlas-onboarding-pular" onClick={onPularPorAgora}>
            Pular por agora (você pode retomar no próximo acesso)
          </button>
        )}
      </Card>
    </div>
  );
}

export default OnboardingWizard;
