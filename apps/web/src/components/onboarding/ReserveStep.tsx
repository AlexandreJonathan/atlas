import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { minimumReserveSchema } from "../../validations/financialProfileSchema";
import Button from "../ui/Button";
import Input from "../ui/Input";
import type { z } from "zod";

type ReserveFormData = z.infer<typeof minimumReserveSchema>;

type ReserveStepProps = {
  valorInicial: number | null;
  processando: boolean;
  onVoltar: () => void;
  onAvancar: (valor: number) => void;
};

function ReserveStep({ valorInicial, processando, onVoltar, onAvancar }: ReserveStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReserveFormData>({
    resolver: zodResolver(minimumReserveSchema),
    defaultValues: { minimumReserve: valorInicial != null ? String(valorInicial) : "" },
  });

  function onSubmit(dados: ReserveFormData) {
    onAvancar(Number(dados.minimumReserve));
  }

  return (
    <form className="atlas-onboarding-step" onSubmit={handleSubmit(onSubmit)} noValidate>
      <span className="atlas-onboarding-step-icon">
        <ShieldCheck size={26} aria-hidden="true" />
      </span>

      <h2>Qual sua reserva mínima?</h2>
      <p>
        É o valor que você quer sempre manter guardado (reserva de emergência). Se ainda não tem uma
        reserva, pode informar 0 e ajustar depois.
      </p>

      <Input
        type="number"
        step="0.01"
        placeholder="Reserva mínima"
        aria-label="Reserva mínima"
        autoFocus
        error={errors.minimumReserve?.message}
        {...register("minimumReserve")}
      />

      <div className="atlas-onboarding-acoes">
        <Button type="button" variant="secondary" onClick={onVoltar} disabled={processando}>
          Voltar
        </Button>
        <Button type="submit" loading={processando}>
          {processando ? "Salvando..." : "Continuar"}
        </Button>
      </div>
    </form>
  );
}

export default ReserveStep;
