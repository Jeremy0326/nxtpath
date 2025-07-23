import api from '../lib/axios';
import type { CareerPreferences } from '../types/models';

export interface UniversityDashboardStats {
  totalGraduates: number;
  employmentRate: number;
  averageSalary: number;
  topCompanies: number;
  employmentTrend: Array<{
    month: string;
    rate: number;
  }>;
  topEmployers: Array<{
    name: string;
    hires: number;
    satisfaction: number;
  }>;
  skillGaps: Array<{
    skill: string;
    gap: number;
    demand: number;
  }>;
}

export interface CareerFair {
  id: string;
  name: string;
  title?: string;
  date: string;
  status: string;
  registeredEmployers: number;
  registeredStudents: number;
  totalApplications: number;
  description?: string;
  location?: string;
  website?: string;
  bannerImageUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface FairDetails extends CareerFair {
  description: string;
  location: string;
  website: string;
  bannerImageUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  gridWidth?: number;
  gridHeight?: number;
}

export interface Booth {
  id: string;
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  booth_number?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  jobs: Array<{
    id: string;
    title: string;
  }>;
}

export interface Registration {
  id: string;
  type: 'employer' | 'student';
  name: string;
  email: string;
  registrationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  company?: string;
  boothNumber?: string;
}

export interface AIInsights {
  totalReports: number;
  topSkills: Array<{
    skill: string;
    students: number;
    averageScore: number;
  }>;
  careerPaths: Array<{
    path: string;
    students: number;
  }>;
  salaryStats: {
    average: number;
    min: number;
    max: number;
    distribution: Array<{
      range: string;
      count: number;
    }>;
  };
  skillGaps: Array<{
    skill: string;
    demand: number;
    supply: number;
    gap: number;
  }>;
}

export type Resume = {
  id: string;
  file_url: string;
  file_name?: string;
  is_primary: boolean;
};

export interface Student {
  id: string;
  name: string;
  email: string;
  major: string;
  graduationYear: string;
  aiMatchScore: number;
  lastActive: string;
  skills?: string[];
  bio?: string;
  interests?: string[];
  resumes?: Resume[];
  profile_picture_url?: string;
  social_links?: Record<string, string>;
  career_preferences?: CareerPreferences;
  university?: string;
  graduation_year?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  lastActive: string;
}

export interface StudentInterest {
  id: string;
  booth_id: string;
  company_name: string;
  booth_number: string;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  timestamp: string;
}

class UniversityService {
  async getDashboardStats(): Promise<UniversityDashboardStats> {
    const response = await api.get('/university/dashboard-stats/');
    return response.data;
  }

  async getCareerFairs(): Promise<CareerFair[]> {
    const response = await api.get('/university/career-fairs/');
    return response.data;
  }

  async getCareerFairDetails(fairId: string): Promise<FairDetails> {
    const response = await api.get(`/career-fairs/fairs/${fairId}/`);
    return response.data;
  }

  async updateCareerFair(fairId: string, fairData: Partial<FairDetails>): Promise<FairDetails> {
    const response = await api.put(`/career-fairs/fairs/${fairId}/`, fairData);
    return response.data;
  }

  async deleteCareerFair(fairId: string): Promise<void> {
    await api.delete(`/career-fairs/fairs/${fairId}/`);
  }

  async getFairBooths(fairId: string): Promise<Booth[]> {
    const response = await api.get(`/career-fairs/fairs/${fairId}/booths/`);
    return response.data;
  }

  async getFairRegistrations(fairId: string): Promise<Registration[]> {
    const response = await api.get(`/career-fairs/fairs/${fairId}/registrations/`);
    return response.data;
  }

  async getFairReports(fairId: string): Promise<any> {
    const response = await api.get(`/career-fairs/fairs/${fairId}/reports/`);
    return response.data;
  }

  async getFairAnalytics(fairId: string): Promise<any> {
    const response = await api.get(`/career-fairs/fairs/${fairId}/analytics/`);
    return response.data;
  }

  async createCareerFair(fairData: { name: string; date: string; location: string }): Promise<CareerFair> {
    console.log('Creating career fair with data:', fairData);
    const response = await api.post('/university/career-fairs/', {
      title: fairData.name,
      start_date: fairData.date,
      end_date: fairData.date, // For now, single-day events
      location: fairData.location,
      description: `Career fair organized by the university on ${fairData.date}`,
      is_active: true
    });
    console.log('Career fair creation response:', response.data);
    return response.data;
  }

  async getAIInsights(): Promise<AIInsights> {
    const response = await api.get('/university/ai-insights/');
    return response.data;
  }

  async getStudents(): Promise<Student[]> {
    const response = await api.get('/university/students/');
    return response.data;
  }

  async getStaff(): Promise<StaffMember[]> {
    const response = await api.get('/university/staff/');
    return response.data;
  }

  async updateBooth(boothId: string, boothData: Partial<Booth>): Promise<Booth> {
    const response = await api.put(`/career-fairs/booths/${boothId}/`, boothData);
    return response.data;
  }

  async assignBoothPosition(boothId: string, position: { x: number; y: number; boothNumber?: string }): Promise<Booth> {
    const response = await api.patch(`/career-fairs/booths/${boothId}/`, {
      x: position.x,
      y: position.y,
      booth_number: position.boothNumber
    });
    return response.data;
  }

  async approveRegistration(registrationId: string): Promise<void> {
    await api.post(`/career-fairs/registrations/${registrationId}/approve/`);
  }

  async rejectRegistration(registrationId: string): Promise<void> {
    await api.post(`/career-fairs/registrations/${registrationId}/reject/`);
  }

  // Student Interest Management
  async expressInterest(fairId: string, boothId: string): Promise<StudentInterest> {
    const response = await api.post(`/career-fairs/fairs/${fairId}/express_interest/`, {
      booth_id: boothId
    });
    return response.data;
  }

  async removeInterest(fairId: string, boothId: string): Promise<void> {
    await api.delete(`/career-fairs/fairs/${fairId}/remove_interest/`, {
      data: { booth_id: boothId }
    });
  }

  async getMyInterests(fairId: string): Promise<StudentInterest[]> {
    const response = await api.get(`/career-fairs/fairs/${fairId}/my_interests/`);
    return response.data;
  }

  async getBoothInterests(fairId: string): Promise<StudentInterest[]> {
    const response = await api.get(`/career-fairs/fairs/${fairId}/booth_interests/`);
    return response.data;
  }
}

export const universityService = new UniversityService();