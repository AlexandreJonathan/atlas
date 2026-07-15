import type { useRecommendations } from "../hooks/useRecommendations";
import type { RecommendationSeverity } from "../types/recommendation";
import SeverityBadge from "./SeverityBadge";

type RecommendationsPanelProps = {
  estado: ReturnType<typeof useRecommendations>;
};

const LEGENDAS: Record<RecommendationSeverity, string> = {
  critica: "Crítico",
  atencao: "Atenção",
  positiva: "Positivo",
  informativa: "Info",
};

function RecommendationsPanel({ estado }: RecommendationsPanelProps) {
  return (
    <section className="painel painel-recomendacoes" aria-labelledby="recomendacoes-titulo">
      <h2 id="recomendacoes-titulo">🧠 O que o Atlas recomenda agora</h2>

      {estado.loading ? (
        <p className="estado-carregando">Analisando sua situação financeira...</p>
      ) : (
        <ul className="lista-recomendacoes">
          {estado.recomendacoes.map((recomendacao) => (
            <li key={recomendacao.id}>
              <SeverityBadge tone={recomendacao.severity} label={LEGENDAS[recomendacao.severity]} />
              <span>{recomendacao.message}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecommendationsPanel;
