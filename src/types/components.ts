// Component Prop Interfaces
// Only UI component props - no backend models

// Common UI Components
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onImageUpload: (file: File) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface TagsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export interface TabProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

// Job Components
export interface JobCardProps {
  job: any;
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  onUnsave?: (jobId: string) => void;
  isSaved?: boolean;
  isApplied?: boolean;
  showActions?: boolean;
  className?: string;
}

export interface EnhancedJobCardProps {
  job: any;
  matchScore?: number;
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  onUnsave?: (jobId: string) => void;
  isSaved?: boolean;
  isApplied?: boolean;
  showActions?: boolean;
  className?: string;
}

export interface JobDetailsProps {
  job: any;
  className?: string;
}

export interface JobDetailsModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  onUnsave?: (jobId: string) => void;
  isSaved?: boolean;
  isApplied?: boolean;
}

export interface JobFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onReset?: () => void;
  className?: string;
}

export interface JobFiltersPanelProps extends JobFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface JobSearchBarProps {
  onSearch: (params: SearchParams) => void;
  placeholder?: string;
  className?: string;
}

export interface SearchParams {
  keyword?: string;
  location?: string;
  jobType?: string;
  experience?: string;
}

export interface JobMatchDetailsModalProps {
  job: any;
  matchDetails: any;
  isOpen: boolean;
  onClose: () => void;
}

export interface AdvancedMatchDetailsProps {
  job: any;
  matchReport: any;
  className?: string;
}

export interface ApplicationConfirmationModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export interface ApplicationSuccessModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onViewApplication?: () => void;
}

export interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  isLoading?: boolean;
}

export interface CandidateMatchReportModalProps {
  candidate: any;
  job: any;
  isOpen: boolean;
  onClose: () => void;
}

export interface JobMatchMatrixProps {
  job: any;
  candidate: any;
  className?: string;
}

export interface SavedJobsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedJobs: any[];
  onRemoveJob?: (jobId: string) => void;
  onApplyJob?: (jobId: string) => void;
}

// Career Fair Components
export interface CompanyCardProps {
  company: any; // Company type from models.ts
  onBookSlot?: (companyId: string) => void;
  onViewDetails?: (companyId: string) => void;
  className?: string;
}

export interface CompanyEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'presentation' | 'workshop' | 'networking';
}

export interface ApplicationsListProps {
  applications: any[];
  onStatusChange?: (applicationId: string, status: string) => void;
  onViewDetails?: (applicationId: string) => void;
  className?: string;
}

export interface FairSelectorProps {
  fairs: any[];
  selectedFair?: string;
  onSelectFair: (fairId: string) => void;
  className?: string;
}

// Frontend CareerFair interface with expanded booths
export interface FrontendCareerFair {
  id: string;
  title: string;
  description?: string;
  host_university: string;
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
  booths?: FrontendBooth[]; // Expanded booths from API
  host?: any; // Full University object from API
}

// Frontend Booth interface with expanded objects
export interface FrontendBooth {
  id: string;
  fair: any; // Full CareerFair object from API
  company: any; // Full Company object from API
  jobs: ExtendedJob[]; // Full Job objects from API
  label?: string;
  booth_number?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}

export interface FairTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  className?: string;
}

export interface FairScheduleProps {
  events: TimeSlot[];
  onEventClick?: (event: TimeSlot) => void;
  className?: string;
}

export interface TimeSlot {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'presentation' | 'workshop' | 'networking' | 'break';
  company?: string;
}

export interface FairItineraryProps {
  events: ItineraryEvent[];
  onEventClick?: (event: ItineraryEvent) => void;
  className?: string;
}

export interface ItineraryEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'company' | 'workshop' | 'networking' | 'break';
  company?: string;
  description?: string;
  isBooked?: boolean;
}

export interface FloorMapProps {
  companies: any[];
  onCompanyClick?: (companyId: string) => void;
  className?: string;
}

export interface FloorPlanProps {
  companies: any[];
  onCompanyClick?: (companyId: string) => void;
  className?: string;
}

export interface JobPositionDetailsProps {
  position: JobPosition;
  onApply?: (positionId: string) => void;
  onClose?: () => void;
  className?: string;
}

export interface JobPosition {
  id: string;
  title: string;
  company: string;
  department: string;
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
}

export interface LiveEventProps {
  event: any;
  onJoin?: () => void;
  onLeave?: () => void;
  className?: string;
}

export interface LiveBoothProps {
  company: any;
  onJoin?: () => void;
  onLeave?: () => void;
  className?: string;
}

export interface PhysicalBoothProps {
  company: any;
  onVisit?: () => void;
  className?: string;
}

export interface NotesAndMaterialsProps {
  notes: any[];
  materials: any[];
  onAddNote?: (note: any) => void;
  onDeleteNote?: (noteId: string) => void;
  onAddMaterial?: (material: any) => void;
  className?: string;
}

export interface FollowUpListProps {
  followUps: any[];
  onSendFollowUp?: (followUpId: string) => void;
  onEditFollowUp?: (followUpId: string) => void;
  onDeleteFollowUp?: (followUpId: string) => void;
  className?: string;
}

export interface FollowUpEmailTemplateProps {
  company: string;
  position: string;
  contact: string;
  onSave?: (template: string) => void;
  className?: string;
}

export interface FairPhaseNavigationProps {
  currentPhase: string;
  phases: string[];
  onPhaseChange: (phase: string) => void;
  className?: string;
}

export interface PhysicalEvent {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  companies: any[];
  attendees: any[];
  boothVisits: BoothVisit[];
}

export interface BoothVisit {
  id: string;
  companyId: string;
  studentId: string;
  visitTime: string;
  duration: number;
  notes?: string;
}

export interface PhysicalFairDashboardProps {
  event: PhysicalEvent;
  onBoothVisit?: (companyId: string) => void;
  className?: string;
}

export interface JobMatchCardProps {
  job: any;
  matchScore: number;
  onApply?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  className?: string;
}

export interface JobMatchingPanelProps {
  jobs: any[];
  onJobClick?: (job: any) => void;
  onApply?: (jobId: string) => void;
  className?: string;
}

export interface ApplicationTrackerProps {
  applications: any[];
  onStatusChange?: (applicationId: string, status: string) => void;
  onViewDetails?: (applicationId: string) => void;
  className?: string;
}

export interface CareerReadinessPanelProps {
  scores: CareerReadinessScore[];
  onImprove?: (category: string) => void;
  className?: string;
}

export interface CareerReadinessScore {
  category: string;
  score: number;
  maxScore: number;
  description: string;
  improvements: string[];
}

export interface SkillsProgressProps {
  skills: any[]; // Skill type from models.ts
  className?: string;
}

// Skill interface moved to models.ts

export interface MatchDetailsProps {
  job: ExtendedJob;
  matchReport: any;
  className?: string;
}

export interface ExtendedJob {
  id: string;
  company: any;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: any[];
  location: string;
  job_type: string;
  remote_option: string;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  is_active: boolean;
  application_deadline?: string;
  created_at: string;
  updated_at: string;
  vector_score?: number;
  ai_match_score?: number;
  applicants_count?: number;
  status?: string;
  matching_weights?: {
    skills?: number;
    experience?: number;
    education?: number;
  };
  matchScore?: number;
  isSaved?: boolean;
  isApplied?: boolean;
  // Additional frontend-specific properties
  overall_score?: number;
  ai_match_report?: any;
  // JobMatchesPage specific properties
  applicationId?: string;
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
  // Additional frontend properties
  posted_at?: string;
  interview_status?: string;
  interview_id?: string;
}

export interface ApplicationCardProps {
  application: any;
  onViewDetails?: (applicationId: string) => void;
  onWithdraw?: (applicationId: string) => void;
  className?: string;
}

// Frontend Application Status (matches UI expectations)
export type FrontendApplicationStatus = 'applied' | 'interviewed' | 'offered' | 'rejected';

// Frontend Application interface with expanded objects for UI
export interface FrontendApplication {
  id: string;
  job: any; // Full Job object from API
  applicant: any; // Full User object from API
  resume?: any; // Full Resume object from API
  status: FrontendApplicationStatus; // Frontend-specific status
  applied_at: string;
  updated_at: string;
  major?: string; // Additional field from API
  ai_match_score?: number; // Additional field from API
}

// Frontend StudentProfile interface with expanded user object
export interface FrontendStudentProfile {
  user: any; // Full User object from API
  university?: string; // UUID of the university
  major?: string;
  graduation_year?: number;
  gpa?: number;
  skills: string[];
  interests: string[];
  career_preferences: any;
  created_at: string;
  updated_at: string;
}

export interface ApplicationStatsProps {
  stats: {
    total: number;
    applied: number;
    underReview: number;
    interview: number;
    offer: number;
    rejected: number;
  };
  className?: string;
}

export interface ApplicationDetailsModalProps {
  application: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (status: string) => void;
}

// Interview Components
export interface InterviewTypeCardProps {
  type: InterviewTypeConfig;
  onSelect: (type: string) => void;
  isSelected?: boolean;
  className?: string;
}

export interface InterviewTypeConfig {
  id: string;
  name: string;
  description: string;
  duration: number;
  questions: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InterviewHistoryProps {
  interviews: InterviewHistory[];
  onViewReport?: (interviewId: string) => void;
  onRetake?: (interviewId: string) => void;
  className?: string;
}

export interface InterviewHistory {
  id: string;
  job: any;
  date: string;
  score: number;
  status: 'completed' | 'in-progress' | 'abandoned';
  duration: number;
}

export interface InterviewReportProps {
  report: AIInterviewReportData;
  className?: string;
}

export interface AIInterviewReportData {
  id: string;
  job: any;
  candidate: any;
  overallScore: number;
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
  completedAt: string;
}

export interface ViewInterviewReportModalProps {
  report: any; // InterviewReportData type from models.ts
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// InterviewReportData interface moved to models.ts

// CV Components
export interface CVUploadProps {
  onUpload: (file: File) => Promise<void>;
  onAnalysisComplete?: (analysis: any) => void;
  className?: string;
}

export interface CurrentCV {
  id: string;
  name: string;
  uploadDate: string;
  isActive: boolean;
}

export interface CVAnalysisResultsProps {
  analysis: any;
  className?: string;
}

// Layout Components
export interface LayoutProps {
  children: React.ReactNode;
}

export interface EmployerLayoutProps {
  children: React.ReactNode;
}

export interface CircularProgressProps {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

// University Components
export interface UniversityStaff {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  expertise: string[];
  availability: string[];
  bio: string;
  imageUrl?: string;
}

export interface DisplayCompany {
  id: string;
  name: string;
  logo: string;
  description: string;
  boothNumber: string;
  positions: any[];
  events: any[];
}

// Team Components
// TeamMember interface moved to models.ts

// Dashboard Components
export interface InfoCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

// Resume Components
export interface CVData {
  id: string;
  name: string;
  uploadDate: string;
  isActive: boolean;
  fileUrl: string;
  analysis?: CVAnalysis;
}

export interface CVAnalysis {
  skills: string[];
  experience: string[];
  education: string[];
  overallScore: number;
  recommendations: string[];
}

export interface ResumeSection {
  id: string;
  type: 'personal' | 'education' | 'experience' | 'skills' | 'projects';
  title: string;
  content: any;
}

export interface AIFeedback {
  type: 'positive' | 'suggestion' | 'warning';
  message: string;
  section?: string;
}

// API Company (for backward compatibility)
export interface ApiCompany {
  id: string;
  name: string;
  logo?: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
}

// Career Fair Components
export interface BookingModalProps {
  company: any;
  isOpen: boolean;
  onClose: () => void;
  onBook: (slot: any) => void;
  availableSlots: any[];
}

export interface OpenPosition {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string[];
  location: string;
  type: 'full-time' | 'part-time' | 'internship';
}

export interface CheckInQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (data: any) => void;
  fairId: string;
}

export interface VirtualBoothProps {
  company: any;
  onJoin?: () => void;
  onLeave?: () => void;
  className?: string;
}

export interface VirtualQueueProps {
  queue: any[];
  position?: number;
  estimatedWait?: number;
  onJoinQueue?: () => void;
  onLeaveQueue?: () => void;
  className?: string;
}

export interface VirtualSession {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: any[];
  maxAttendees: number;
}

export interface VirtualBooth {
  id: string;
  company: any;
  isActive: boolean;
  currentAttendees: number;
  maxAttendees: number;
}

// Notification interface moved to models.ts

export interface PostFairSummaryProps {
  fair: any;
  stats: any;
  onExport?: () => void;
  className?: string;
}

export interface MapLocation {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'booth' | 'entrance' | 'exit' | 'facility';
}

export interface PhysicalFairMapProps {
  locations: MapLocation[];
  onLocationClick?: (location: MapLocation) => void;
  className?: string;
}

export interface FloorMapProps {
  companies: any[];
  onCompanyClick?: (companyId: string) => void;
  className?: string;
}

export interface VirtualFairDashboardProps {
  event: any;
  onBoothJoin?: (boothId: string) => void;
  onSessionJoin?: (sessionId: string) => void;
  className?: string;
}

export interface JobMatchingWeightageProps {
  weights: any;
  onWeightChange: (weights: any) => void;
  className?: string;
}

export interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: any) => void;
  job?: any;
  isLoading?: boolean;
}

export interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
} 