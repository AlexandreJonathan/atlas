import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import type { FinancialProfile, FinancialProfileFormData } from "../types/financialProfile";
import { financialProfileSchema } from "../validations/financialProfileSchema";

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

  useEffect(() => {
    function handleKeyDown(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        onFechar();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onFechar]);

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
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-titulo">
        <h2 id="profile-modal-titulo">Planejamento Financeiro</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="campo">
            <input
              type="number"
              step="0.01"
              placeholder="Renda mensal (salário ou renda prevista)"
              aria-label="Renda mensal"
              autoFocus
              {...register("monthlyIncome")}
            />
            {errors.monthlyIncome && <span className="erro-campo">{errors.monthlyIncome.message}</span>}
          </div>

          <div className="campo">
            <input
              type="number"
              step="0.01"
              placeholder="Reserva mínima desejada"
              aria-label="Reserva mínima"
              {...register("minimumReserve")}
            />
            {errors.minimumReserve && <span className="erro-campo">{errors.minimumReserve.message}</span>}
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

export default FinancialProfileModal;
