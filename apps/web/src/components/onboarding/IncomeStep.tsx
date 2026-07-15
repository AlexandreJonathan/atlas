import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { monthlyIncomeSchema } from "../../validations/financialProfileSchema";
import Button from "../ui/Button";
import Input from "../ui/Input";
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
    <form className="atlas-onboarding-step" onSubmit={handleSubmit(onSubmit)} noValidate>
      <span className="atlas-onboarding-step-icon">
        <Wallet size={26} aria-hidden="true" />
      </span>

      <h2>Qual sua renda mensal?</h2>
      <p>Pode ser seu salário ou a renda mensal que você prevê receber. Isso é a base de todo o cálculo do planejamento financeiro.</p>

      <Input
        type="number"
        step="0.01"
        placeholder="Renda mensal"
        aria-label="Renda mensal"
        autoFocus
        error={errors.monthlyIncome?.message}
        {...register("monthlyIncome")}
      />

      <div className="atlas-onboarding-acoes">
        <Button type="submit" loading={processando}>
          {processando ? "Salvando..." : "Continuar"}
        </Button>
      </div>
    </form>
  );
}

export default IncomeStep;
