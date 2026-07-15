import { Sparkles } from "lucide-react";
import Button from "../ui/Button";

type WelcomeStepProps = {
  onAvancar: () => void;
};

function WelcomeStep({ onAvancar }: WelcomeStepProps) {
  return (
    <div className="atlas-onboarding-step">
      <span className="atlas-onboarding-step-icon">
        <Sparkles size={26} aria-hidden="true" />
      </span>

      <h2>Bem-vindo à Atlas</h2>
      <p>
        Vamos configurar o essencial para o Atlas já começar a te ajudar hoje: sua renda, sua reserva
        mínima, suas despesas fixas e sua primeira meta. Leva menos de dois minutos.
      </p>

      <div className="atlas-onboarding-acoes">
        <Button type="button" onClick={onAvancar}>
          Vamos começar
        </Button>
      </div>
    </div>
  );
}

export default WelcomeStep;
