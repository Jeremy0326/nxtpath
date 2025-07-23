// API Types and Interfaces
// Centralized location for all API-related types

// Job API Types
export interface JobSearchParams {
  keyword?: string;
  location?: string;
  search?: string;
  job_type?: string | string[];
  experience?: string | string[];
  salary_min?: number;
  salary_max?: number;
  skills?: string[];
  industry?: string;
  remote?: boolean;
  remote_option?: string;
  sort_by?: 'recent' | 'match' | 'salary-asc' | 'salary-desc';
  page?: number;
  page_size?: number;
  pageSize?: number;
  company_size?: string;
}

export interface PaginatedJobsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

export interface JobApplicationData {
  job: string;
  resume: string;
}

// Profile API Types
export interface ProfileUpdateData {
  student_profile?: any;
  full_name?: string;
  email?: string;
}

export interface AccountUpdateData {
  full_name?: string;
  email?: string;
}

// Saved Jobs API Types - using the one from job.ts

export interface SaveJobRequest {
  job_id: string;
}

// Applications API Types - using the one from job.ts

export interface ApplicationById {
  id: string;
}

// Generic API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface ErrorResponse {
  message: string;
  status: 'error';
  errors?: Record<string, string[]>;
}

// University API Types
export interface UniversityAPI {
  id: string;
  name: string;
  location: string;
  website?: string;
}

// Company API Types - using the one from job.ts

// Skills API Types - using the one from job.ts

// CV Analysis API Types
export interface CVAnalysisRequest {
  cv_id: string;
}

export interface CVAnalysisResponse {
  id: string;
  cv_id: string;
  skills: string[];
  experience: string[];
  education: string[];
  overall_score: number;
  recommendations: string[];
  created_at: string;
}

// Interview API Types
export interface InterviewStartRequest {
  application_id: string;
  interview_type: string;
}

export interface InterviewAnswerRequest {
  text: string;
  audio?: Blob;
}

export interface InterviewAnswerResponse {
  next_question?: string;
  is_complete: boolean;
  feedback?: string;
}

export interface InterviewReportRequest {
  application_id: string;
}

export interface InterviewReportResponse {
  id: string;
  application_id: string;
  overall_score: number;
  sections: {
    technical: { score: number; feedback: string };
    behavioral: { score: number; feedback: string };
    communication: { score: number; feedback: string };
  };
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  transcript: string;
  duration: number;
  completed_at: string;
}

// Audio Processing API Types
export interface AudioUploadRequest {
  application_id: string;
  audio_file: File | Blob;
}

export interface AudioUploadResponse {
  audio_url: string;
}

export interface STTRequest {
  application_id: string;
  audio_file: File | Blob;
}

export interface STTResponse {
  transcript: string;
}

export interface TTSRequest {
  application_id: string;
  text: string;
  voice?: string;
}

export interface TTSResponse {
  audio_url: string;
}

// Career Fair API Types - using the one from career-fair.ts

export interface CareerFairRegistration {
  fair_id: string;
  user_id: string;
  registration_date: string;
  status: 'registered' | 'attended' | 'no-show';
}

export interface BoothBooking {
  id: string;
  company_id: string;
  student_id: string;
  slot_time: string;
  duration: number;
  status: 'booked' | 'completed' | 'cancelled';
}

// Employer API Types
export interface EmployerJob {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  location: string;
  type: 'full-time' | 'part-time' | 'internship';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  experience: string;
  education: string;
  skills: string[];
  status: 'draft' | 'published' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface JobApplicant {
  id: string;
  job_id: string;
  student: any;
  resume: any;
  applied_at: string;
  status: 'applied' | 'under-review' | 'interview' | 'offer' | 'rejected';
  match_score?: number;
  ai_analysis?: any;
}

export interface JobWeightage {
  skill_weight: number;
  experience_weight: number;
  education_weight: number;
}

// Match Analysis API Types
export interface MatchAnalysisRequest {
  job_id: string;
  cv_id?: string;
}

export interface MatchAnalysisResponse {
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

// File Upload API Types
export interface FileUploadRequest {
  file: File;
  type: 'resume' | 'profile_picture' | 'company_logo';
}

export interface FileUploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  uploaded_at: string;
}

// Notification API Types
export interface NotificationAPI {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  job_alerts: boolean;
  application_updates: boolean;
  career_fair_reminders: boolean;
}

// Search API Types
export interface SearchRequest {
  query: string;
  filters?: Record<string, any>;
  page?: number;
  page_size?: number;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

// Analytics API Types
export interface AnalyticsRequest {
  start_date: string;
  end_date: string;
  metrics: string[];
  filters?: Record<string, any>;
}

export interface AnalyticsResponse {
  metrics: Record<string, number>;
  trends: Record<string, Array<{ date: string; value: number }>>;
  breakdowns: Record<string, Array<{ label: string; value: number }>>;
}

// Settings API Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  email_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  privacy_settings: {
    profile_visibility: 'public' | 'private' | 'connections';
    resume_visibility: 'public' | 'private' | 'connections';
    activity_visibility: 'public' | 'private' | 'connections';
  };
}

export interface SettingsUpdateRequest {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  email_frequency?: 'daily' | 'weekly' | 'monthly' | 'never';
  privacy_settings?: Partial<UserSettings['privacy_settings']>;
} 