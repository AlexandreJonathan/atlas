import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import type { BillFormData, BillType } from "../types/bill";
import { billSchema } from "../validations/billSchema";

type BillModalProps = {
  tipo: BillType;
  onFechar: () => void;
  onSalvar: (dados: { description: string; amount: number; dueDate: string }) => Promise<void>;
};

const TITULOS: Record<BillType, string> = {
  a_pagar: "Nova Conta a Pagar",
  a_receber: "Nova Conta a Receber",
};

function BillModal({ tipo, onFechar, onSalvar }: BillModalProps) {
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
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

  async function onSubmit(dados: BillFormData) {
    setErroGeral("");
    setSalvando(true);

    try {
      await onSalvar({
        description: dados.description,
        amount: Number(dados.amount),
        dueDate: dados.dueDate,
      });
      onFechar();
    } catch (erro) {
      setErroGeral(getFriendlyErrorMessage(erro, "Não foi possível salvar a conta."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="bill-modal-titulo">
        <h2 id="bill-modal-titulo">{TITULOS[tipo]}</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="campo">
            <input
              type="number"
              step="0.01"
              placeholder="Valor"
              aria-label="Valor"
              autoFocus
              {...register("amount")}
            />
            {errors.amount && <span className="erro-campo">{errors.amount.message}</span>}
          </div>

          <div className="campo">
            <input
              type="text"
              placeholder="Descrição"
              aria-label="Descrição"
              {...register("description")}
            />
            {errors.description && <span className="erro-campo">{errors.description.message}</span>}
          </div>

          <div className="campo">
            <input type="date" aria-label="Data de vencimento" {...register("dueDate")} />
            {errors.dueDate && <span className="erro-campo">{errors.dueDate.message}</span>}
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

export default BillModal;
