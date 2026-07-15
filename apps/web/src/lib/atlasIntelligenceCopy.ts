import type { Recommendation } from "../types/recommendation";

export type AtlasIntelligenceCopy = {
  saudacao: string;
  resumo: string;
};

// Função pura de apresentação — recebe o `Recommendation[]` já calculado
// pelo motor existente (recommendationEngine.ts, via useRecommendations) e
// só gera o texto conversacional da seção "Atlas Intelligence" (Fase 4 da
// Missão 04). Nenhuma regra de negócio nova: zero I/O, zero cálculo
// financeiro — apenas transforma dados que já existem em uma saudação e um
// resumo em linguagem natural.
function saudacaoPorHorario(hora: number): string {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function gerarAtlasIntelligenceCopy(
  recomendacoes: Recommendation[],
  agora: Date = new Date(),
): AtlasIntelligenceCopy {
  const saudacao = saudacaoPorHorario(agora.getHours());

  if (recomendacoes.length === 0) {
    return {
      saudacao,
      resumo: "Está tudo em ordem por aqui. Continue assim!",
    };
  }

  const oportunidades = recomendacoes.filter(
    (recomendacao) => recomendacao.severity === "critica" || recomendacao.severity === "atencao",
  ).length;

  if (oportunidades === 0) {
    return {
      saudacao,
      resumo: `Sua situação financeira está estável. Encontrei ${recomendacoes.length} ${
        recomendacoes.length === 1 ? "observação" : "observações"
      } para você acompanhar.`,
    };
  }

  return {
    saudacao,
    resumo: `Hoje encontrei ${oportunidades} ${
      oportunidades === 1 ? "oportunidade" : "oportunidades"
    } para melhorar sua vida financeira.`,
  };
}
