// Enums and Status Types
// Centralized location for all enums that should match backend schema exactly

// Application Status - matches backend Application.Status choices
export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  INTERVIEWED = 'INTERVIEWED',
  OFFERED = 'OFFERED',
  REJECTED = 'REJECTED'
}

// Job Status - matches backend Job model
export enum JobStatus {
  ACTIVE = 'active', // is_active field
  INACTIVE = 'inactive'
}

// Interview Status - matches backend AIInterview.Status choices
export enum InterviewStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

// Career Fair Status - matches backend CareerFair model
export enum CareerFairStatus {
  ACTIVE = 'active', // is_active field
  INACTIVE = 'inactive'
}

// Career Fair Type - matches backend CareerFair model
export enum CareerFairType {
  VIRTUAL = 'virtual',
  PHYSICAL = 'physical',
  HYBRID = 'hybrid'
}

// User Roles - matches backend User.UserType choices
export enum UserRole {
  STUDENT = 'student',
  EMPLOYER = 'employer',
  UNIVERSITY = 'university',
  ADMIN = 'admin'
}

// Job Type - matches backend Job.JobType choices
export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  TEMPORARY = 'TEMPORARY'
}

// Remote Option - matches backend Job.RemoteOption choices
export enum RemoteOption {
  ON_SITE = 'ON_SITE',
  HYBRID = 'HYBRID',
  REMOTE = 'REMOTE'
}

// Experience Level - matches backend Job model
export enum ExperienceLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  EXECUTIVE = 'executive'
}

// Company Size - matches backend Company.CompanySize choices
export enum CompanySize {
  SEED = 'SEED',
  STARTUP = 'STARTUP',
  SCALEUP = 'SCALEUP',
  MID_SIZE = 'MID_SIZE',
  LARGE = 'LARGE',
  ENTERPRISE = 'ENTERPRISE'
}

// Industry Types - matches backend Company model
export enum Industry {
  TECHNOLOGY = 'technology',
  HEALTHCARE = 'healthcare',
  FINANCE = 'finance',
  EDUCATION = 'education',
  RETAIL = 'retail',
  MANUFACTURING = 'manufacturing',
  CONSULTING = 'consulting',
  MEDIA = 'media',
  REAL_ESTATE = 'real_estate',
  TRANSPORTATION = 'transportation',
  ENERGY = 'energy',
  GOVERNMENT = 'government',
  NON_PROFIT = 'non_profit',
  OTHER = 'other'
}

// Notification Type - matches backend Notification model
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

// Impact Level - matches backend analysis models
export enum ImpactLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// Match Level - matches backend analysis models
export enum MatchLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  MODERATE = 'moderate',
  POOR = 'poor'
}

// Priority Level - matches backend analysis models
export enum PriorityLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// Theme Type - matches frontend settings
export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

// Email Frequency - matches frontend settings
export enum EmailFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  NEVER = 'never'
}

// Privacy Level - matches frontend settings
export enum PrivacyLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  CONNECTIONS = 'connections'
}

// File Upload Type - matches backend file uploads
export enum FileUploadType {
  RESUME = 'resume',
  PROFILE_PICTURE = 'profile_picture',
  COMPANY_LOGO = 'company_logo',
  INTERVIEW_AUDIO = 'interview_audio'
}

// Interview Type - matches backend AIInterview model
export enum InterviewType {
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  CASE_STUDY = 'case_study',
  CODING = 'coding',
  SYSTEM_DESIGN = 'system_design'
}

// Booth Booking Status - matches backend BoothBooking model
export enum BoothBookingStatus {
  BOOKED = 'booked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

// Career Fair Registration Status - matches backend CareerFairRegistration model
export enum RegistrationStatus {
  REGISTERED = 'registered',
  ATTENDED = 'attended',
  NO_SHOW = 'no_show',
  CANCELLED = 'cancelled'
}

// Sort Options - matches frontend job search
export enum SortOption {
  RECENT = 'recent',
  MATCH = 'match',
  SALARY_ASC = 'salary_asc',
  SALARY_DESC = 'salary_desc',
  TITLE = 'title',
  COMPANY = 'company',
  LOCATION = 'location'
}

// Event Type - matches backend Event model
export enum EventType {
  PRESENTATION = 'presentation',
  WORKSHOP = 'workshop',
  NETWORKING = 'networking',
  BREAK = 'break',
  COMPANY = 'company'
}

// Risk Flag Type - matches backend analysis models
export enum RiskFlagType {
  HARD_FILTER = 'hard_filter',
  POTENTIAL_RISK = 'potential_risk',
  SOFT_RISK = 'soft_risk'
}

// Opportunity Flag Type - matches backend analysis models
export enum OpportunityFlagType {
  UNIQUE_STRENGTH = 'unique_strength',
  GROWTH_POTENTIAL = 'growth_potential',
  DIVERSITY = 'diversity'
}

// Career Insight Type - matches backend analysis models
export enum CareerInsightType {
  STRENGTH = 'strength',
  IMPROVEMENT = 'improvement',
  OPPORTUNITY = 'opportunity',
  WARNING = 'warning',
  GAP = 'gap'
}

// Recommendation Category - matches backend analysis models
export enum RecommendationCategory {
  SKILL_DEVELOPMENT = 'skill_development',
  EXPERIENCE = 'experience',
  NETWORKING = 'networking',
  APPLICATION = 'application'
}

// Preference Type - matches backend analysis models
export enum PreferenceType {
  INDUSTRY = 'industry',
  LOCATION = 'location',
  WORK_TYPE = 'work_type',
  ROLE = 'role'
}

// Follow Up Status - matches backend FollowUp model
export enum FollowUpStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENT = 'sent',
  RESPONDED = 'responded'
}

// Note Type - matches backend Note model
export enum NoteType {
  GENERAL = 'general',
  INTERVIEW = 'interview',
  FEEDBACK = 'feedback',
  REMINDER = 'reminder'
}

// Request Status - matches backend CompanyJoinRequest and UniversityJoinRequest
export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Interview Speaker - matches backend InterviewUtterance.Speaker choices
export enum InterviewSpeaker {
  AI = 'AI',
  CANDIDATE = 'CANDIDATE'
} 