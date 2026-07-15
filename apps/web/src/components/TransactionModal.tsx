import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import type { TransactionFormData, TransactionType } from "../types/transaction";
import { transactionSchema } from "../validations/transactionSchema";

type TransactionModalProps = {
  tipo: TransactionType;
  onFechar: () => void;
  onSalvar: (dados: { description: string; amount: number }) => Promise<void>;
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

  async function onSubmit(dados: TransactionFormData) {
    setErroGeral("");
    setSalvando(true);

    try {
      await onSalvar({ description: dados.description, amount: Number(dados.amount) });
      onFechar();
    } catch (erro) {
      setErroGeral(getFriendlyErrorMessage(erro, "Não foi possível salvar a movimentação."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-titulo">
        <h2 id="transaction-modal-titulo">{TITULOS[tipo]}</h2>

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

export default TransactionModal;
