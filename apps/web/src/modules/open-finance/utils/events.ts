import type { BankId, OpenFinanceSnapshot } from "../types";

/**
 * Eventos de domínio preparados para webhooks/IA futuros.
 * Nesta missão apenas disparam listeners locais (sem I/O externo).
 */
export type OpenFinanceEventMap = {
  onBankConnected: { bankId: BankId };
  onBankDisconnected: { bankId: BankId };
  onBalanceUpdated: { bankId: BankId; available: number };
  onPixReceived: { bankId: BankId; amount: number; counterpartName: string };
  onInvestmentChanged: { bankId: BankId; investmentId: string; balance: number };
  onSnapshotRefreshed: { snapshot: OpenFinanceSnapshot };
};

type Listener<T> = (payload: T) => void;

export class OpenFinanceEventBus {
  private readonly listeners = new Map<keyof OpenFinanceEventMap, Set<Listener<unknown>>>();

  on<K extends keyof OpenFinanceEventMap>(
    event: K,
    listener: Listener<OpenFinanceEventMap[K]>,
  ): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    const wrapped = listener as Listener<unknown>;
    set.add(wrapped);
    return () => set.delete(wrapped);
  }

  emit<K extends keyof OpenFinanceEventMap>(event: K, payload: OpenFinanceEventMap[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of set) {
      (listener as Listener<OpenFinanceEventMap[K]>)(payload);
    }
  }
}

export const openFinanceEvents = new OpenFinanceEventBus();

/** Atalhos nomeados — contrato futuro para integração / Atlas Intelligence. */
export function onBankConnected(payload: OpenFinanceEventMap["onBankConnected"]): void {
  openFinanceEvents.emit("onBankConnected", payload);
}

export function onBalanceUpdated(payload: OpenFinanceEventMap["onBalanceUpdated"]): void {
  openFinanceEvents.emit("onBalanceUpdated", payload);
}

export function onPixReceived(payload: OpenFinanceEventMap["onPixReceived"]): void {
  openFinanceEvents.emit("onPixReceived", payload);
}

export function onInvestmentChanged(payload: OpenFinanceEventMap["onInvestmentChanged"]): void {
  openFinanceEvents.emit("onInvestmentChanged", payload);
}
