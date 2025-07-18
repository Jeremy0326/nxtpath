
import { Resume } from './cv';
import { Job } from './job';

export interface StudentAnalysis {
  strengths: string[];
  areas_for_improvement: string[];
  alignment_with_preferences: string;
}

export interface EmployerAnalysis {
  evidence_of_key_skills: string[];
  culture_fit_indicators: string[];
  potential_red_flags: string[];
}

export interface SkillGapAnalysis {
  critical_gaps: string[];
  strong_matches: string[];
  transferable_skills: string[];
}

export interface ReportData {
  overall_match_score: number;
  executive_summary: string;
  hiring_recommendation: 'Strong Recommend' | 'Recommend' | 'Consider' | 'Not a Fit';
  analysis_for_student: StudentAnalysis;
  analysis_for_employer: EmployerAnalysis;
  skill_gap_analysis: SkillGapAnalysis;
  error?: string;
  raw_response?: string;
}

// This is the primary AI analysis report object returned by the API.
export interface AIAnalysisReport {
  id: string;
  resume: string; // resume id
  job: string; // job id
  overall_score: number;
  report_data: ReportData;
  report_version: string;
  model_name: string;
  is_stale: boolean;
  created_at: string;
} 

// AI Interview Report type for InterviewReport component
export interface AIInterviewReportData {
  id: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  fit_score: number;
  culture_fit_score: number;
  communication_score: number;
  technical_depth_score: number;
  suggested_next_step: string;
  rationale: string;
  follow_up_questions: string[];
  version: string;
  model_name: string;
  overall_score: number;
  created_at: string;
} 