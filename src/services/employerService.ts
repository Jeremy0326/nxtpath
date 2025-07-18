import api from '../lib/axios';
import { Job, Application } from '../types/job';
import { StudentProfile, Candidate } from '../types/user';

interface DashboardStats {
  active_job_posts: number;
  total_applicants: number;
  interviews_scheduled: number;
  new_applicants_weekly: number;
}

interface TopCandidate {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  skills: string[];
  status: string;
  avatar_url: string;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'interview';
  content: string;
  timestamp: string;
}

class EmployerService {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/employer/dashboard-stats/');
    return response.data;
  }

  async getTopCandidates(): Promise<TopCandidate[]> {
    const response = await api.get('/employer/top-candidates/');
    return response.data;
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    const response = await api.get('/employer/recent-activity/');
    return response.data;
  }

  async getEmployerJobs(params: { status?: string, search?: string }): Promise<{ results: Job[] }> {
    const response = await api.get('/employer/jobs/', { params });
    return response.data;
  }

  async getJobApplicants(jobId: string): Promise<Application[]> {
    const response = await api.get(`/employer/jobs/${jobId}/applicants/`);
    return response.data;
  }

  async createJob(jobData: Partial<Job>): Promise<Job> {
    const response = await api.post('/employer/jobs/', jobData);
    return response.data;
  }

  async updateJob(jobId: string, jobData: Partial<Job>): Promise<Job> {
    const response = await api.put(`/employer/jobs/${jobId}/`, jobData);
    return response.data;
  }

  async deleteJob(jobId: string): Promise<void> {
    await api.delete(`/employer/jobs/${jobId}/`);
  }

  async updateJobWeightage(jobId: string, weights: { skills: number, experience: number, education: number }): Promise<void> {
    await api.put(`/employer/jobs/${jobId}/weightage/`, { matching_weights: weights });
  }

  async getCandidateProfile(candidateId: string): Promise<StudentProfile> {
    const response = await api.get(`/employer/candidates/${candidateId}/`);
    return response.data;
  }

  async searchResumes(params: { search?: string, major?: string, university?: string }): Promise<StudentProfile[]> {
    const response = await api.get('/employer/resume-bank/', { params });
    return response.data;
  }

  async getAllCandidates(params: { search?: string, status?: string, job_id?: string }): Promise<Candidate[]> {
    const response = await api.get('/employer/candidates/', { params });
    return response.data;
  }

  async updateCandidateStatus(candidateId: string, status: string, jobId?: string): Promise<void> {
    await api.patch(`/employer/candidates/${candidateId}/`, { status, job_id: jobId });
  }
}

export const employerService = new EmployerService(); 