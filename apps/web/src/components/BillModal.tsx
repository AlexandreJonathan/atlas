import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import type { BillFormData, BillType } from "../types/bill";
import { billSchema } from "../validations/billSchema";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Modal from "./ui/Modal";

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
    <Modal titleId="bill-modal-titulo" title={TITULOS[tipo]} onClose={onFechar}>
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

        <Input type="date" aria-label="Data de vencimento" error={errors.dueDate?.message} {...register("dueDate")} />

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

export default BillModal;
