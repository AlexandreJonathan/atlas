import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Receipt } from "lucide-react";
import AsyncStateView from "../components/AsyncStateView";
import Button from "../components/ui/Button";
import { analytics } from "../lib/analytics";
import { getTodayISO } from "../lib/dateUtils";
import { useFinancialData } from "../modules/financial-data";
import type { Bill } from "../types/bill";
import "./BillsPage.css";

type StatusFilter = "todas" | "futuras" | "vencidas" | "pagas";
type PeriodFilter = "30d" | "90d" | "ano" | "tudo";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function daysAgoISO(days: number, today = getTodayISO()): string {
  const date = new Date(`${today}T12:00:00`);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function inPeriod(bill: Bill, period: PeriodFilter, today: string): boolean {
  if (period === "tudo") return true;
  const from =
    period === "30d"
      ? daysAgoISO(30, today)
      : period === "90d"
        ? daysAgoISO(90, today)
        : `${today.slice(0, 4)}-01-01`;
  const to =
    period === "ano"
      ? `${today.slice(0, 4)}-12-31`
      : (() => {
          const date = new Date(`${today}T12:00:00`);
          date.setDate(date.getDate() + (period === "30d" ? 30 : 90));
          return date.toISOString().slice(0, 10);
        })();
  return bill.dueDate >= from && bill.dueDate <= to;
}

function matchesStatus(bill: Bill, filter: StatusFilter, today: string): boolean {
  if (filter === "todas") return true;
  if (filter === "pagas") return bill.status === "pago";
  if (bill.status === "pago") return false;
  if (filter === "vencidas") return bill.dueDate < today;
  return bill.dueDate >= today;
}

function statusLabel(bill: Bill, today: string): string {
  if (bill.status === "pago") return "Paga";
  if (bill.dueDate < today) return "Vencida";
  return "Futura";
}

function BillsPage() {
  const { contas } = useFinancialData();
  const today = getTodayISO();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("90d");

  useEffect(() => {
    analytics.track("bills_page_opened");
  }, []);

  const filtered = useMemo(() => {
    return [...contas.bills]
      .filter((b) => inPeriod(b, periodFilter, today))
      .filter((b) => matchesStatus(b, statusFilter, today))
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "pendente" ? -1 : 1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [contas.bills, periodFilter, statusFilter, today]);

  return (
    <div className="atlas-page-shell atlas-bills-page">
      <header className="atlas-bills-page-header">
        <Link to="/inicio" className="atlas-bills-page-back">
          <ArrowLeft size={16} aria-hidden="true" />
          Início
        </Link>
        <div className="atlas-bills-page-title">
          <span className="atlas-bills-page-icon" aria-hidden="true">
            <Receipt size={20} />
          </span>
          <div>
            <p className="atlas-page-eyebrow">Agenda</p>
            <h1>Todas as contas</h1>
            <p>Futuras, vencidas e pagas — filtre por período</p>
          </div>
        </div>
      </header>

      <div className="atlas-bills-filters" role="group" aria-label="Filtros de contas">
        <div className="atlas-bills-filter-row">
          <span className="atlas-bills-filter-label" id="filter-status-label">
            Status
          </span>
          <div className="atlas-bills-chips" role="radiogroup" aria-labelledby="filter-status-label">
            {(
              [
                ["todas", "Todas"],
                ["futuras", "Futuras"],
                ["vencidas", "Vencidas"],
                ["pagas", "Pagas"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={statusFilter === value}
                className={
                  statusFilter === value
                    ? "atlas-bills-chip is-active"
                    : "atlas-bills-chip"
                }
                onClick={() => setStatusFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="atlas-bills-filter-row">
          <span className="atlas-bills-filter-label" id="filter-period-label">
            Período
          </span>
          <div className="atlas-bills-chips" role="radiogroup" aria-labelledby="filter-period-label">
            {(
              [
                ["30d", "30 dias"],
                ["90d", "90 dias"],
                ["ano", "Este ano"],
                ["tudo", "Tudo"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={periodFilter === value}
                className={
                  periodFilter === value
                    ? "atlas-bills-chip is-active"
                    : "atlas-bills-chip"
                }
                onClick={() => setPeriodFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AsyncStateView
        loading={contas.loading}
        error={contas.error}
        isEmpty={filtered.length === 0}
        emptyMessage="Nenhuma conta neste filtro. Ajuste status ou período."
        onRetry={contas.recarregar}
        loadingMessage="Carregando contas..."
      >
        <ul className="atlas-bills-page-list" aria-label="Lista de contas">
          {filtered.map((bill, index) => (
            <li
              key={bill.id}
              className="atlas-bills-page-item"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <div className="atlas-bills-page-info">
                <span className="atlas-bills-page-desc">{bill.description}</span>
                <small>
                  {formatarData(bill.dueDate)} ·{" "}
                  {bill.type === "a_pagar" ? "A pagar" : "A receber"} ·{" "}
                  {statusLabel(bill, today)}
                </small>
              </div>
              <span className="atlas-bills-page-valor tabular-nums">
                {formatarMoeda(bill.amount)}
              </span>
              {bill.type === "a_pagar" && bill.status === "pendente" ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void contas.marcarComoPaga(bill.id)}
                >
                  Pagar
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </AsyncStateView>

      {contas.actionError ? (
        <p className="atlas-panel-erro-acao" role="alert">
          {contas.actionError}
        </p>
      ) : null}
    </div>
  );
}

export default BillsPage;
