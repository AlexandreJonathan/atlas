import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { minimumReserveSchema } from "../../validations/financialProfileSchema";
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
    <form className="onboarding-passo" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>🛡️ Qual sua reserva mínima?</h2>
      <p>
        É o valor que você quer sempre manter guardado (reserva de emergência). Se ainda não tem uma
        reserva, pode informar 0 e ajustar depois.
      </p>

      <div className="campo">
        <input
          type="number"
          step="0.01"
          placeholder="Reserva mínima"
          aria-label="Reserva mínima"
          autoFocus
          {...register("minimumReserve")}
        />
        {errors.minimumReserve && <span className="erro-campo">{errors.minimumReserve.message}</span>}
      </div>

      <div className="onboarding-acoes">
        <button type="button" className="btn-secundario" onClick={onVoltar} disabled={processando}>
          Voltar
        </button>
        <button type="submit" className="btn-primario" disabled={processando}>
          {processando ? "Salvando..." : "Continuar"}
        </button>
      </div>
    </form>
  );
}

export default ReserveStep;
