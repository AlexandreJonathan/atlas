import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import type { ExpenseCategory } from "../types/budget";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from "../types/budget";
import type { TransactionFormData, TransactionType } from "../types/transaction";
import { transactionSchema } from "../validations/transactionSchema";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Modal from "./ui/Modal";

type TransactionModalProps = {
  tipo: TransactionType;
  onFechar: () => void;
  onSalvar: (dados: {
    description: string;
    amount: number;
    category?: ExpenseCategory | null;
  }) => Promise<void>;
};

const TITULOS: Record<TransactionType, string> = {
  receita: "Nova Receita",
  despesa: "Nova Despesa",
};

function TransactionModal({ tipo, onFechar, onSalvar }: TransactionModalProps) {
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      category: tipo === "despesa" ? "other" : undefined,
    },
  });

  async function onSubmit(dados: TransactionFormData) {
    setErroGeral("");
    setSalvando(true);

    try {
      await onSalvar({
        description: dados.description,
        amount: Number(dados.amount),
        category:
          tipo === "despesa"
            ? ((dados.category as ExpenseCategory | undefined) ?? "other")
            : null,
      });
      onFechar();
    } catch (erro) {
      setErroGeral(getFriendlyErrorMessage(erro, "Não foi possível salvar a movimentação."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal titleId="transaction-modal-titulo" title={TITULOS[tipo]} onClose={onFechar}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="atlas-auth-form">
        <Input
          type="number"
          step="0.01"
          placeholder="Valor"
          aria-label="Valor"
          autoFocus
          error={errors.amount?.message}
          {...register("amount")}
        />

        <Input
          type="text"
          placeholder="Descrição"
          aria-label="Descrição"
          error={errors.description?.message}
          {...register("description")}
        />

        {tipo === "despesa" ? (
          <label className="atlas-field">
            <span className="atlas-field-label">Categoria</span>
            <select
              className="atlas-input"
              aria-label="Categoria da despesa"
              {...register("category")}
            >
              {EXPENSE_CATEGORIES.map((key) => (
                <option key={key} value={key}>
                  {EXPENSE_CATEGORY_LABELS[key]}
                </option>
              ))}
            </select>
            {errors.category?.message ? (
              <span className="atlas-field-error">{errors.category.message}</span>
            ) : null}
          </label>
        ) : null}

        {erroGeral && <span className="atlas-erro-geral">{erroGeral}</span>}

        <div className="atlas-modal-actions">
          <Button type="button" variant="secondary" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" loading={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TransactionModal;
