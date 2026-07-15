import { BrainCircuit } from "lucide-react";
import { useMemo } from "react";
import type { useRecommendations } from "../hooks/useRecommendations";
import { gerarAtlasIntelligenceCopy } from "../lib/atlasIntelligenceCopy";
import type { RecommendationSeverity } from "../types/recommendation";
import "./AtlasIntelligencePanel.css";
import SeverityBadge from "./SeverityBadge";
import Card from "./ui/Card";

type AtlasIntelligencePanelProps = {
  estado: ReturnType<typeof useRecommendations>;
};

const LEGENDAS: Record<RecommendationSeverity, string> = {
  critica: "Crítico",
  atencao: "Atenção",
  positiva: "Positivo",
  informativa: "Info",
};

// Antes desta missão: "RecommendationsPanel". Renomeado para
// "AtlasIntelligencePanel" na Fase 4 da Missão 04 — a IA passa a ser
// protagonista, com identidade visual própria (glow de marca + ícone de
// "cérebro") e um texto conversacional (saudação + resumo) gerado por
// `atlasIntelligenceCopy.ts` a partir das mesmas recomendações já
// calculadas por `recommendationEngine.ts`/`useRecommendations` — nenhuma
// regra de negócio nova.
function AtlasIntelligencePanel({ estado }: AtlasIntelligencePanelProps) {
  const copy = useMemo(() => gerarAtlasIntelligenceCopy(estado.recomendacoes), [estado.recomendacoes]);

  return (
    <Card glow elevated className="atlas-intelligence" aria-labelledby="atlas-intelligence-titulo">
      <div className="atlas-intelligence-header">
        <span className="atlas-intelligence-icon" aria-hidden="true">
          <BrainCircuit size={24} />
        </span>
        <div>
          <span className="atlas-intelligence-eyebrow" id="atlas-intelligence-titulo">
            Atlas Intelligence
          </span>
          {estado.loading ? (
            <p className="atlas-intelligence-mensagem">Analisando sua situação financeira...</p>
          ) : (
            <p className="atlas-intelligence-mensagem">
              {copy.saudacao}. {copy.resumo}
            </p>
          )}
        </div>
      </div>

      {!estado.loading && estado.recomendacoes.length > 0 && (
        <ul className="atlas-intelligence-lista">
          {estado.recomendacoes.map((recomendacao) => (
            <li key={recomendacao.id}>
              <SeverityBadge tone={recomendacao.severity} label={LEGENDAS[recomendacao.severity]} />
              <span>{recomendacao.message}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default AtlasIntelligencePanel;
