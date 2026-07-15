import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import type { GoalFormData } from "../types/goal";
import { goalSchema } from "../validations/goalSchema";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Modal from "./ui/Modal";

type GoalModalProps = {
  onFechar: () => void;
  onSalvar: (dados: { title: string; targetAmount: number; targetDate: string | null }) => Promise<void>;
};

function GoalModal({ onFechar, onSalvar }: GoalModalProps) {
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
  });

  async function onSubmit(dados: GoalFormData) {
    setErroGeral("");
    setSalvando(true);

    try {
      await onSalvar({
        title: dados.title,
        targetAmount: Number(dados.targetAmount),
        targetDate: dados.targetDate && dados.targetDate.length > 0 ? dados.targetDate : null,
      });
      onFechar();
    } catch (erro) {
      setErroGeral(getFriendlyErrorMessage(erro, "Não foi possível salvar a meta."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal titleId="goal-modal-titulo" title="Nova Meta" onClose={onFechar}>
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
          placeholder="Valor da meta"
          aria-label="Valor da meta"
          error={errors.targetAmount?.message}
          {...register("targetAmount")}
        />

        <Input type="date" aria-label="Prazo (opcional)" {...register("targetDate")} />

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

export default GoalModal;
