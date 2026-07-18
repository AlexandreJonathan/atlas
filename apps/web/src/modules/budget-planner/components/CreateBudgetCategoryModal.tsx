import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import { getFriendlyErrorMessage } from "../../../lib/errorMessages";
import type { BudgetCategoryLimitFormData, ExpenseCategory } from "../../../types/budget";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from "../../../types/budget";
import { budgetCategoryLimitSchema } from "../../../validations/budgetSchema";
import type { SetBudgetCategoryInput } from "../hooks/useBudgetPlanner";

type CreateBudgetCategoryModalProps = {
  onClose: () => void;
  onSave: (input: SetBudgetCategoryInput) => Promise<void>;
  /** Categorias já com limite — evita duplicata silenciosa no select (upsert ainda funciona). */
  usedCategories?: ExpenseCategory[];
};

function CreateBudgetCategoryModal({
  onClose,
  onSave,
  usedCategories = [],
}: CreateBudgetCategoryModalProps) {
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);
  const available = EXPENSE_CATEGORIES.filter((c) => !usedCategories.includes(c));
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetCategoryLimitFormData>({
    resolver: zodResolver(budgetCategoryLimitSchema),
    defaultValues: {
      category: available[0] ?? "other",
      notes: "",
    },
  });

  async function onSubmit(dados: BudgetCategoryLimitFormData) {
    setErroGeral("");
    setSalvando(true);
    try {
      await onSave({
        category: dados.category,
        limitAmount: Number(dados.limitAmount),
        notes: dados.notes?.trim() ? dados.notes.trim() : null,
      });
      onClose();
    } catch (erro) {
      setErroGeral(
        getFriendlyErrorMessage(erro, "Não foi possível salvar o limite."),
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      titleId="budget-category-modal-titulo"
      title="Novo limite"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="atlas-auth-form">
        <label className="atlas-field">
          <span className="atlas-field-label">Categoria</span>
          <select
            className="atlas-input"
            aria-label="Categoria do orçamento"
            {...register("category")}
          >
            {(available.length > 0 ? available : EXPENSE_CATEGORIES).map((key) => (
              <option key={key} value={key}>
                {EXPENSE_CATEGORY_LABELS[key]}
                {usedCategories.includes(key) ? " (atualizar)" : ""}
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
          placeholder="Limite mensal"
          aria-label="Limite mensal"
          autoFocus
          error={errors.limitAmount?.message}
          {...register("limitAmount")}
        />

        <Input
          type="text"
          placeholder="Nota do mês (opcional)"
          aria-label="Nota opcional do orçamento"
          error={errors.notes?.message}
          {...register("notes")}
        />

        {erroGeral ? <span className="atlas-erro-geral">{erroGeral}</span> : null}

        <div className="atlas-modal-actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" loading={salvando}>
            {salvando ? "Salvando..." : "Salvar limite"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateBudgetCategoryModal;
