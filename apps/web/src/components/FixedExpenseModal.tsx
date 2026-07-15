import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import type { FixedExpenseFormData } from "../types/fixedExpense";
import { fixedExpenseSchema } from "../validations/fixedExpenseSchema";

type FixedExpenseModalProps = {
  onFechar: () => void;
  onSalvar: (dados: { description: string; amount: number }) => Promise<void>;
};

function FixedExpenseModal({ onFechar, onSalvar }: FixedExpenseModalProps) {
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FixedExpenseFormData>({
    resolver: zodResolver(fixedExpenseSchema),
  });

  useEffect(() => {
    function handleKeyDown(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        onFechar();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onFechar]);

  async function onSubmit(dados: FixedExpenseFormData) {
    setErroGeral("");
    setSalvando(true);

    try {
      await onSalvar({ description: dados.description, amount: Number(dados.amount) });
      onFechar();
    } catch (erro) {
      setErroGeral(getFriendlyErrorMessage(erro, "Não foi possível salvar a despesa fixa."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="fixed-expense-modal-titulo">
        <h2 id="fixed-expense-modal-titulo">Nova Despesa Fixa</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="campo">
            <input
              type="text"
              placeholder="Descrição (ex: Aluguel, Assinatura)"
              aria-label="Descrição"
              autoFocus
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

          <div className="modal-buttons">
            <button type="button" onClick={onFechar} disabled={salvando}>
              Cancelar
            </button>
            <button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FixedExpenseModal;
