import type { Bill } from "../types/bill";
import type { Goal } from "../types/goal";
import type { RiscoFinanceiro } from "../types/planning";
import type { Recommendation, RecommendationSeverity } from "../types/recommendation";
import { addDaysISO, getTodayISO } from "./dateUtils";

// Snapshot de dados já carregados e filtrados pelos hooks de domínio
// (useFinancialSummary/useBills/useGoals). O motor é síncrono e sem I/O —
// não depende de rede nem de Supabase, o que o torna 100% testável e
// facilmente substituível por uma implementação real de IA no futuro
// (ver RecommendationProvider abaixo e roadmap/backlog.md).
export type DashboardSnapshot = {
  saldo: number;
  receitas: number;
  despesas: number;
  receitasDoMes: number;
  despesasDoMes: number;
  quantoPossoGastar: number;
  contasVencidas: Bill[];
  contasVencendoEmBreve: Bill[];
  goals: Goal[];
  // Opcional: só existe quando o usuário já configurou o planejamento
  // financeiro (Sprint 5, ver usePlanning/planningEngine.ts). Sem perfil
  // configurado, essa regra simplesmente não é avaliada.
  risco?: RiscoFinanceiro;
};

// Contrato estável consumido por useRecommendations. A implementação atual
// (ruleBasedRecommendationProvider) só empacota o motor de regras síncrono
// numa Promise; uma futura aiRecommendationProvider (chamando uma Supabase
// Edge Function) pode substituí-la sem qualquer mudança na UI.
export type RecommendationProvider = (snapshot: DashboardSnapshot) => Promise<Recommendation[]>;

const LIMITE_META_QUASE_CONCLUIDA = 0.9;
const DIAS_ATENCAO_VENCIMENTO = 3;

function criarRecomendacao(id: string, severity: RecommendationSeverity, message: string): Recommendation {
  return { id, severity, message };
}

function formatarMoeda(valor: number): string {
  return valor.toFixed(2);
}

export function gerarRecomendacoes(snapshot: DashboardSnapshot): Recommendation[] {
  const recomendacoes: Recommendation[] = [];

  if (snapshot.saldo < 0) {
    recomendacoes.push(
      criarRecomendacao(
        "saldo-negativo",
        "critica",
        `Seu saldo está negativo (R$ ${formatarMoeda(snapshot.saldo)}). Considere reduzir despesas antes de novos gastos.`,
      ),
    );
  }

  if (snapshot.quantoPossoGastar < 0) {
    recomendacoes.push(
      criarRecomendacao(
        "gasto-comprometido",
        "critica",
        `Suas contas a pagar pendentes superam o saldo disponível em R$ ${formatarMoeda(Math.abs(snapshot.quantoPossoGastar))}.`,
      ),
    );
  }

  if (snapshot.contasVencidas.length > 0) {
    const total = snapshot.contasVencidas.reduce((soma, conta) => soma + conta.amount, 0);
    recomendacoes.push(
      criarRecomendacao(
        "contas-vencidas",
        "critica",
        `Você tem ${snapshot.contasVencidas.length} conta(s) vencida(s), totalizando R$ ${formatarMoeda(total)}.`,
      ),
    );
  }

  const hoje = getTodayISO();
  const limiteAtencao = addDaysISO(hoje, DIAS_ATENCAO_VENCIMENTO);
  const contasProximas = snapshot.contasVencendoEmBreve.filter((conta) => conta.dueDate <= limiteAtencao);

  if (contasProximas.length > 0) {
    const total = contasProximas.reduce((soma, conta) => soma + conta.amount, 0);
    recomendacoes.push(
      criarRecomendacao(
        "contas-proximas",
        "atencao",
        `${contasProximas.length} conta(s) vencem nos próximos ${DIAS_ATENCAO_VENCIMENTO} dias, totalizando R$ ${formatarMoeda(total)}.`,
      ),
    );
  }

  if (snapshot.receitasDoMes > 0 && snapshot.despesasDoMes > snapshot.receitasDoMes) {
    recomendacoes.push(
      criarRecomendacao(
        "gastos-acima-da-renda-mes",
        "atencao",
        "Suas despesas deste mês já superam suas receitas do mesmo período.",
      ),
    );
  }

  if (snapshot.risco === "alto") {
    recomendacoes.push(
      criarRecomendacao(
        "risco-financeiro-alto",
        "critica",
        "Seu planejamento indica risco financeiro alto neste mês. Revise despesas fixas e contas pendentes antes de novos gastos.",
      ),
    );
  }

  for (const meta of snapshot.goals) {
    const progresso = meta.targetAmount > 0 ? meta.currentAmount / meta.targetAmount : 0;

    if (progresso >= 1) {
      recomendacoes.push(
        criarRecomendacao(`meta-concluida-${meta.id}`, "positiva", `Parabéns! Você concluiu a meta "${meta.title}".`),
      );
    } else if (progresso >= LIMITE_META_QUASE_CONCLUIDA) {
      const faltam = meta.targetAmount - meta.currentAmount;
      recomendacoes.push(
        criarRecomendacao(
          `meta-quase-la-${meta.id}`,
          "positiva",
          `Faltam apenas R$ ${formatarMoeda(faltam)} para completar a meta "${meta.title}".`,
        ),
      );
    }
  }

  if (recomendacoes.length === 0) {
    const semDados = snapshot.receitas === 0 && snapshot.despesas === 0 && snapshot.goals.length === 0;

    recomendacoes.push(
      semDados
        ? criarRecomendacao(
            "sem-dados",
            "informativa",
            "Ainda não há dados suficientes para gerar recomendações. Registre suas primeiras movimentações.",
          )
        : criarRecomendacao("tudo-certo", "positiva", "Tudo certo por aqui! Continue assim."),
    );
  }

  return recomendacoes;
}

export const ruleBasedRecommendationProvider: RecommendationProvider = (snapshot) =>
  Promise.resolve(gerarRecomendacoes(snapshot));
