import { CreditCard, Landmark, Link2, PiggyBank, RefreshCw, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import StatCard from "../../../components/ui/StatCard";
import { useOpenFinance } from "../hooks/useOpenFinance";
import { formatLastSynced, formatOpenFinanceMoney } from "../utils/aggregate";
import BankLogo from "./BankLogo";
import "./OpenFinanceHub.css";

function OpenFinanceHub() {
  const navigate = useNavigate();
  const { snapshot, totals, connectedBanks, loading, error, refresh, syncBank, actionLoading } =
    useOpenFinance();

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

      <div className="atlas-of-hub-stats">
        <StatCard
          icon={<Wallet size={20} />}
          label="Patrimônio"
          value={formatOpenFinanceMoney(totals?.patrimonio ?? 0)}
          tone="brand"
        />
        <StatCard
          icon={<Landmark size={20} />}
          label="Saldo em contas"
          value={formatOpenFinanceMoney(totals?.saldo ?? 0)}
          tone="success"
        />
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
              <li key={bank.id} className="atlas-of-bank-row">
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
                  onClick={() => void syncBank(bank.id)}
                  aria-label={`Sincronizar ${bank.name}`}
                >
                  <RefreshCw size={16} aria-hidden="true" />
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
