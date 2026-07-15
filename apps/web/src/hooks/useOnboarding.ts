import { useCallback, useEffect, useState } from "react";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import { getStatus, upsertStatus } from "../services/onboardingService";
import type { OnboardingStatus } from "../types/onboarding";
import { useAuth } from "./useAuth";

const TOTAL_PASSOS = 6;

type UseOnboardingParams = {
  perfilJaConfigurado: boolean;
  perfilCarregando: boolean;
};

// Onboarding guiado (Sprint 6): primeiro acesso pede renda, reserva mínima,
// despesas fixas e primeira meta antes de liberar o Dashboard completo.
// O progresso é persistido no Supabase (não em localStorage) para ser
// consistente entre dispositivos e sobreviver a recarregamentos/fechamento
// do navegador no meio do fluxo.
export function useOnboarding({ perfilJaConfigurado, perfilCarregando }: UseOnboardingParams) {
  const { user } = useAuth();
  const userId = user?.id;

  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buscarStatus = useCallback(async (id: string, jaConfigurado: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const atual = await getStatus(id);

      if (atual) {
        setStatus(atual);
        return;
      }

      // Backfill: usuários que já configuraram o perfil financeiro antes de
      // o onboarding guiado existir (Sprint 5 ou anterior) não devem ver o
      // wizard do zero — tratamos como já concluído.
      if (jaConfigurado) {
        const concluido = await upsertStatus({
          userId: id,
          currentStep: TOTAL_PASSOS,
          completedAt: new Date().toISOString(),
        });
        setStatus(concluido);
        return;
      }

      setStatus(null);
    } catch (erro) {
      setError(getFriendlyErrorMessage(erro, "Não foi possível carregar seu progresso de configuração."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId || perfilCarregando) {
      return;
    }

    let ativo = true;
    Promise.resolve().then(() => {
      if (ativo) buscarStatus(userId, perfilJaConfigurado);
    });

    return () => {
      ativo = false;
    };
  }, [userId, perfilCarregando, perfilJaConfigurado, buscarStatus]);

  async function avancarPara(step: number) {
    if (!userId) return;
    const atualizado = await upsertStatus({ userId, currentStep: step });
    setStatus(atualizado);
  }

  async function concluir() {
    if (!userId) return;
    const atualizado = await upsertStatus({
      userId,
      currentStep: TOTAL_PASSOS,
      completedAt: new Date().toISOString(),
    });
    setStatus(atualizado);
  }

  return {
    loading: loading || perfilCarregando,
    error,
    completo: status?.completedAt != null,
    passoAtual: status?.currentStep ?? 1,
    totalPassos: TOTAL_PASSOS,
    avancarPara,
    concluir,
  };
}
