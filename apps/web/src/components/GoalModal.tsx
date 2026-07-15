import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import type { GoalFormData } from "../types/goal";
import { goalSchema } from "../validations/goalSchema";

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

  useEffect(() => {
    function handleKeyDown(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        onFechar();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onFechar]);

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
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="goal-modal-titulo">
        <h2 id="goal-modal-titulo">Nova Meta</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="campo">
            <input
              type="text"
              placeholder="Nome da meta"
              aria-label="Nome da meta"
              autoFocus
              {...register("title")}
            />
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

export default GoalModal;
