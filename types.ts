export interface AnalysisResult {
  jobTitle: string;
  compatibilityScore: number;
  commonSkills: string[];
  improvementSuggestions: string[];
}

export interface AnalysisResultWithId extends AnalysisResult {
  id: string;
  timestamp: string;
}
