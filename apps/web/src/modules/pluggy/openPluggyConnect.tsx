import { createRoot, type Root } from "react-dom/client";
import { PluggyConnect } from "react-pluggy-connect";

type ConnectResult = {
  itemId: string;
  connectorId?: string;
  connectorName?: string;
};

type OpenPluggyConnectOptions = {
  connectToken: string;
  includeSandbox?: boolean;
  /** Quando informado, o widget tenta abrir direto o conector. */
  connectorIds?: number[];
};

/**
 * Abre o Pluggy Connect em overlay (sem alterar o layout das telas Atlas).
 * Resolve com o itemId criado/atualizado.
 */
export function openPluggyConnect(options: OpenPluggyConnectOptions): Promise<ConnectResult> {
  return new Promise((resolve, reject) => {
    const host = document.createElement("div");
    host.setAttribute("data-atlas-pluggy-connect", "true");
    document.body.appendChild(host);
    let root: Root | null = createRoot(host);
    let settled = false;

    const cleanup = () => {
      if (root) {
        root.unmount();
        root = null;
      }
      host.remove();
    };

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn();
    };

    root.render(
      <PluggyConnect
        connectToken={options.connectToken}
        includeSandbox={options.includeSandbox ?? true}
        connectorIds={options.connectorIds}
        onSuccess={(data) => {
          const item = data?.item as {
            id?: string;
            connector?: { id?: number | string; name?: string };
          };
          const itemId = item?.id;
          if (!itemId) {
            finish(() => reject(new Error("Pluggy Connect não retornou itemId.")));
            return;
          }
          finish(() =>
            resolve({
              itemId,
              connectorId: item.connector?.id != null ? String(item.connector.id) : undefined,
              connectorName: item.connector?.name,
            }),
          );
        }}
        onError={(error) => {
          finish(() =>
            reject(error instanceof Error ? error : new Error("Falha no Pluggy Connect.")),
          );
        }}
        onClose={() => {
          finish(() => reject(new Error("Conexão cancelada.")));
        }}
      />,
    );
  });
}
