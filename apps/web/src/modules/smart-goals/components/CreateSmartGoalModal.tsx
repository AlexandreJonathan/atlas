import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import { getFriendlyErrorMessage } from "../../../lib/errorMessages";
import type { GoalCategory, GoalFormData } from "../../../types/goal";
import { GOAL_CATEGORIES, GOAL_CATEGORY_LABELS } from "../../../types/goal";
import { goalSchema } from "../../../validations/goalSchema";
import type { CreateSmartGoalInput } from "../hooks/useSmartGoals";

type CreateSmartGoalModalProps = {
  onClose: () => void;
  onSave: (input: CreateSmartGoalInput) => Promise<void>;
};

function CreateSmartGoalModal({ onClose, onSave }: CreateSmartGoalModalProps) {
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      category: "other",
      description: "",
    },
  });

  async function onSubmit(dados: GoalFormData) {
    setErroGeral("");
    setSalvando(true);
    try {
      await onSave({
        title: dados.title,
        targetAmount: Number(dados.targetAmount),
        targetDate: dados.targetDate,
        category: dados.category as GoalCategory,
        description: dados.description?.trim() ? dados.description.trim() : null,
      });
      onClose();
    } catch (erro) {
      setErroGeral(getFriendlyErrorMessage(erro, "Não foi possível salvar a meta."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal titleId="smart-goal-modal-titulo" title="Nova Meta" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="atlas-auth-form">
        <Input
          type="text"
          placeholder="Nome da meta"
          aria-label="Nome da meta"
          autoFocus
          error={errors.title?.message}
          {...register("title")}
        />

        <Input
          type="number"
          step="0.01"
          placeholder="Valor alvo"
          aria-label="Valor alvo"
          error={errors.targetAmount?.message}
          {...register("targetAmount")}
        />

        <Input
          type="date"
          aria-label="Data limite"
          error={errors.targetDate?.message}
          {...register("targetDate")}
        />

        <label className="atlas-field">
          <span className="atlas-field-label">Categoria</span>
          <select
            className="atlas-input"
            aria-label="Categoria da meta"
            {...register("category")}
          >
            {GOAL_CATEGORIES.map((key) => (
              <option key={key} value={key}>
                {GOAL_CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
          {errors.category?.message ? (
            <span className="atlas-field-error">{errors.category.message}</span>
          ) : null}
        </label>

        <Input
          type="text"
          placeholder="Descrição (opcional)"
          aria-label="Descrição opcional"
          error={errors.description?.message}
          {...register("description")}
        />

        {erroGeral ? <span className="atlas-erro-geral">{erroGeral}</span> : null}

        <div className="atlas-modal-actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" loading={salvando}>
            {salvando ? "Salvando..." : "Criar meta"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateSmartGoalModal;
