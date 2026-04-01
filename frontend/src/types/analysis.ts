export interface DeepInsights {
  overallAssessment?: string
  strengths?: string[]
  weaknesses?: string[]
  experienceLevel?: string
  experienceAnalysis?: string
  educationFit?: string
  cultureFit?: string
  redFlags?: string[]
  standoutQualities?: string[]
  careerTrajectory?: string
  technicalDepth?: string
  communicationSkills?: string
  recommendedActions?: string[]
  interviewFocus?: string[]
  salaryRange?: string
  hiringRecommendation?: string
}

export interface AnalysisResponse {
  score: number
  extractedSkills: string[]
  matchedSkills: string[]
  missingSkills: string[]
  suggestions: string[]
  deepInsights?: DeepInsights
}
