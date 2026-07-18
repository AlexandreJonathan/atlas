# Installment Intelligence — Atlas v1.2

**Status:** Concluído (v1.2.0) · ciclo de pagamento fechado em Experience (v1.2.1)  
**Rota:** `/parcelas`  
**Flag:** `VITE_FF_INSTALLMENTS` (default `true`)  
**Versão produto:** `1.2.1`

## Visão

Controla compras parceladas, gera o cronograma de parcelas e projeta o impacto futuro na renda, orçamento e planejamento — sem tratar cada parcela como despesa de caixa automática.

## Arquitetura

```
UI (InstallmentsPage / SummaryCard)
        ↓
useInstallments
        ↓
InstallmentsService
        ↓
installmentsService (Supabase Repository)
        ↓
public.installment_plans + installment_payments
        ↓
FDL (invalidate ledger) → Budget / Planner / Intelligence
```

Parcelas **pending** sem `transaction_id` entram como compromisso derivado.  
Ao marcar como paga (v1.2.1), a Atlas cria uma despesa no ledger e grava `transaction_id` — idempotente se já vinculada.  
Parcelas pagas (ou vinculadas a transaction) não double-contam o orçamento.

## Entidades

### InstallmentPlan
descrição, categoria, valor total, nº de parcelas, valor da parcela, primeira data, cartão (opcional), status.

### InstallmentPayment
sequence, due_date, amount, status (`pending|paid|skipped`), `transaction_id` opcional.

## Integrações

| Domínio | Efeito |
|---|---|
| FDL | `installmentPlans`, `totalParcelasDoMes`, `totalParcelasPendentes` no snapshot |
| Budget | `mergeSpentByCategory` soma parcelas pending do mês |
| Financial Planner | sobra/projeções/pressão/liberação consideram parcelas |
| Intelligence | `InstallmentRecommendationRule` |

## Migração

`supabase/migrations/20260718030000_installment_intelligence.sql`

## Analytics

`installments_opened`, `installment_plan_created`, `installment_payment_paid`, `installment_plan_deleted`

## Testes

`modules/installments/utils/installmentMath.test.ts`
