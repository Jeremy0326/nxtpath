// Interview Types
// Centralized location for all interview-related types

// Web Speech API Types
export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Interview Question Types (Frontend-specific)
export interface FrontendInterviewQuestion {
  question_text: string;
  type: string;
  order?: number;
  id?: string;
}

export interface AIInterviewSession {
  id: string;
  questions: FrontendInterviewQuestion[];
  application_id?: string;
  status?: string;
  started_at?: string;
}

export interface FrontendInterviewAnswer {
  text: string;
  audio_url?: string;
  audio?: Blob; // Allow sending audio blob to the backend
  question_id?: string;
  created_at?: string;
}

// Interview Flow Types
export interface InterviewStep {
  step: 'preinterview' | 'loading' | 'session' | 'error' | 'complete';
  session?: AIInterviewSession | null;
  error?: string | null;
  currentQuestionIndex?: number;
  answers?: FrontendInterviewAnswer[];
}

// Interview UI Types
export interface InterviewUIState {
  isRecording: boolean;
  isProcessing: boolean;
  isSubmitting: boolean;
  isListening: boolean;
  timer: number;
  liveTranscript: string;
  showExitConfirm: boolean;
  showPostInterviewModal: boolean;
}

// Interview Audio Types
export interface AudioRecordingState {
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  isRecording: boolean;
  audioUrl?: string;
}

// Interview Report Types
export interface InterviewReportData {
  id: string;
  interview_id: string;
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

// Interview Settings Types
export interface InterviewSettings {
  enableAudioRecording: boolean;
  enableSpeechRecognition: boolean;
  enableTTS: boolean;
  maxRecordingTime: number;
  questionTimeLimit?: number;
  allowRetakes: boolean;
}

// Interview Feedback Types
export interface InterviewFeedback {
  question_id: string;
  feedback: string;
  score: number;
  suggestions: string[];
}

// Interview Session Types
export interface InterviewSessionData {
  session_id: string;
  application_id: string;
  questions: FrontendInterviewQuestion[];
  current_question: number;
  total_questions: number;
  time_elapsed: number;
  status: string;
}

// Interview Completion Types
export interface InterviewCompletionData {
  session_id: string;
  application_id: string;
  total_questions: number;
  answered_questions: number;
  time_taken: number;
  completion_date: string;
}

// Interview Error Types
export interface InterviewError {
  type: 'network' | 'audio' | 'permission' | 'server' | 'unknown';
  message: string;
  details?: string;
  retryable: boolean;
}

// Interview Analytics Types
export interface InterviewAnalytics {
  session_id: string;
  total_time: number;
  questions_answered: number;
  average_response_time: number;
  audio_quality_score?: number;
  speech_recognition_accuracy?: number;
  completion_rate: number;
} 