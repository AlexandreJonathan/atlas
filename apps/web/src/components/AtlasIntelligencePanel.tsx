import { BrainCircuit, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { useRecommendations } from "../hooks/useRecommendations";
import { gerarAtlasIntelligenceCopy } from "../lib/atlasIntelligenceCopy";
import "./AtlasIntelligencePanel.css";

type AtlasIntelligencePanelProps = {
  estado: ReturnType<typeof useRecommendations>;
};

// Coração conversacional da Home: fala com o usuário em primeira pessoa,
// mostra no máximo 2 insights e convida para a aba Atlas IA.
function AtlasIntelligencePanel({ estado }: AtlasIntelligencePanelProps) {
  const copy = useMemo(() => gerarAtlasIntelligenceCopy(estado.recomendacoes), [estado.recomendacoes]);
  const insights = estado.recomendacoes.slice(0, 2);

  return (
    <section className="atlas-intelligence" aria-labelledby="atlas-intelligence-titulo">
      <div className="atlas-intelligence-top">
        <span className="atlas-intelligence-icon" aria-hidden="true">
          <BrainCircuit size={22} />
        </span>
        <div>
          <h2 className="atlas-intelligence-eyebrow" id="atlas-intelligence-titulo">
            Atlas Intelligence
          </h2>
          <p className="atlas-intelligence-sub">Uma conversa sobre o seu dinheiro</p>
        </div>
      </div>

      <div className="atlas-intelligence-thread" role="log" aria-live="polite">
        {estado.loading ? (
          <div className="atlas-intelligence-bubble atlas-intelligence-bubble-assistant">
            Estou analisando sua situação financeira...
          </div>
        ) : (
          <>
            <div className="atlas-intelligence-bubble atlas-intelligence-bubble-assistant">
              {copy.saudacao}. {copy.resumo}
            </div>
            {insights.map((recomendacao) => (
              <div
                key={recomendacao.id}
                className="atlas-intelligence-bubble atlas-intelligence-bubble-assistant atlas-intelligence-bubble-soft"
              >
                {recomendacao.message}
              </div>
            ))}
          </>
        )}
      </div>

      <Link to="/atlas-ia" className="atlas-intelligence-cta">
        Continuar conversa
        <ChevronRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}

export default AtlasIntelligencePanel;
