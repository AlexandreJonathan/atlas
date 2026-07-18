import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import { getFriendlyErrorMessage } from "../../../lib/errorMessages";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "../../../types/budget";
import type { InstallmentPlanFormData } from "../../../types/installment";
import { installmentPlanSchema } from "../../../validations/installmentSchema";
import type { CreateInstallmentInput } from "../hooks/useInstallments";

type CreateInstallmentModalProps = {
  onClose: () => void;
  onSave: (input: CreateInstallmentInput) => Promise<void>;
};

function CreateInstallmentModal({ onClose, onSave }: CreateInstallmentModalProps) {
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstallmentPlanFormData>({
    resolver: zodResolver(installmentPlanSchema),
    defaultValues: {
      category: "shopping",
      cardLabel: "",
    },
  });

  async function onSubmit(dados: InstallmentPlanFormData) {
    setErroGeral("");
    setSalvando(true);
    try {
      await onSave({
        description: dados.description,
        category: dados.category as ExpenseCategory,
        totalAmount: Number(dados.totalAmount),
        installmentCount: Number(dados.installmentCount),
        installmentAmount: Number(dados.installmentAmount),
        firstDueDate: dados.firstDueDate,
        cardLabel: dados.cardLabel?.trim() ? dados.cardLabel.trim() : null,
      });
      onClose();
    } catch (erro) {
      setErroGeral(
        getFriendlyErrorMessage(erro, "Não foi possível salvar a compra parcelada."),
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      titleId="installment-modal-titulo"
      title="Nova compra parcelada"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="atlas-auth-form">
        <Input
          type="text"
          placeholder="Descrição"
          aria-label="Descrição da compra"
          autoFocus
          error={errors.description?.message}
          {...register("description")}
        />

        <label className="atlas-field">
          <span className="atlas-field-label">Categoria</span>
          <select className="atlas-input" aria-label="Categoria" {...register("category")}>
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

        <Input
          type="number"
          step="0.01"
          placeholder="Valor total"
          aria-label="Valor total"
          error={errors.totalAmount?.message}
          {...register("totalAmount")}
        />

        <Input
          type="number"
          step="1"
          placeholder="Número de parcelas"
          aria-label="Número de parcelas"
          error={errors.installmentCount?.message}
          {...register("installmentCount")}
        />

        <Input
          type="number"
          step="0.01"
          placeholder="Valor da parcela"
          aria-label="Valor da parcela"
          error={errors.installmentAmount?.message}
          {...register("installmentAmount")}
        />

        <Input
          type="date"
          aria-label="Data da primeira parcela"
          error={errors.firstDueDate?.message}
          {...register("firstDueDate")}
        />

        <Input
          type="text"
          placeholder="Cartão utilizado (opcional)"
          aria-label="Cartão utilizado opcional"
          error={errors.cardLabel?.message}
          {...register("cardLabel")}
        />

        {erroGeral ? <span className="atlas-erro-geral">{erroGeral}</span> : null}

        <div className="atlas-modal-actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" loading={salvando}>
            {salvando ? "Salvando..." : "Registrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateInstallmentModal;
