import { User } from './models';
import { UserRole } from './enums';

// Auth State - matches the state structure in AuthContext
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Login Credentials - matches backend login endpoint
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register Credentials - matches backend register endpoint
export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
  user_type: UserRole;
}

// Re-export User and UserRole for convenience
export type { User } from './models';
export type { UserRole } from './enums'; 