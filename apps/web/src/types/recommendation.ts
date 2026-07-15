export type RecommendationSeverity = "critica" | "atencao" | "positiva" | "informativa";

export type Recommendation = {
  id: string;
  severity: RecommendationSeverity;
  message: string;
};
