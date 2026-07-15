import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { monthlyIncomeSchema } from "../../validations/financialProfileSchema";
import type { z } from "zod";

type IncomeFormData = z.infer<typeof monthlyIncomeSchema>;

type IncomeStepProps = {
  valorInicial: number | null;
  processando: boolean;
  onAvancar: (valor: number) => void;
};

function IncomeStep({ valorInicial, processando, onAvancar }: IncomeStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(monthlyIncomeSchema),
    defaultValues: { monthlyIncome: valorInicial ? String(valorInicial) : "" },
  });

  function onSubmit(dados: IncomeFormData) {
    onAvancar(Number(dados.monthlyIncome));
  }

  return (
    <form className="onboarding-passo" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>💰 Qual sua renda mensal?</h2>
      <p>Pode ser seu salário ou a renda mensal que você prevê receber. Isso é a base de todo o cálculo do planejamento financeiro.</p>

      <div className="campo">
        <input
          type="number"
          step="0.01"
          placeholder="Renda mensal"
          aria-label="Renda mensal"
          autoFocus
          {...register("monthlyIncome")}
        />
        {errors.monthlyIncome && <span className="erro-campo">{errors.monthlyIncome.message}</span>}
      </div>

      <div className="onboarding-acoes">
        <button type="submit" className="btn-primario" disabled={processando}>
          {processando ? "Salvando..." : "Continuar"}
        </button>
      </div>
    </form>
  );
}

export default IncomeStep;
