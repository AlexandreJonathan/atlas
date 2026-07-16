import type { Insight, IntelligenceContext } from "../types";
import {
  formatMoneyBRL,
  isTodayISO,
  isTomorrowISO,
  percentProgress,
} from "../utils/format";

function nowISO(): string {
  return new Date().toISOString();
}

function insight(
  partial: Omit<Insight, "createdAt"> & { createdAt?: string },
): Insight {
  return { ...partial, createdAt: partial.createdAt ?? nowISO() };
}

/**
 * Atlas Intelligence Engine — regras locais para insights automáticos.
 * Puro, síncrono, sem I/O. Não altera engines financeiros existentes.
 */
export function gerarInsights(context: IntelligenceContext): Insight[] {
  const out: Insight[] = [];

  // Contas vencidas / amanhã
  if (context.contasVencidas.length > 0) {
    const primeira = context.contasVencidas[0];
    out.push(
      insight({
        id: "insight-contas-vencidas",
        tone: "critica",
        title: "Contas em atraso",
        message: `Você tem ${context.contasVencidas.length} conta(s) vencida(s). Comece por ${primeira.description} (${formatMoneyBRL(primeira.amount)}).`,
        priority: 1,
        category: "conta",
      }),
    );
  }

  const venceAmanha = context.contasProximas.find((c) => isTomorrowISO(c.dueDate));
  if (venceAmanha) {
    out.push(
      insight({
        id: `insight-conta-amanha-${venceAmanha.id}`,
        tone: "atencao",
        title: "Próxima conta",
        message: `Sua próxima conta (${venceAmanha.description}) vence amanhã — ${formatMoneyBRL(venceAmanha.amount)}.`,
        priority: 2,
        category: "conta",
      }),
    );
  } else {
    const venceHoje = context.contasProximas.find((c) => isTodayISO(c.dueDate));
    if (venceHoje) {
      out.push(
        insight({
          id: `insight-conta-hoje-${venceHoje.id}`,
          tone: "atencao",
          title: "Conta vence hoje",
          message: `${venceHoje.description} vence hoje (${formatMoneyBRL(venceHoje.amount)}).`,
          priority: 2,
          category: "conta",
        }),
      );
    }
  }

  // Economia do mês / vs mês anterior
  const economiaMes = context.receitasDoMes - context.despesasDoMes;
  if (
    context.receitasMesAnterior != null &&
    context.despesasMesAnterior != null
  ) {
    const economiaAnterior = context.receitasMesAnterior - context.despesasMesAnterior;
    if (economiaMes > economiaAnterior && economiaMes > 0) {
      out.push(
        insight({
          id: "insight-economizou-mais",
          tone: "positiva",
          title: "Economia em alta",
          message: `Você economizou mais que no mês passado (${formatMoneyBRL(economiaMes)} neste mês).`,
          priority: 3,
          category: "economia",
        }),
      );
    }
  } else if (economiaMes > 0 && context.receitasDoMes > 0) {
    out.push(
      insight({
        id: "insight-economia-mes",
        tone: "positiva",
        title: "Mês no azul",
        message: `Você economizou ${formatMoneyBRL(economiaMes)} neste mês (receitas − despesas).`,
        priority: 3,
        category: "economia",
      }),
    );
  } else if (economiaMes < 0) {
    out.push(
      insight({
        id: "insight-gastos-acima",
        tone: "atencao",
        title: "Despesas acima das receitas",
        message: `Neste mês as despesas superam as receitas em ${formatMoneyBRL(Math.abs(economiaMes))}.`,
        priority: 2,
        category: "despesa",
      }),
    );
  }

  // Maior despesa (proxy por lançamento — sem categorias ainda)
  const despesas = context.transacoesRecentes.filter((t) => t.type === "despesa");
  if (despesas.length > 0) {
    const maior = despesas.reduce((a, b) => (b.amount > a.amount ? b : a));
    out.push(
      insight({
        id: "insight-maior-despesa",
        tone: "informativa",
        title: "Maior despesa recente",
        message: `Sua maior despesa recente foi ${maior.description} (${formatMoneyBRL(maior.amount)}).`,
        priority: 4,
        category: "despesa",
      }),
    );
  }

  // Metas
  for (const meta of context.metas) {
    const pct = percentProgress(meta.currentAmount, meta.targetAmount);
    if (pct >= 100) {
      out.push(
        insight({
          id: `insight-meta-concluida-${meta.id}`,
          tone: "positiva",
          title: "Meta concluída",
          message: `Você concluiu a meta “${meta.title}”.`,
          priority: 2,
          category: "meta",
        }),
      );
    } else if (pct >= 25) {
      out.push(
        insight({
          id: `insight-meta-progresso-${meta.id}`,
          tone: "positiva",
          title: "Progresso na meta",
          message: `Você já concluiu ${pct}% da sua meta “${meta.title}”.`,
          priority: 3,
          category: "meta",
        }),
      );
    }
  }

  // Patrimônio / investimentos
  if (context.patrimonio > 0 && context.saldo > 0) {
    const recentIncome = context.transacoesRecentes.some((t) => t.type === "receita");
    if (recentIncome) {
      out.push(
        insight({
          id: "insight-patrimonio-cresceu",
          tone: "positiva",
          title: "Patrimônio em movimento",
          message: `Seu patrimônio está em ${formatMoneyBRL(context.patrimonio)}. Entradas recentes reforçaram o saldo.`,
          priority: 4,
          category: "patrimonio",
        }),
      );
    }
  }

  if (context.investimentosPatrimonio > 0) {
    out.push(
      insight({
        id: "insight-investimentos",
        tone: "informativa",
        title: "Investimentos",
        message: `Você tem ${formatMoneyBRL(context.investimentosPatrimonio)} em investimentos para acompanhar (somente leitura).`,
        priority: 5,
        category: "investimento",
      }),
    );
  }

  if (context.risco === "alto") {
    out.push(
      insight({
        id: "insight-risco-alto",
        tone: "atencao",
        title: "Risco financeiro",
        message: "O risco do mês está alto. Revise gastos e contas pendentes com calma.",
        priority: 2,
        category: "geral",
      }),
    );
  }

  if (out.length === 0) {
    out.push(
      insight({
        id: "insight-tudo-ok",
        tone: "positiva",
        title: "Tudo sob controle",
        message: "Nenhum alerta crítico no momento. Continue acompanhando metas e contas.",
        priority: 5,
        category: "geral",
      }),
    );
  }

  // Dedup por id
  const seen = new Set<string>();
  return out.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
