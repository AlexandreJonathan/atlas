import { Link } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import { useOpenFinance } from "../hooks/useOpenFinance";
import { formatLastSynced, formatOpenFinanceMoney } from "../utils/aggregate";
import BankLogo from "./BankLogo";
import "./ConnectedAccounts.css";

function accountTypeLabel(type: string): string {
  if (type === "checking") return "Corrente";
  if (type === "savings") return "Poupança";
  return "Pagamento";
}

function ConnectedAccountsScreen() {
  const { snapshot, connectedBanks, loading, error, refresh } = useOpenFinance();

  if (loading && !snapshot) {
    return <div className="atlas-of-state">Carregando contas conectadas...</div>;
  }

  if (error && !snapshot) {
    return (
      <div className="atlas-of-state atlas-of-state-erro">
        <p>{error}</p>
        <button type="button" onClick={() => void refresh()}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="atlas-of-connected">
      <header className="atlas-of-connected-header">
        <Link to="/contas" className="atlas-of-back">
          ← Hub
        </Link>
        <p className="atlas-page-eyebrow">Open Finance</p>
        <h1>Contas conectadas</h1>
        <p>Bancos, saldos, cartões e última atualização</p>
      </header>

      {connectedBanks.length === 0 ? (
        <Card elevated className="atlas-of-empty">
          <p>Você ainda não conectou nenhum banco.</p>
          <Link to="/contas/conectar" className="atlas-of-link">
            Conectar bancos
          </Link>
        </Card>
      ) : (
        connectedBanks.map((bank) => {
          const accounts = snapshot?.accounts.filter((item) => item.bankId === bank.id) ?? [];
          const cards = snapshot?.cards.filter((item) => item.bankId === bank.id) ?? [];
          const saldo = accounts.reduce((total, account) => total + account.balance, 0);

          return (
            <Card elevated key={bank.id} className="atlas-of-connected-card">
              <div className="atlas-of-connected-top">
                <BankLogo bankId={bank.id} name={bank.name} size={48} />
                <div className="atlas-of-connected-title">
                  <strong>{bank.name}</strong>
                  <small>Última atualização · {formatLastSynced(bank.lastSyncedAt)}</small>
                </div>
                <Badge tone="positiva">Conectado</Badge>
              </div>

              <div className="atlas-of-connected-saldo">
                <span>Saldo</span>
                <strong className="tabular-nums">{formatOpenFinanceMoney(saldo)}</strong>
              </div>

              {accounts.length > 0 && (
                <div className="atlas-of-connected-block">
                  <h3>Contas</h3>
                  <ul>
                    {accounts.map((account) => (
                      <li key={account.id}>
                        <span>
                          {account.name} · {accountTypeLabel(account.type)}
                        </span>
                        <span className="tabular-nums">{formatOpenFinanceMoney(account.balance)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {cards.length > 0 && (
                <div className="atlas-of-connected-block">
                  <h3>Cartões</h3>
                  <ul>
                    {cards.map((card) => (
                      <li key={card.id}>
                        <span>
                          {card.name} ·••• {card.lastFour}
                        </span>
                        <span className="tabular-nums">{formatOpenFinanceMoney(card.used)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}

export default ConnectedAccountsScreen;
