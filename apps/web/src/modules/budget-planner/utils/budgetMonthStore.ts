import type { BudgetWithCategories } from "../../../types/budget";

type Listener = () => void;

type SharedBudgetState = {
  key: string;
  budget: BudgetWithCategories | null;
  loaded: boolean;
  loading: boolean;
  error: string | null;
  inflight: Promise<void> | null;
};

const state: SharedBudgetState = {
  key: "",
  budget: null,
  loaded: false,
  loading: false,
  error: null,
  inflight: null,
};

const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function budgetMonthKey(
  userId: string,
  year: number,
  month: number,
): string {
  return `${userId}:${year}:${month}`;
}

export function getSharedBudgetState(): Readonly<SharedBudgetState> {
  return state;
}

export function subscribeSharedBudget(listener: Listener): () => void {
  listeners.add(listener);
  queueMicrotask(() => listener());
  return () => listeners.delete(listener);
}

export function setSharedBudget(
  key: string,
  patch: Partial<
    Pick<SharedBudgetState, "budget" | "loading" | "error" | "loaded">
  >,
): void {
  if (state.key !== key) {
    state.key = key;
  }
  if (patch.budget !== undefined) state.budget = patch.budget;
  if (patch.loading !== undefined) state.loading = patch.loading;
  if (patch.error !== undefined) state.error = patch.error;
  if (patch.loaded !== undefined) state.loaded = patch.loaded;
  emit();
}

/**
 * Carrega orçamento do mês com dedupe de inflight entre mounts concorrentes.
 */
export async function loadSharedBudgetMonth(
  key: string,
  fetcher: () => Promise<BudgetWithCategories | null>,
): Promise<void> {
  if (state.key !== key) {
    state.key = key;
    state.budget = null;
    state.loaded = false;
    state.error = null;
    state.inflight = null;
  }

  if (state.key === key && state.inflight) {
    await state.inflight;
    return;
  }

  if (state.key === key && state.loaded && !state.error) {
    return;
  }

  state.loading = true;
  state.error = null;
  emit();

  state.inflight = (async () => {
    try {
      const row = await fetcher();
      if (state.key !== key) return;
      state.budget = row;
      state.loaded = true;
      state.error = null;
    } catch (erro) {
      if (state.key !== key) return;
      state.budget = null;
      state.loaded = false;
      state.error =
        erro instanceof Error
          ? erro.message
          : "Não foi possível carregar o orçamento.";
    } finally {
      if (state.key === key) {
        state.loading = false;
        state.inflight = null;
        emit();
      }
    }
  })();

  await state.inflight;
}

/** Força novo fetch (ex.: após mutação de limite). */
export async function reloadSharedBudgetMonth(
  key: string,
  fetcher: () => Promise<BudgetWithCategories | null>,
): Promise<void> {
  state.key = key;
  state.loaded = false;
  state.error = null;
  state.inflight = null;
  await loadSharedBudgetMonth(key, fetcher);
}

/** Testes / hot reload. */
export function __resetSharedBudgetForTests(): void {
  state.key = "";
  state.budget = null;
  state.loaded = false;
  state.loading = false;
  state.error = null;
  state.inflight = null;
  listeners.clear();
}
