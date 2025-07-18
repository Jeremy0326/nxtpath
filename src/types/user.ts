import { Skill } from './job';
import { Resume } from './cv';

export interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: 'student' | 'employer' | 'university';
  profile_picture_url?: string;
}

export interface StudentProfile {
  user: User;
  university: string;
  major: string;
  graduation_year: number;
  bio: string;
  interests: string[];
  skills: Skill[];
  social_links: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
  career_preferences: {
    roles: string[];
    industries: string[];
    locations: string[];
  };
  resumes?: Resume[];
}

export interface Candidate extends StudentProfile {
  latest_application?: {
    job_id: string;
    job_title: string;
    status: string;
    applied_at: string;
    match_score?: number;
  };
} 