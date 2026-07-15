import { zodResolver } from "@hookform/resolvers/zod";
import { Target } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { useGoals } from "../../hooks/useGoals";
import { getFriendlyErrorMessage } from "../../lib/errorMessages";
import type { GoalFormData } from "../../types/goal";
import { goalSchema } from "../../validations/goalSchema";
import Button from "../ui/Button";
import Input from "../ui/Input";

type FirstGoalStepProps = {
  metas: ReturnType<typeof useGoals>;
  onVoltar: () => void;
  onAvancar: () => void;
};

function FirstGoalStep({ metas, onVoltar, onAvancar }: FirstGoalStepProps) {
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
  });

  async function onSubmit(dados: GoalFormData) {
    setErroGeral("");
    setSalvando(true);

    try {
      await metas.criar({
        title: dados.title,
        targetAmount: Number(dados.targetAmount),
        targetDate: dados.targetDate && dados.targetDate.length > 0 ? dados.targetDate : null,
      });
      reset();
    } catch (erro) {
      setErroGeral(getFriendlyErrorMessage(erro, "Não foi possível salvar a meta."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="atlas-onboarding-step">
      <span className="atlas-onboarding-step-icon">
        <Target size={26} aria-hidden="true" />
      </span>

      <h2>Que tal já criar sua primeira meta?</h2>
      <p>Uma viagem, uma reserva maior, um objeto que você quer comprar. É opcional — você pode criar depois no Dashboard.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          type="text"
          placeholder="Nome da meta"
          aria-label="Nome da meta"
          error={errors.title?.message}
          {...register("title")}
        />

        <Input
          type="number"
          step="0.01"
          placeholder="Valor da meta"
          aria-label="Valor da meta"
          error={errors.targetAmount?.message}
          {...register("targetAmount")}
        />

        <Input type="date" aria-label="Prazo (opcional)" {...register("targetDate")} />

        {erroGeral && <span className="atlas-erro-geral">{erroGeral}</span>}

        <div className="atlas-onboarding-acoes">
          <Button type="submit" variant="secondary" loading={salvando}>
            {salvando ? "Criando..." : "+ Criar meta"}
          </Button>
        </div>
      </form>

      {!metas.loading && metas.goals.length > 0 && (
        <div className="atlas-onboarding-lista">
          {metas.goals.map((goal) => (
            <div className="atlas-onboarding-item" key={goal.id}>
              <span>{goal.title}</span>
              <strong className="tabular-nums">R$ {goal.targetAmount.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}

      <div className="atlas-onboarding-acoes">
        <Button type="button" variant="secondary" onClick={onVoltar}>
          Voltar
        </Button>
        <Button type="button" onClick={onAvancar}>
          Continuar
        </Button>
      </div>
    </div>
  );
}

export default FirstGoalStep;
