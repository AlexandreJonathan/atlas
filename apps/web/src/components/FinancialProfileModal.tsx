import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import type { FinancialProfile, FinancialProfileFormData } from "../types/financialProfile";
import { financialProfileSchema } from "../validations/financialProfileSchema";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Modal from "./ui/Modal";

type FinancialProfileModalProps = {
  perfilAtual: FinancialProfile | null;
  onFechar: () => void;
  onSalvar: (dados: { monthlyIncome: number; minimumReserve: number }) => Promise<void>;
};

function FinancialProfileModal({ perfilAtual, onFechar, onSalvar }: FinancialProfileModalProps) {
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FinancialProfileFormData>({
    resolver: zodResolver(financialProfileSchema),
    defaultValues: {
      monthlyIncome: perfilAtual ? String(perfilAtual.monthlyIncome) : "",
      minimumReserve: perfilAtual ? String(perfilAtual.minimumReserve) : "",
    },
  });

  async function onSubmit(dados: FinancialProfileFormData) {
    setErroGeral("");
    setSalvando(true);

    try {
      await onSalvar({
        monthlyIncome: Number(dados.monthlyIncome),
        minimumReserve: Number(dados.minimumReserve),
      });
      onFechar();
    } catch (erro) {
      setErroGeral(getFriendlyErrorMessage(erro, "Não foi possível salvar seu perfil financeiro."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal titleId="profile-modal-titulo" title="Planejamento Financeiro" onClose={onFechar}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="atlas-auth-form">
        <Input
          type="number"
          step="0.01"
          placeholder="Renda mensal (salário ou renda prevista)"
          aria-label="Renda mensal"
          autoFocus
          error={errors.monthlyIncome?.message}
          {...register("monthlyIncome")}
        />

        <Input
          type="number"
          step="0.01"
          placeholder="Reserva mínima desejada"
          aria-label="Reserva mínima"
          error={errors.minimumReserve?.message}
          {...register("minimumReserve")}
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

export default FinancialProfileModal;
