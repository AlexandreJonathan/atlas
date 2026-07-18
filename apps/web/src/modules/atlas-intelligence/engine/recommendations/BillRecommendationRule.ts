import type { RecommendationRule } from "../../types/recommendation";
import { isTodayISO, isTomorrowISO } from "../../utils/format";
import { formatMoneyBRL, recommendation } from "./helpers";

/** Contas vencidas e próximas — dados da FDL. */
export const BillRecommendationRule: RecommendationRule = {
  id: "bills",
  evaluate(context) {
    const out = [];

    if (context.contasVencidas.length > 0) {
      const primeira = context.contasVencidas[0]!;
      out.push(
        recommendation({
          id: "rec-bills-overdue",
          title: "Contas em atraso",
          description: `Você tem ${context.contasVencidas.length} conta(s) vencida(s). Comece por ${primeira.description} (${formatMoneyBRL(primeira.amount)}).`,
          priority: 1,
          category: "contas",
          suggestedAction: "Marque como paga em Contas após quitar o valor.",
          tone: "critica",
          sourceRule: this.id,
        }),
      );
    }

    const venceAmanha = context.contasProximas.find((c) => isTomorrowISO(c.dueDate));
    if (venceAmanha) {
      out.push(
        recommendation({
          id: `rec-bills-tomorrow-${venceAmanha.id}`,
          title: "Conta vence amanhã",
          description: `${venceAmanha.description} vence amanhã — ${formatMoneyBRL(venceAmanha.amount)}.`,
          priority: 2,
          category: "contas",
          suggestedAction: "Reserve o valor hoje para evitar atraso.",
          tone: "atencao",
          sourceRule: this.id,
        }),
      );
    } else {
      const venceHoje = context.contasProximas.find((c) => isTodayISO(c.dueDate));
      if (venceHoje) {
        out.push(
          recommendation({
            id: `rec-bills-today-${venceHoje.id}`,
            title: "Conta vence hoje",
            description: `${venceHoje.description} vence hoje (${formatMoneyBRL(venceHoje.amount)}).`,
            priority: 2,
            category: "contas",
            suggestedAction: "Priorize o pagamento ainda hoje.",
            tone: "atencao",
            sourceRule: this.id,
          }),
        );
      }
    }

    return out;
  },
};
