import { Resume } from './cv';

export interface Skill {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  logo?: string; // For compatibility with job cards
  website?: string;
  industry?: string;
  location?: string;
  size?: string;
  social_links?: Record<string, string>;
  gallery_urls?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  company: Company;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: Skill[];
  location: string;
  job_type: string;
  remote_option: string;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  is_active: boolean;
  application_deadline?: string;
  created_at: string;
  vector_score?: number;
  ai_match_score?: number;
  applicants_count?: number;
  status?: 'active' | 'draft' | 'closed';
  matching_weights?: {
    skills: number;
    experience: number;
    education: number;
  };
  
  // Fields for JobMatchesPage and related components
  isApplied?: boolean;
  interview_status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
  interview_id?: string;
  applicationId?: string;
  matchScore?: number;
  matchReasons?: string[];
  highlightedSkills?: string[];
  missingSkills?: string[];
  experienceMatch?: {
    score: number;
    details: string;
  };
  educationMatch?: {
    score: number;
    details: string;
  };
  improvementSuggestions?: string[];
  
  // Additional fields for EnhancedJobMatching
  posted_date?: string;
  advanced_analysis?: {
    confidence_level: 'High' | 'Medium' | 'Low';
    reasoning: string;
    skill_gaps: string[];
    recommendations: string[];
  };
}

export interface JobMatchResponse {
  results: Job[];
  summary: {
    total_jobs: number;
    successful_matches: number;
    cv_summary: {
      name: string;
      skills_count: number;
    };
  };
  message?: string;
}

export interface SavedJob {
  id: string;
  user: string; // user id
  job: Job;
  saved_at: string;
}

export interface Application {
  id: string;
  applicant: Applicant;
  job: Job;
  status: 'applied' | 'interviewed' | 'offered' | 'rejected';
  created_at: string;
  updated_at: string;
  ai_match_score?: number;
  interview_id?: string;
  interview_status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
  resume?: Resume; // The specific resume used for this application
}

// Alias for backward compatibility
export type JobApplication = Application;

export interface Applicant {
  id: string;
  full_name: string;
  email: string;
  profile_picture_url?: string;
  student_profile?: {
    major: string;
  };
}