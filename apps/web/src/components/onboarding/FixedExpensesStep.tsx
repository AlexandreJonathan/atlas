import { zodResolver } from "@hookform/resolvers/zod";
import { Receipt } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { useFixedExpenses } from "../../hooks/useFixedExpenses";
import { getFriendlyErrorMessage } from "../../lib/errorMessages";
import type { FixedExpenseFormData } from "../../types/fixedExpense";
import { fixedExpenseSchema } from "../../validations/fixedExpenseSchema";
import Button from "../ui/Button";
import Input from "../ui/Input";

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
    <div className="atlas-onboarding-step">
      <span className="atlas-onboarding-step-icon">
        <Receipt size={26} aria-hidden="true" />
      </span>

      <h2>Tem despesas fixas recorrentes?</h2>
      <p>Aluguel, assinaturas, financiamentos... Cadastre quantas quiser (ou nenhuma, se preferir fazer isso depois).</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          type="text"
          placeholder="Descrição (ex: Aluguel)"
          aria-label="Descrição da despesa fixa"
          error={errors.description?.message}
          {...register("description")}
        />

        <Input
          type="number"
          step="0.01"
          placeholder="Valor mensal"
          aria-label="Valor mensal"
          error={errors.amount?.message}
          {...register("amount")}
        />

        {erroGeral && <span className="atlas-erro-geral">{erroGeral}</span>}

        <div className="atlas-onboarding-acoes">
          <Button type="submit" variant="secondary" loading={salvando}>
            {salvando ? "Adicionando..." : "+ Adicionar despesa"}
          </Button>
        </div>
      </form>

      {despesasFixas.loading && <p className="atlas-onboarding-carregando">Carregando despesas fixas...</p>}

      {!despesasFixas.loading && despesasFixas.fixedExpenses.length > 0 && (
        <div className="atlas-onboarding-lista">
          {despesasFixas.fixedExpenses.map((despesa) => (
            <div className="atlas-onboarding-item" key={despesa.id}>
              <span>{despesa.description}</span>
              <strong className="tabular-nums">R$ {despesa.amount.toFixed(2)}</strong>
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

export default FixedExpensesStep;
