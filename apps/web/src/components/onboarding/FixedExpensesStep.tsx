import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { useFixedExpenses } from "../../hooks/useFixedExpenses";
import { getFriendlyErrorMessage } from "../../lib/errorMessages";
import type { FixedExpenseFormData } from "../../types/fixedExpense";
import { fixedExpenseSchema } from "../../validations/fixedExpenseSchema";

type FixedExpensesStepProps = {
  despesasFixas: ReturnType<typeof useFixedExpenses>;
  onVoltar: () => void;
  onAvancar: () => void;
};

function FixedExpensesStep({ despesasFixas, onVoltar, onAvancar }: FixedExpensesStepProps) {
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FixedExpenseFormData>({
    resolver: zodResolver(fixedExpenseSchema),
  });

  async function onSubmit(dados: FixedExpenseFormData) {
    setErroGeral("");
    setSalvando(true);

    try {
      await despesasFixas.criar({ description: dados.description, amount: Number(dados.amount) });
      reset();
    } catch (erro) {
      setErroGeral(getFriendlyErrorMessage(erro, "Não foi possível salvar a despesa fixa."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="onboarding-passo">
      <h2>🧾 Tem despesas fixas recorrentes?</h2>
      <p>Aluguel, assinaturas, financiamentos... Cadastre quantas quiser (ou nenhuma, se preferir fazer isso depois).</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="campo">
          <input
            type="text"
            placeholder="Descrição (ex: Aluguel)"
            aria-label="Descrição da despesa fixa"
            {...register("description")}
          />
          {errors.description && <span className="erro-campo">{errors.description.message}</span>}
        </div>

        <div className="campo">
          <input
            type="number"
            step="0.01"
            placeholder="Valor mensal"
            aria-label="Valor mensal"
            {...register("amount")}
          />
          {errors.amount && <span className="erro-campo">{errors.amount.message}</span>}
        </div>

        {erroGeral && <span className="erro-geral">{erroGeral}</span>}

        <div className="onboarding-acoes">
          <button type="submit" className="btn-secundario" disabled={salvando}>
            {salvando ? "Adicionando..." : "+ Adicionar despesa"}
          </button>
        </div>
      </form>

      {despesasFixas.loading && <p className="estado-carregando">Carregando despesas fixas...</p>}

      {!despesasFixas.loading && despesasFixas.fixedExpenses.length > 0 && (
        <div className="onboarding-lista">
          {despesasFixas.fixedExpenses.map((despesa) => (
            <div className="onboarding-item" key={despesa.id}>
              <span>{despesa.description}</span>
              <strong>R$ {despesa.amount.toFixed(2)}</strong>
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

export default FixedExpensesStep;
