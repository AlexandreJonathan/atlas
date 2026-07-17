import { appConfig } from "../../../config";
import { logger } from "../../../lib/logging";
import {
  createBill,
  deleteBill,
  markBillAsPaid,
  type NewBillInput,
} from "../../../services/billsService";
import { upsertProfile } from "../../../services/financialProfileService";
import {
  createFixedExpense,
  deleteFixedExpense,
} from "../../../services/fixedExpensesService";
import {
  createGoal,
  deleteGoal,
  updateGoalProgress,
  type NewGoalInput,
} from "../../../services/goalsService";
import {
  createTransaction,
  deleteTransaction,
  type NewTransactionInput,
} from "../../../services/transactionsService";
import type { Bill } from "../../../types/bill";
import type { FinancialProfile } from "../../../types/financialProfile";
import type { FixedExpense } from "../../../types/fixedExpense";
import type { Goal } from "../../../types/goal";
import type { Transaction } from "../../../types/transaction";
import type { FinancialDataProvider } from "../providers/FinancialDataProvider";
import { MockFinancialDataProvider } from "../providers/MockFinancialDataProvider";
import { PluggyFinancialDataProvider } from "../providers/PluggyFinancialDataProvider";
import type {
  FinancialCacheScope,
  FinancialDataLoadState,
  FinancialSnapshot,
} from "../types";
import { buildFinancialSnapshot } from "../utils/buildSnapshot";
import { financialDataEvents } from "../utils/events";

function createFinancialDataProvider(): FinancialDataProvider {
  const configured = appConfig.providers.financialData;
  if (configured === "pluggy") {
    logger.info("Financial Data: usando PluggyFinancialDataProvider (stub)");
    return new PluggyFinancialDataProvider();
  }
  return new MockFinancialDataProvider();
}

type Listener = (state: FinancialDataLoadState) => void;

/**
 * Única porta de entrada da aplicação para dados financeiros.
 * Cache em memória + sync/invalidate + notificações para hooks.
 */
export class FinancialDataService {
  private readonly provider: FinancialDataProvider;
  private snapshot: FinancialSnapshot | null = null;
  private loading = false;
  private syncing = false;
  private error: string | null = null;
  private inflight: Promise<FinancialSnapshot> | null = null;
  private readonly listeners = new Set<Listener>();

  constructor(provider: FinancialDataProvider) {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.name;
  }

  getState(): FinancialDataLoadState {
    return {
      loading: this.loading,
      syncing: this.syncing,
      error: this.error,
      snapshot: this.snapshot,
    };
  }

  getSnapshot(): FinancialSnapshot | null {
    return this.snapshot;
  }

  /** Atalhos de leitura — sempre a partir do cache. */
  getSaldo(): number {
    return this.snapshot?.saldo ?? 0;
  }

  getPatrimonio(): number {
    return this.snapshot?.patrimonio ?? 0;
  }

  getContas(): Bill[] {
    return this.snapshot?.bills ?? [];
  }

  getCartoes(): FinancialSnapshot["cards"] {
    return this.snapshot?.cards ?? [];
  }

  getMetas(): Goal[] {
    return this.snapshot?.goals ?? [];
  }

  getReceitas(): number {
    return this.snapshot?.receitas ?? 0;
  }

  getDespesas(): number {
    return this.snapshot?.despesas ?? 0;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  /**
   * Garante snapshot em cache (reusa se já houver para o mesmo user).
   * Chamadas concorrentes compartilham a mesma Promise.
   */
  async ensureLoaded(userId: string): Promise<FinancialSnapshot> {
    if (this.snapshot?.userId === userId && !this.loading) {
      return this.snapshot;
    }
    return this.sync(userId);
  }

  /** Força sincronização com o provider (ignora cache). */
  async sync(userId: string): Promise<FinancialSnapshot> {
    if (this.inflight) {
      return this.inflight;
    }

    this.loading = this.snapshot == null;
    this.syncing = true;
    this.error = null;
    this.emit();
    financialDataEvents.emit("onSyncStarted", { userId });

    this.inflight = this.provider
      .fetchSnapshot(userId)
      .then((next) => {
        this.snapshot = next;
        this.error = null;
        financialDataEvents.emit("onSnapshotUpdated", { snapshot: next });
        financialDataEvents.emit("onSyncFinished", { userId, ok: true });
        return next;
      })
      .catch((erro: unknown) => {
        const message =
          erro instanceof Error ? erro.message : "Não foi possível carregar os dados financeiros.";
        this.error = message;
        financialDataEvents.emit("onSyncFinished", { userId, ok: false });
        logger.error("FinancialDataService.sync falhou", erro, { userId });
        throw erro;
      })
      .finally(() => {
        this.loading = false;
        this.syncing = false;
        this.inflight = null;
        this.emit();
      });

    return this.inflight;
  }

  /**
   * Invalida cache. Com `userId`, agenda sync; sem userId, só limpa.
   */
  invalidate(scope: FinancialCacheScope = "all", userId?: string): void {
    financialDataEvents.emit("onInvalidated", { scope });
    if (scope === "all" || scope === "ledger" || scope === "open-finance" || scope === "investments") {
      this.snapshot = null;
    }
    this.emit();
    if (userId) {
      void this.sync(userId);
    }
  }

  /** Aplica mutação otimista no cache e reconstrói agregados. */
  private patchLedger(
    userId: string,
    patch: (current: FinancialSnapshot) => {
      transactions?: Transaction[];
      bills?: Bill[];
      goals?: Goal[];
      profile?: FinancialProfile | null;
      fixedExpenses?: FixedExpense[];
    },
  ): void {
    if (!this.snapshot || this.snapshot.userId !== userId) return;
    const current = this.snapshot;
    const next = patch(current);
    this.snapshot = buildFinancialSnapshot({
      userId,
      providerName: current.providerName,
      ledger: {
        transactions: next.transactions ?? current.transactions,
        bills: next.bills ?? current.bills,
        goals: next.goals ?? current.goals,
        profile: next.profile !== undefined ? next.profile : current.profile,
        fixedExpenses: next.fixedExpenses ?? current.fixedExpenses,
        errors: current.errors,
      },
      openFinance: current.openFinance,
      investments: current.investments,
    });
    financialDataEvents.emit("onSnapshotUpdated", { snapshot: this.snapshot });
    this.emit();
  }

  async addTransaction(input: NewTransactionInput): Promise<Transaction> {
    const created = await createTransaction(input);
    this.patchLedger(input.userId, (current) => ({
      transactions: [created, ...current.transactions],
    }));
    return created;
  }

  async addBill(input: NewBillInput): Promise<Bill> {
    const created = await createBill(input);
    this.patchLedger(input.userId, (current) => ({
      bills: [created, ...current.bills],
    }));
    return created;
  }

  async addGoal(input: NewGoalInput): Promise<Goal> {
    const created = await createGoal(input);
    this.patchLedger(input.userId, (current) => ({
      goals: [created, ...current.goals],
    }));
    return created;
  }

  async saveProfile(input: {
    userId: string;
    monthlyIncome: number;
    minimumReserve: number;
  }): Promise<FinancialProfile> {
    const profile = await upsertProfile(input);
    this.patchLedger(input.userId, () => ({ profile }));
    return profile;
  }

  async addFixedExpense(input: {
    userId: string;
    description: string;
    amount: number;
  }): Promise<FixedExpense> {
    const created = await createFixedExpense(input);
    this.patchLedger(input.userId, (current) => ({
      fixedExpenses: [created, ...current.fixedExpenses],
    }));
    return created;
  }

  async removeFixedExpense(id: string, userId: string): Promise<void> {
    await deleteFixedExpense(id, userId);
    this.patchLedger(userId, (current) => ({
      fixedExpenses: current.fixedExpenses.filter((item) => item.id !== id),
    }));
  }

  async removeTransaction(id: string, userId: string): Promise<void> {
    await deleteTransaction(id, userId);
    this.patchLedger(userId, (current) => ({
      transactions: current.transactions.filter((item) => item.id !== id),
    }));
  }

  async markBillPaid(id: string, userId: string): Promise<Bill> {
    const updated = await markBillAsPaid(id, userId);
    this.patchLedger(userId, (current) => ({
      bills: current.bills.map((item) => (item.id === id ? updated : item)),
    }));
    return updated;
  }

  async removeBill(id: string, userId: string): Promise<void> {
    await deleteBill(id, userId);
    this.patchLedger(userId, (current) => ({
      bills: current.bills.filter((item) => item.id !== id),
    }));
  }

  async registerGoalContribution(id: string, userId: string, valor: number): Promise<Goal | null> {
    const meta = this.snapshot?.goals.find((item) => item.id === id);
    if (!meta) return null;
    const updated = await updateGoalProgress(id, userId, meta.currentAmount + valor);
    this.patchLedger(userId, (current) => ({
      goals: current.goals.map((item) => (item.id === id ? updated : item)),
    }));
    return updated;
  }

  async removeGoal(id: string, userId: string): Promise<void> {
    await deleteGoal(id, userId);
    this.patchLedger(userId, (current) => ({
      goals: current.goals.filter((item) => item.id !== id),
    }));
  }

  private emit(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }
}

export const financialDataService = new FinancialDataService(createFinancialDataProvider());
