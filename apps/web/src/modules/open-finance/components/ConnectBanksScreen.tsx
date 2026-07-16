import { Check, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import { useOpenFinance } from "../hooks/useOpenFinance";
import type { BankId } from "../types";
import { formatLastSynced } from "../utils/aggregate";
import { triggerMicrointeraction } from "../../../lib/microinteractions";
import BankLogo from "./BankLogo";
import "./ConnectBanks.css";

function ConnectBanksScreen() {
  const { catalog, connectBank, actionLoading, error, loading } = useOpenFinance();
  const [connectingId, setConnectingId] = useState<BankId | null>(null);

  async function handleConnect(bankId: BankId) {
    setConnectingId(bankId);
    try {
      await connectBank(bankId);
      triggerMicrointeraction("bank_connected", {
        message: "Instituição conectada",
        title: "Open Finance",
        target: `[data-connect-bank="${bankId}"]`,
      });
    } catch {
      triggerMicrointeraction("error", {
        message: "Não foi possível conectar o banco",
      });
    } finally {
      setConnectingId(null);
    }
  }

  return (
    <div className="atlas-of-connect">
      <header className="atlas-of-connect-header">
        <Link to="/contas" className="atlas-of-back">
          ← Hub
        </Link>
        <p className="atlas-of-eyebrow">Open Finance</p>
        <h1>Conectar bancos</h1>
        <p>Escolha uma instituição para trazer saldos e cartões para a Atlas</p>
      </header>

      {error && <p className="atlas-of-inline-erro">{error}</p>}

      {loading && catalog.length === 0 ? (
        <p className="atlas-of-muted">Carregando catálogo...</p>
      ) : (
        <ul className="atlas-of-connect-list">
          {catalog.map((bank) => {
            const connected = bank.status === "connected";
            return (
              <li
                key={bank.id}
                className="atlas-of-connect-card"
                data-connect-bank={bank.id}
              >
                <BankLogo bankId={bank.id} name={bank.name} size={48} />
                <div className="atlas-of-connect-info">
                  <strong>{bank.name}</strong>
                  <small>
                    {connected
                      ? `Conectado · ${formatLastSynced(bank.lastSyncedAt)}`
                      : "Disponível para conexão"}
                  </small>
                </div>
                {connected ? (
                  <span className="atlas-of-connect-done">
                    <Check size={16} aria-hidden="true" />
                    Conectado
                  </span>
                ) : (
                  <Button
                    size="sm"
                    loading={actionLoading && connectingId === bank.id}
                    disabled={actionLoading}
                    onClick={() => void handleConnect(bank.id)}
                  >
                    <Link2 size={14} aria-hidden="true" />
                    Conectar
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ConnectBanksScreen;
