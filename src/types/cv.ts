
// This file defines the types related to Resumes (formerly CVs).
// The Resume model is defined in the `accounts` app on the backend.

export interface Resume {
  id: string;
  student_profile: string; // The user's student profile ID
  file_url: string;
  file_name: string;
  is_primary: boolean;
  uploaded_at: string;
  
  // AI-related fields
  parsed_text: string;
  is_parsed: boolean;
  embedding?: number[]; // Embedding might not always be sent to the frontend
} 