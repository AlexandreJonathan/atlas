import { CreditCard, Landmark, Link2, PiggyBank, RefreshCw, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import StatCard from "../../../components/ui/StatCard";
import {
  AnimatedNumber,
  pulseGlow,
  setSyncing,
  triggerMicrointeraction,
} from "../../../lib/microinteractions";
import { useOpenFinance } from "../hooks/useOpenFinance";
import type { BankId } from "../types";
import { formatLastSynced, formatOpenFinanceMoney } from "../utils/aggregate";
import BankLogo from "./BankLogo";
import "./OpenFinanceHub.css";

function OpenFinanceHub() {
  const navigate = useNavigate();
  const { snapshot, totals, connectedBanks, loading, error, refresh, syncBank, actionLoading } =
    useOpenFinance();
  const [syncingId, setSyncingId] = useState<BankId | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const prevSaldoRef = useRef<number | null>(null);

  useEffect(() => {
    const saldo = totals?.saldo ?? null;
    if (saldo == null) return;
    const prev = prevSaldoRef.current;
    if (prev != null && saldo > prev && statsRef.current) {
      pulseGlow(statsRef.current.querySelector(".atlas-stat-card"));
    }
    prevSaldoRef.current = saldo;
  }, [totals?.saldo]);

  async function handleSync(bankId: BankId) {
    setSyncingId(bankId);
    triggerMicrointeraction("bank_sync", {
      toast: false,
      target: `[data-bank-row="${bankId}"]`,
    });
    try {
      await syncBank(bankId);
      triggerMicrointeraction("success", {
        message: "Sincronização concluída",
        title: "Open Finance",
      });
      if (statsRef.current) pulseGlow(statsRef.current.querySelector(".atlas-stat-card"));
    } catch {
      triggerMicrointeraction("error", { message: "Não foi possível sincronizar" });
    } finally {
      setSyncing(`[data-bank-row="${bankId}"]`, false);
      setSyncingId(null);
    }
  }

  if (loading && !snapshot) {
    return <div className="atlas-of-state">Carregando hub financeiro...</div>;
  }

  if (error && !snapshot) {
    return (
      <div className="atlas-of-state atlas-of-state-erro">
        <p>{error}</p>
        <Button size="sm" variant="secondary" onClick={() => void refresh()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="atlas-of-hub">
      <header className="atlas-of-hub-header">
        <div>
          <p className="atlas-of-eyebrow">Open Finance</p>
          <h1>Hub financeiro</h1>
          <p>Patrimônio, saldos e conexões em um só lugar</p>
        </div>
        <Button size="sm" onClick={() => navigate("/contas/conectar")}>
          <Link2 size={16} aria-hidden="true" />
          Conectar bancos
        </Button>
      </header>

      <div className="atlas-of-hub-stats" ref={statsRef}>
        <div className="atlas-stat-card">
          <span className="atlas-stat-card-icon atlas-stat-card-icon-brand" aria-hidden="true">
            <Wallet size={20} />
          </span>
          <div className="atlas-stat-card-body">
            <span className="atlas-stat-card-label">Patrimônio</span>
            <span className="atlas-stat-card-value tabular-nums atlas-stat-card-value-brand">
              <AnimatedNumber value={totals?.patrimonio ?? 0} format={formatOpenFinanceMoney} />
            </span>
          </div>
        </div>
        <div className="atlas-stat-card">
          <span className="atlas-stat-card-icon atlas-stat-card-icon-success" aria-hidden="true">
            <Landmark size={20} />
          </span>
          <div className="atlas-stat-card-body">
            <span className="atlas-stat-card-label">Saldo em contas</span>
            <span className="atlas-stat-card-value tabular-nums atlas-stat-card-value-success">
              <AnimatedNumber value={totals?.saldo ?? 0} format={formatOpenFinanceMoney} />
            </span>
          </div>
        </div>
        <StatCard
          icon={<CreditCard size={20} />}
          label="Cartões (usado)"
          value={formatOpenFinanceMoney(totals?.cartoesUsado ?? 0)}
          tone="warning"
          hint={`Limite ${formatOpenFinanceMoney(totals?.cartoesLimite ?? 0)}`}
        />
        <StatCard
          icon={<PiggyBank size={20} />}
          label="Investimentos"
          value={formatOpenFinanceMoney(totals?.investimentos ?? 0)}
          tone="info"
        />
      </div>

      <Card elevated className="atlas-of-section">
        <div className="atlas-of-section-header">
          <h2>Contas conectadas</h2>
          <Link to="/contas/conectadas" className="atlas-of-link">
            Ver detalhes
          </Link>
        </div>

        {connectedBanks.length === 0 ? (
          <p className="atlas-of-muted">Nenhum banco conectado ainda.</p>
        ) : (
          <ul className="atlas-of-bank-list">
            {connectedBanks.map((bank) => (
              <li key={bank.id} className="atlas-of-bank-row" data-bank-row={bank.id}>
                <BankLogo bankId={bank.id} name={bank.name} />
                <div className="atlas-of-bank-info">
                  <strong>{bank.name}</strong>
                  <small>Atualizado {formatLastSynced(bank.lastSyncedAt)}</small>
                </div>
                <Badge tone="positiva">Conectado</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={actionLoading}
                  onClick={() => void handleSync(bank.id)}
                  aria-label={`Sincronizar ${bank.name}`}
                >
                  <RefreshCw
                    size={16}
                    aria-hidden="true"
                    className={`atlas-mi-sync-icon${syncingId === bank.id ? " atlas-mi-syncing" : ""}`}
                  />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default OpenFinanceHub;
