// Main Types Index
// Centralized exports for all types

// Enums and Status Types
export * from './enums';

// Backend Models (should match database schema exactly)
export * from './models';

// API Types (request/response types)
export * from './api';

// Component Types (UI component props)
export * from './components';

// Interview Types
export * from './interview';

// Legacy types for backward compatibility
export interface GroupedMatchReport {
  overall_score: number;
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