import type { OpenFinanceSnapshot } from "../open-finance/types";

export type PluggyEdgeAction =
  | "connect_token"
  | "register_item"
  | "unregister_item"
  | "sync_item"
  | "get_snapshot"
  | "list_connectors";

export type PluggyConnectTokenResponse = {
  accessToken: string;
  includeSandbox: boolean;
};

export type PluggyConnectorDto = {
  id: string;
  name: string;
  primaryColor?: string | null;
  institutionUrl?: string | null;
  type?: string | null;
};

export type PluggySyncedTransaction = {
  id: string;
  accountId: string;
  bankId: string;
  description: string;
  amount: number;
  type: "receita" | "despesa";
  date: string;
  currency: string;
};

/** Payload de get_snapshot da Edge (já parcialmente no formato Atlas). */
export type PluggyEdgeSnapshot = OpenFinanceSnapshot & {
  transactions: PluggySyncedTransaction[];
  fetchedAt?: string;
};
