type WelcomeStepProps = {
  onAvancar: () => void;
};

function WelcomeStep({ onAvancar }: WelcomeStepProps) {
  return (
    <div className="onboarding-passo">
      <h2>👋 Bem-vindo à Atlas</h2>
      <p>
        Vamos configurar o essencial para o Atlas já começar a te ajudar hoje: sua renda, sua reserva
        mínima, suas despesas fixas e sua primeira meta. Leva menos de dois minutos.
      </p>

      <div className="onboarding-acoes">
        <button type="button" className="btn-primario" onClick={onAvancar}>
          Vamos começar
        </button>
      </div>
    </div>
  );
}

export default WelcomeStep;
