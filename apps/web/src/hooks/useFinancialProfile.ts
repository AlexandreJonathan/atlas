import { useCallback, useEffect, useState } from "react";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import { getProfile, upsertProfile } from "../services/financialProfileService";
import type { FinancialProfile } from "../types/financialProfile";
import { useAuth } from "./useAuth";

type PerfilInput = {
  monthlyIncome: number;
  minimumReserve: number;
};

export function useFinancialProfile() {
  const { user } = useAuth();
  const userId = user?.id;

  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buscarPerfil = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const dados = await getProfile(id);
      setProfile(dados);
    } catch (erro) {
      setError(getFriendlyErrorMessage(erro, "Não foi possível carregar seu perfil financeiro."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let ativo = true;
    Promise.resolve().then(() => {
      if (ativo) buscarPerfil(userId);
    });

    return () => {
      ativo = false;
    };
  }, [userId, buscarPerfil]);

  async function recarregar() {
    if (!userId) return;
    await buscarPerfil(userId);
  }

  // Sem captura de erro aqui (diferente de marcarComoPaga/registrarAporte):
  // "salvar" é sempre chamado a partir de FinancialProfileModal, que já
  // trata o erro localmente (mesmo padrão de useBills.criar/useGoals.criar).
  async function salvar(input: PerfilInput) {
    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }

    const atualizado = await upsertProfile({ userId, ...input });
    setProfile(atualizado);
  }

  return {
    profile,
    loading,
    error,
    salvar,
    recarregar,
  };
}
