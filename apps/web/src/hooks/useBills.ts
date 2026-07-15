import { useCallback, useEffect, useMemo, useState } from "react";
import { addDaysISO, getTodayISO } from "../lib/dateUtils";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import {
  createBill,
  deleteBill,
  listBills,
  markBillAsPaid,
  type NewBillInput,
} from "../services/billsService";
import type { Bill, BillType } from "../types/bill";
import { useAuth } from "./useAuth";

type NovaConta = {
  type: BillType;
  description: string;
  amount: number;
  dueDate: string;
};

const DIAS_PARA_VENCER_EM_BREVE = 7;

export function useBills() {
  const { user } = useAuth();
  const userId = user?.id;

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const buscarContas = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const dados = await listBills(id);
      setBills(dados);
    } catch (erro) {
      setError(getFriendlyErrorMessage(erro, "Não foi possível carregar suas contas."));
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
      if (ativo) buscarContas(userId);
    });

    return () => {
      ativo = false;
    };
  }, [userId, buscarContas]);

  async function recarregar() {
    if (!userId) return;
    await buscarContas(userId);
  }

  async function criar(input: NovaConta) {
    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }

    const novaConta: NewBillInput = { userId, ...input };
    const nova = await createBill(novaConta);
    setBills((atual) => [...atual, nova].sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
  }

  async function marcarComoPaga(id: string) {
    if (!userId) return;
    setActionError(null);

    try {
      const atualizada = await markBillAsPaid(id, userId);
      setBills((atual) => atual.map((item) => (item.id === id ? atualizada : item)));
    } catch (erro) {
      setActionError(getFriendlyErrorMessage(erro, "Não foi possível marcar a conta como paga."));
    }
  }

  async function remover(id: string) {
    if (!userId) return;
    setActionError(null);

    try {
      await deleteBill(id, userId);
      setBills((atual) => atual.filter((item) => item.id !== id));
    } catch (erro) {
      setActionError(getFriendlyErrorMessage(erro, "Não foi possível remover a conta."));
    }
  }

  const contasPendentes = useMemo(() => bills.filter((item) => item.status === "pendente"), [bills]);

  const contasVencidas = useMemo(() => {
    const hoje = getTodayISO();
    return contasPendentes.filter((item) => item.dueDate < hoje);
  }, [contasPendentes]);

  const contasVencendoEmBreve = useMemo(() => {
    const hoje = getTodayISO();
    const limite = addDaysISO(hoje, DIAS_PARA_VENCER_EM_BREVE);
    return contasPendentes.filter((item) => item.dueDate >= hoje && item.dueDate <= limite);
  }, [contasPendentes]);

  const totalPendenteAPagar = useMemo(
    () =>
      contasPendentes
        .filter((item) => item.type === "a_pagar")
        .reduce((total, item) => total + item.amount, 0),
    [contasPendentes],
  );

  return {
    bills,
    loading,
    error,
    actionError,
    criar,
    marcarComoPaga,
    remover,
    recarregar,
    contasVencidas,
    contasVencendoEmBreve,
    totalPendenteAPagar,
  };
}
