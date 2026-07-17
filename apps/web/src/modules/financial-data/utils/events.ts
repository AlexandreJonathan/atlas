import type { FinancialCacheScope, FinancialSnapshot } from "../types";

export type FinancialDataEventMap = {
  onSnapshotUpdated: { snapshot: FinancialSnapshot };
  onInvalidated: { scope: FinancialCacheScope };
  onSyncStarted: { userId: string };
  onSyncFinished: { userId: string; ok: boolean };
};

type Listener<T> = (payload: T) => void;

export class FinancialDataEventBus {
  private readonly listeners = new Map<keyof FinancialDataEventMap, Set<Listener<unknown>>>();

  on<K extends keyof FinancialDataEventMap>(
    event: K,
    listener: Listener<FinancialDataEventMap[K]>,
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

  emit<K extends keyof FinancialDataEventMap>(event: K, payload: FinancialDataEventMap[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of set) {
      (listener as Listener<FinancialDataEventMap[K]>)(payload);
    }
  }
}

export const financialDataEvents = new FinancialDataEventBus();
