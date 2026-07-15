import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { useGoals } from "../../hooks/useGoals";
import { getFriendlyErrorMessage } from "../../lib/errorMessages";
import type { GoalFormData } from "../../types/goal";
import { goalSchema } from "../../validations/goalSchema";

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
    <div className="onboarding-passo">
      <h2>🎯 Que tal já criar sua primeira meta?</h2>
      <p>Uma viagem, uma reserva maior, um objeto que você quer comprar. É opcional — você pode criar depois no Dashboard.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="campo">
          <input type="text" placeholder="Nome da meta" aria-label="Nome da meta" {...register("title")} />
          {errors.title && <span className="erro-campo">{errors.title.message}</span>}
        </div>

        <div className="campo">
          <input
            type="number"
            step="0.01"
            placeholder="Valor da meta"
            aria-label="Valor da meta"
            {...register("targetAmount")}
          />
          {errors.targetAmount && <span className="erro-campo">{errors.targetAmount.message}</span>}
        </div>

        <div className="campo">
          <input type="date" aria-label="Prazo (opcional)" {...register("targetDate")} />
        </div>

        {erroGeral && <span className="erro-geral">{erroGeral}</span>}

        <div className="onboarding-acoes">
          <button type="submit" className="btn-secundario" disabled={salvando}>
            {salvando ? "Criando..." : "+ Criar meta"}
          </button>
        </div>
      </form>

      {!metas.loading && metas.goals.length > 0 && (
        <div className="onboarding-lista">
          {metas.goals.map((goal) => (
            <div className="onboarding-item" key={goal.id}>
              <span>{goal.title}</span>
              <strong>R$ {goal.targetAmount.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}

      <div className="onboarding-acoes">
        <button type="button" className="btn-secundario" onClick={onVoltar}>
          Voltar
        </button>
        <button type="button" className="btn-primario" onClick={onAvancar}>
          Continuar
        </button>
      </div>
    </div>
  );
}

export default FirstGoalStep;
