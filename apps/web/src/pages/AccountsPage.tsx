import { Building2, CreditCard, Landmark, Wallet } from "lucide-react";
import { MOCK_OPEN_FINANCE } from "../data/mockOpenFinance";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import "./AccountsPage.css";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function AccountsPage() {
  const { saldoConsolidado, banks, cards, accounts } = MOCK_OPEN_FINANCE;

  return (
    <div className="atlas-page">
      <header className="atlas-page-header">
        <div>
          <h1>Contas</h1>
          <p>Bancos, cartões e saldos em um só lugar</p>
        </div>
        <Badge tone="informativa">Dados simulados — Open Finance em breve</Badge>
      </header>

      <main className="atlas-page-main">
        <StatCard
          icon={<Wallet size={20} />}
          label="Saldo consolidado"
          value={formatarMoeda(saldoConsolidado)}
          tone="brand"
          hint="Prévia simulada"
        />

        <Card elevated className="atlas-page-section" aria-labelledby="bancos-titulo">
          <h2 id="bancos-titulo" className="atlas-page-section-titulo">
            <Building2 size={20} aria-hidden="true" />
            Bancos conectados
          </h2>
          <ul className="atlas-page-list">
            {banks.map((bank) => (
              <li key={bank.id} className="atlas-page-list-item">
                <span>{bank.name}</span>
                <Badge tone={bank.connected ? "positiva" : "neutra"}>
                  {bank.connected ? "Conectado" : "Não conectado"}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card elevated className="atlas-page-section" aria-labelledby="cartoes-titulo">
          <h2 id="cartoes-titulo" className="atlas-page-section-titulo">
            <CreditCard size={20} aria-hidden="true" />
            Cartões
          </h2>
          <ul className="atlas-page-list">
            {cards.map((card) => (
              <li key={card.id} className="atlas-page-list-item atlas-page-list-item-stack">
                <div className="atlas-page-list-item-row">
                  <span>
                    {card.name} ·••• {card.lastFour}
                  </span>
                  <span className="tabular-nums">{formatarMoeda(card.used)}</span>
                </div>
                <small>
                  Limite {formatarMoeda(card.limit)} · usado {formatarMoeda(card.used)}
                </small>
              </li>
            ))}
          </ul>
        </Card>

        <Card elevated className="atlas-page-section" aria-labelledby="contas-bancarias-titulo">
          <h2 id="contas-bancarias-titulo" className="atlas-page-section-titulo">
            <Landmark size={20} aria-hidden="true" />
            Contas
          </h2>
          <ul className="atlas-page-list">
            {accounts.map((account) => (
              <li key={account.id} className="atlas-page-list-item">
                <span>
                  {account.bankName} — {account.type === "corrente" ? "Corrente" : "Poupança"}
                </span>
                <span className="tabular-nums">{formatarMoeda(account.balance)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </main>
    </div>
  );
}

export default AccountsPage;
