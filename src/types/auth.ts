export type UserRole = 'student' | 'university' | 'employer';

export interface User {
  id: string;
  email: string;
  user_type: 'student' | 'employer' | 'university' | 'admin';
  full_name?: string;
  profile_picture_url?: string;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  student_profile?: StudentProfile;
  employer_profile?: EmployerProfile;
  university_staff_profile?: UniversityStaffProfile;
}

export interface University {
  id: string;
  name: string;
  location: string;
  logo_url: string | null;
  website: string | null;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  website: string | null;
  industry: string;
  location: string;
  size: string;
  social_links: Record<string, string>;
  gallery_urls: string[];
}

export interface StudentProfile {
  user: string; // user id
  university?: string | null; // university id
  major?: string;
  graduation_year?: number;
  gpa?: number;
  skills?: string[];
  interests?: string[];
  career_preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface EmployerProfile {
  user: string; // user id
  company: string; // company id
  role: string;
  is_company_admin: boolean;
}

export interface UniversityStaffProfile {
  user: string; // user id
  university: string; // university id
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
} 