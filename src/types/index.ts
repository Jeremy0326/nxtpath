// User Types
import {
  User,
  StudentProfile,
  EmployerProfile,
  UniversityStaffProfile,
  AuthState,
  UserRole,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  University
} from './auth';

export type { User, StudentProfile, EmployerProfile, UniversityStaffProfile, AuthState, UserRole, LoginCredentials, RegisterCredentials, AuthResponse, University };

// Job Types
import type { Job } from './job';

export * from './job';

export interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  description: string;
  matchScore: number;
  requiredSkills: string[];
  location: string;
  salary?: string;
}

export interface CareerInsight {
  insight_type: string;
  title: string;
  description: string;
  impact_level: 'High' | 'Medium' | 'Low';
  actionable_steps: string[];
}

export interface CareerPreferencesInsight {
  type: 'alignment' | 'insight' | 'recommendations';
  title: string;
  description: string;
  impact_level: 'High' | 'Medium' | 'Low';
}

export interface SkillGapAnalysis {
  critical_gaps: string[];
  minor_gaps: string[];
  strong_matches: string[];
  transferable_skills: string[];
  learning_priority: string[];
}

export interface ExperienceAlignment {
  relevance_score: number;
  relevant_experiences: string[];
  transferable_experiences: string[];
  experience_gaps: string[];
  growth_trajectory: string;
}

export interface CareerFitAnalysis {
  cultural_fit_score: number;
  growth_potential: 'High' | 'Medium' | 'Low';
  career_stage_alignment: string;
  long_term_potential: string;
  risk_factors: string[];
}

export interface AdvancedMatchResult {
  id: string;
  overall_score: number;
  skills_score: number;
  experience_score: number;
  career_fit_score: number;
  growth_potential_score: number;
  preferences_bonus: number;
  skill_gap_analysis: {
    matching_skills: string[];
    missing_skills: string[];
    skill_match_percentage: number;
  };
  experience_alignment: {
    years_experience_match: number;
    relevant_experience: string[];
    experience_gaps: string[];
  };
  career_fit_analysis: {
    industry_alignment: number;
    role_alignment: number;
    company_culture_fit: number;
  };
  career_insights: Array<{
    type: 'strength' | 'improvement' | 'opportunity' | 'warning';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  personalized_recommendations: Array<{
    category: 'skill_development' | 'experience' | 'networking' | 'application';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  career_preferences_insights: Array<{
    preference_type: 'industry' | 'location' | 'work_type' | 'role';
    match_level: 'excellent' | 'good' | 'moderate' | 'poor';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  // New fields for enhanced insights
  benchmark_percentile?: {
    skills?: number;
    experience?: number;
    overall?: number;
    description?: string;
  };
  employer_weightage?: Record<string, number>;
  risk_flags?: Array<{
    type: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  opportunity_flags?: Array<{
    type: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  score_breakdown?: Record<string, any>;
  report_version: string;
  model_name: string;
  created_at: string;
}

// GroupedMatchReport: Dual-audience report structure with shared data and audience-specific insights. All axis analyses are always present with summary fields. New fields: encouragement, next_career_goal, fit_summary, follow_up_questions.
export interface GroupedMatchReport {
  overall_score: number; // Top-level score for frontend compatibility
  shared: {
    skills_score: number;
    experience_score: number;
    culture_fit_score: number;
    growth_potential_score: number;
    preferences_bonus: number;
    overall_score: number;
    skills_analysis: {
      matching_skills: string[];
      missing_skills: string[];
      summary: string;
    };
    experience_analysis: {
      relevant_experience: string[];
      experience_gaps: string[];
      summary: string;
    };
    culture_fit_analysis: {
      summary: string;
      teamwork: number;
      values_alignment: number;
      communication: number;
    };
    growth_potential_analysis: {
      summary: string;
      learning_agility: number;
      upskilling_history: number;
      motivation: number;
    };
    preferences_analysis: Array<{
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      match_level: 'excellent' | 'good' | 'moderate' | 'poor';
      preference_type: 'industry' | 'location' | 'work_type' | 'role';
    }>;
  };
  student_view: {
    career_insights: Array<{
      type: 'strength' | 'improvement' | 'opportunity' | 'warning' | 'gap';
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
    }>;
    personalized_recommendations: Array<{
      category: 'skill_development' | 'experience' | 'networking' | 'application';
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    encouragement: string;
    next_career_goal: string;
  };
  employer_view: {
    risk_flags: Array<{
      type: 'hard_filter' | 'potential_risk' | 'soft_risk';
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
    }>;
    opportunity_flags: Array<{
      type: 'unique_strength' | 'growth_potential' | 'diversity';
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
    }>;
    recruiter_recommendations: Array<{
      title: string;
      description: string;
    }>;
    fit_summary: string;
    follow_up_questions: string[];
  };
  audience: 'dual';
  employer_weightage: {
    skills: number;
    experience: number;
    culture_fit: number;
    growth_potential: number;
  };
}

export interface Application {
  id: number;
  job: Job;
  user: number;
  status: 'applied' | 'under-review' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  applied_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}