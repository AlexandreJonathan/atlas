import Badge, { type BadgeTone } from "./ui/Badge";

export type SeverityTone = BadgeTone;

type SeverityBadgeProps = {
  tone: SeverityTone;
  label: string;
};

// Wrapper de domínio fino sobre o Badge genérico do Design System — mantém
// a mesma API (`tone`/`label`) já usada por BillsList, PlanningPanel e
// AtlasIntelligencePanel, sem precisar alterar nenhum desses lugares.
function SeverityBadge({ tone, label }: SeverityBadgeProps) {
  return <Badge tone={tone}>{label}</Badge>;
}

export default SeverityBadge;
