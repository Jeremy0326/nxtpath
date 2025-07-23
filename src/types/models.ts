// Backend Model Interfaces
// These should match the database schema exactly

import { 
  ApplicationStatus,
  InterviewStatus,
  UserRole,
  JobType,
  RemoteOption,
  CompanySize,
  RequestStatus,
  InterviewSpeaker
} from './enums';

// User Models - matches backend accounts.models.User
export interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: UserRole;
  profile_picture_url?: string;
  is_verified: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string;
  student_profile?: StudentProfile;
  employer_profile?: EmployerProfile;
  university_staff_profile?: UniversityStaffProfile;
}

// Student Profile - matches backend accounts.models.StudentProfile
export interface StudentProfile {
  user: string; // UUID of the user
  university?: string; // UUID of the university
  major?: string;
  graduation_year?: number;
  gpa?: number;
  skills: string[];
  interests: string[];
  career_preferences: CareerPreferences;
  created_at: string;
  updated_at: string;
}

// Employer Profile - matches backend accounts.models.EmployerProfile
export interface EmployerProfile {
  user: string; // UUID of the user
  company?: string; // UUID of the company
  role?: string;
  is_company_admin: boolean;
  created_at: string;
  updated_at: string;
}

// University Staff Profile - matches backend accounts.models.UniversityStaffProfile
export interface UniversityStaffProfile {
  user: string; // UUID of the user
  university: string; // UUID of the university
  role?: string;
  created_at: string;
  updated_at: string;
}

// Career Preferences - matches backend StudentProfile.career_preferences JSONField
export interface CareerPreferences {
  preferred_roles?: string[];
  locations?: string[];
  work_types?: string[];
  industries?: string[];
  salary_min?: number;
  salary_max?: number;
  remote_preference?: boolean;
}

// Job Models - matches backend jobs.models.Job
export interface Job {
  id: string;
  company: Company;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: Skill[];
  location: string;
  job_type: JobType;
  remote_option: RemoteOption;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  is_active: boolean;
  application_deadline?: string;
  matching_weights?: MatchingWeights;
  embedding?: any;
  created_at: string;
  updated_at: string;
}

// Company - matches backend accounts.models.Company
export interface Company {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  location?: string;
  size?: CompanySize;
  social_links?: Record<string, string>;
  gallery_urls?: string[];
  created_at: string;
  updated_at: string;
}

// Skill - matches backend jobs.models.Skill
export interface Skill {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// Matching Weights - matches backend Job.matching_weights JSONField
export interface MatchingWeights {
  skills?: number;
  experience?: number;
  education?: number;
  keywords?: number;
}

// Application Models - matches backend jobs.models.Application
export interface Application {
  id: string;
  job: string; // UUID of the job
  applicant: string; // UUID of the user
  resume?: string; // UUID of the resume
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
}

// Saved Job - matches backend jobs.models.SavedJob
export interface SavedJob {
  id: string;
  user: string; // UUID of the user
  job: string; // UUID of the job
  saved_at: string;
}

// Resume - matches backend accounts.models.Resume
export interface Resume {
  id: string;
  student_profile: string; // UUID of the student profile
  file_url: string;
  file_name?: string;
  is_primary: boolean;
  uploaded_at: string;
  parsed_text?: string;
  is_parsed: boolean;
  embedding?: any;
}

// University - matches backend accounts.models.University
export interface University {
  id: string;
  name: string;
  location?: string;
  logo_url?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

// Career Fair - matches backend career_fairs.models.CareerFair
export interface CareerFair {
  id: string;
  title: string;
  description?: string;
  host_university: string; // UUID of the university
  start_date: string;
  end_date: string;
  location?: string;
  website?: string;
  is_active: boolean;
  banner_image_url?: string;
  floor_plan_url?: string;
  grid_width: number;
  grid_height: number;
  created_at: string;
  updated_at: string;
}

// Booth - matches backend career_fairs.models.Booth
export interface Booth {
  id: string;
  fair: string; // UUID of the career fair
  company: string; // UUID of the company
  jobs: string[]; // Array of job UUIDs
  label?: string;
  booth_number?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}

// Interview Models - matches backend jobs.models.AIInterview
export interface AIInterview {
  id: string;
  application: string; // UUID of the application
  status: InterviewStatus;
  questions: any[];
  answers: any[];
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  report_generated: boolean;
}

// Interview Question - matches backend jobs.models.InterviewQuestion
export interface InterviewQuestion {
  id: string;
  interview: string; // UUID of the interview
  question: string;
  question_type: string;
  order: number;
  created_at: string;
}

// Interview Answer - matches backend jobs.models.InterviewAnswer
export interface InterviewAnswer {
  id: string;
  question: string; // UUID of the question
  answer_text?: string;
  audio_url?: string;
  created_at: string;
}

// Interview Utterance - matches backend jobs.models.InterviewUtterance
export interface InterviewUtterance {
  id: string;
  interview: string; // UUID of the interview
  sequence: number;
  speaker: InterviewSpeaker;
  text: string;
  start_time: number;
  end_time: number;
  audio_clip_url?: string;
  created_at: string;
}

// Interview Report - matches backend jobs.models.AIInterviewReport
export interface AIInterviewReport {
  id: string;
  interview: string; // UUID of the interview
  report_data: any;
  created_at: string;
  report_version: string;
  model_name: string;
  overall_score?: number;
}

// Interview Report (Legacy) - matches backend jobs.models.InterviewReport
export interface InterviewReport {
  id: string;
  interview: string; // UUID of the interview
  application: string; // UUID of the application
  report_data: any;
  created_at: string;
  version: string;
}

// AI Analysis Report - matches backend jobs.models.AIAnalysisReport
export interface AIAnalysisReport {
  id: string;
  resume: string; // UUID of the resume
  job: string; // UUID of the job
  overall_score: number;
  report_data: any;
  report_version: string;
  model_name: string;
  is_stale: boolean;
  created_at: string;
}

// Match Analysis - matches backend AIAnalysisReport.report_data
export interface MatchAnalysis {
  id: string;
  job: string; // UUID of the job
  resume: string; // UUID of the resume
  overall_score: number;
  skills_score: number;
  experience_score: number;
  career_fit_score: number;
  growth_potential_score: number;
  preferences_bonus: number;
  skill_gap_analysis: SkillGapAnalysis;
  experience_alignment: ExperienceAlignment;
  career_fit_analysis: CareerFitAnalysis;
  career_insights: CareerInsight[];
  personalized_recommendations: PersonalizedRecommendation[];
  created_at: string;
  updated_at: string;
}

// Skill Gap Analysis - matches backend analysis data
export interface SkillGapAnalysis {
  matching_skills: string[];
  missing_skills: string[];
  skill_match_percentage: number;
}

// Experience Alignment - matches backend analysis data
export interface ExperienceAlignment {
  years_experience_match: number;
  relevant_experience: string[];
  experience_gaps: string[];
}

// Career Fit Analysis - matches backend analysis data
export interface CareerFitAnalysis {
  industry_alignment: number;
  role_alignment: number;
  company_culture_fit: number;
}

// Career Insight - matches backend analysis data
export interface CareerInsight {
  type: string;
  title: string;
  description: string;
  impact: string;
}

// Personalized Recommendation - matches backend analysis data
export interface PersonalizedRecommendation {
  category: string;
  title: string;
  description: string;
  priority: string;
}

// Notification - matches backend notification model
export interface Notification {
  id: string;
  user: string; // UUID of the user
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// Event - matches backend event model
export interface Event {
  id: string;
  fair: string; // UUID of the career fair
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  type: string;
  company?: string; // UUID of the company
  max_attendees?: number;
  created_at: string;
  updated_at: string;
}

// Event Registration - matches backend event registration model
export interface EventRegistration {
  id: string;
  event: string; // UUID of the event
  user: string; // UUID of the user
  registered_at: string;
  attended_at?: string;
}

// Follow Up - matches backend follow up model
export interface FollowUp {
  id: string;
  user: string; // UUID of the user
  company: string; // UUID of the company
  contact: string;
  position: string;
  message: string;
  scheduled_date: string;
  status: string;
  response?: string;
  created_at: string;
  updated_at: string;
}

// Note - matches backend note model
export interface Note {
  id: string;
  user: string; // UUID of the user
  title: string;
  content: string;
  type: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// Team Member - matches backend team member model
export interface TeamMember {
  id: string;
  company: string; // UUID of the company
  user: string; // UUID of the user
  role: string;
  department: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Company Join Request - matches backend accounts.models.CompanyJoinRequest
export interface CompanyJoinRequest {
  id: string;
  user: string; // UUID of the user
  company: string; // UUID of the company
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

// University Join Request - matches backend accounts.models.UniversityJoinRequest
export interface UniversityJoinRequest {
  id: string;
  user: string; // UUID of the user
  university: string; // UUID of the university
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

// Employer Feedback - matches backend feedback model
export interface EmployerFeedback {
  id: string;
  fair: string; // UUID of the career fair
  employer: string; // UUID of the employer
  overall_rating: number;
  student_quality: number;
  organization: number;
  facilities: number;
  comments: string;
  created_at: string;
  updated_at: string;
} 