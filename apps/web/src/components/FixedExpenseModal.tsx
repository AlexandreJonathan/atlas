import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import type { FixedExpenseFormData } from "../types/fixedExpense";
import { fixedExpenseSchema } from "../validations/fixedExpenseSchema";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Modal from "./ui/Modal";

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
    <Modal titleId="fixed-expense-modal-titulo" title="Nova Despesa Fixa" onClose={onFechar}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="atlas-auth-form">
        <Input
          type="text"
          placeholder="Descrição (ex: Aluguel, Assinatura)"
          aria-label="Descrição"
          autoFocus
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

export default FixedExpenseModal;
