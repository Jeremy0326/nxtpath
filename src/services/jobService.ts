import api from '../lib/axios';
import type { Job, Skill } from '../types/job';
import { PaginatedResponse } from '../types';
import type { GroupedMatchReport } from '../types';

export interface JobSearchParams {
  search?: string;
  keyword?: string; // Add keyword property for direct search input
  job_type?: string[] | string;
  experience?: string[] | string;
  salary_min?: number;
  salary_max?: number;
  location?: string;
  skills?: string[];
  industry?: string;
  remote?: boolean;
  sort_by?: 'recent' | 'match' | 'salary-asc' | 'salary-desc';
  page?: number;
  page_size?: number;
  pageSize?: number; // camelCase alias for UI compatibility
  company_size?: string;
  remote_option?: string;
}

export type PaginatedJobsResponse = PaginatedResponse<Job>;

export interface MatchDetails {
  skills: {
    score: number;
    description: string;
    matches: string[];
    gaps: string[];
  };
  experience: {
    score: number;
    description: string;
    matches: string[];
    gaps: string[];
  };
  education: {
    score: number;
    description: string;
    matches: string[];
    gaps: string[];
  };
  overall_score: number;
}

export interface MatchingWeightage {
  skill_weight: number;
  experience_weight: number;
  education_weight: number;
}

class JobService {
  async getSkills(): Promise<Skill[]> {
    const response = await api.get('skills/');
    return response.data;
  }

  async getJobs(params?: { page?: number; search?: string }): Promise<PaginatedJobsResponse> {
    const response = await api.get('jobs/', { params });
    return response.data;
  }

  async getJob(id: string): Promise<Job> {
    const response = await api.get(`jobs/${id}/`);
    return response.data;
  }

  async getJobById(id: string): Promise<Job> {
    return this.getJob(id);
  }

  async getEmployerJobs(params?: { status?: string; page?: number; search?: string }): Promise<PaginatedJobsResponse> {
    const response = await api.get('employer/jobs/', { params });
    return response.data;
  }

  async createJob(jobData: Partial<Job>): Promise<Job> {
    const response = await api.post('employer/jobs/', jobData);
    return response.data;
  }

  async updateJob(jobId: string, jobData: Partial<Job>): Promise<Job> {
    const response = await api.put(`employer/jobs/${jobId}/`, jobData);
    return response.data;
  }

  async deleteJob(jobId: string): Promise<void> {
    await api.delete(`employer/jobs/${jobId}/`);
  }

  async getJobApplicants(jobId: string): Promise<any[]> {
    const response = await api.get(`employer/jobs/${jobId}/applicants/`);
    return response.data;
  }

  async getJobWeightage(jobId: string): Promise<MatchingWeightage> {
    const response = await api.get(`jobs/${jobId}/weightage/`);
    return response.data;
  }

  async updateJobWeightage(jobId: string, weightage: MatchingWeightage): Promise<MatchingWeightage> {
    const response = await api.put(`jobs/${jobId}/weightage/`, weightage);
    return response.data;
  }

  async getCompanyWeightage(companyId: string): Promise<MatchingWeightage> {
    const response = await api.get(`companies/${companyId}/weightage/`);
    return response.data;
  }

  async updateCompanyWeightage(companyId: string, weightage: MatchingWeightage): Promise<MatchingWeightage> {
    const response = await api.put(`companies/${companyId}/weightage/`, weightage);
    return response.data;
  }

  async getJobMatchDetails(jobId: string): Promise<MatchDetails> {
    const response = await api.get(`jobs/${jobId}/ai-match/`);
    return response.data;
  }

  async saveJob(jobId: string): Promise<void> {
    await api.post(`jobs/${jobId}/save/`);
  }

  async unsaveJob(jobId: string): Promise<void> {
    await api.delete(`jobs/${jobId}/save/`);
  }

  async applyForJob(jobId: string, cvId: string): Promise<void> {
    await api.post(`jobs/${jobId}/apply/`, { cv_id: cvId });
  }

  async withdrawApplication(applicationId: string): Promise<void> {
    await api.delete(`applications/${applicationId}/`);
  }

  async refreshJobApplicationStatus(jobId: string): Promise<{ isApplied: boolean; status?: string; applied_date?: string }> {
    try {
      const response = await api.get(`jobs/${jobId}/application-status/`);
      return response.data;
    } catch (error) {
      console.error(`Error refreshing application status for job ${jobId}:`, error);
      return { isApplied: false };
    }
  }

  async getSavedJobs(): Promise<PaginatedJobsResponse> {
      const response = await api.get('jobs/saved/');
    return response.data;
  }

  async getAppliedJobs(): Promise<PaginatedResponse<any>> {
    const response = await api.get('my-applications/');
    return response.data;
    }

  async checkSavedStatus(jobId: string): Promise<boolean> {
    try {
      const response = await api.get(`jobs/${jobId}/save/`);
      return response.data?.isSaved || false;
    } catch (error) {
      console.error(`Failed to check saved status for job ${jobId}:`, error);
      return false;
    }
  }

  async checkApplicationStatus(jobId: string): Promise<{ isApplied: boolean; status?: string; applied_date?: string }> {
    try {
      const response = await api.get(`jobs/${jobId}/application-status/`);
      return response.data;
    } catch (error) {
      console.error(`Error checking application status for job ${jobId}:`, error);
      return { isApplied: false };
    }
  }

  async searchJobs(params: JobSearchParams): Promise<PaginatedJobsResponse> {
    const response = await api.get('jobs/', { params });
    return response.data;
  }

  async vectorSearchJobs(params: JobSearchParams): Promise<PaginatedJobsResponse> {
    const response = await api.post('jobs/search/vector/', params);
    return response.data;
  }

  async getAnalysisReport(jobId: string, cvId?: string): Promise<GroupedMatchReport> {
    let url = `jobs/${jobId}/analysis/`;
    if (cvId) {
      url += `?cv_id=${encodeURIComponent(cvId)}`;
    }
    const response = await api.get(url);
    return response.data;
  }

  async getAnalysisReportForCandidate(jobId: string, resumeId: string, forceRefresh: boolean = false): Promise<any> {
    const response = await api.get(`employer/jobs/${jobId}/resumes/${resumeId}/analysis/`, {
      params: {
        force_refresh: forceRefresh,
      },
    });
    return response.data;
  }

  async getRecommendedJobs(): Promise<Job[]> {
    const response = await api.get('jobs/recommended/');
    return response.data.results;
  }

  async getJobMatches(limit: number = 10): Promise<Job[]> {
    try {
      const response = await api.get(`jobs/ai-match/`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching job matches:', error);
      throw error;
    }
  }

  async getAIJobMatches(limit: number = 10, forceRefresh: boolean = false): Promise<Job[]> {
      const userToken = localStorage.getItem('access_token');
      const userHash = userToken ? btoa(userToken).substring(0, 10) : 'anonymous';
      const cacheKey = `aiJobMatches_${userHash}_limit_${limit}`;
      const cacheExpiryKey = `${cacheKey}_expiry`;
      const cacheCVKey = `${cacheKey}_cv_id`;
      
      const currentTime = new Date().getTime();
    const cacheDuration = 30 * 60 * 1000; // 30 minutes

    let activeCVId: string | null = null;

      if (!forceRefresh) {
        const cachedData = localStorage.getItem(cacheKey);
        const cacheExpiry = localStorage.getItem(cacheExpiryKey);
        const cachedCVId = localStorage.getItem(cacheCVKey);
        
      if (cachedData && cacheExpiry && currentTime < parseInt(cacheExpiry)) {
        try {
          // Verify if the CV ID is still the same
          const cvResponse = await api.get('cv/active/');
          activeCVId = cvResponse.data?.id;
          if (cachedCVId === activeCVId) {
            console.log('Using cached AI job matches');
            return JSON.parse(cachedData);
          } else {
            console.log('CV changed, clearing AI job match cache');
            this.clearAIJobMatchCache(limit);
          }
        } catch (error) {
          console.error("Error fetching active CV, clearing cache and refetching matches", error);
          this.clearAIJobMatchCache(limit);
        }
        }
      }

      console.log('Fetching fresh AI job matches from server');
      const response = await api.get(`jobs/ai-match/`, {
        params: { 
          limit,
          force_reparse: forceRefresh ? 'true' : 'false'
        }
      });
      
    // After a successful fetch, get the active CV to store in the cache
    try {
      const cvResponse = await api.get('cv/active/');
      activeCVId = cvResponse.data?.id;
    } catch(e) {
      console.warn("Could not fetch active CV to update cache.");
    }
    
    const jobData: Job[] = response.data?.results || response.data || [];
        
        localStorage.setItem(cacheKey, JSON.stringify(jobData));
        localStorage.setItem(cacheExpiryKey, (currentTime + cacheDuration).toString());
    if (activeCVId) {
      localStorage.setItem(cacheCVKey, activeCVId);
      }
      
      return jobData;
  }

  clearAIJobMatchCache(limit: number = 10): void {
    const userToken = localStorage.getItem('access_token');
    const userHash = userToken ? btoa(userToken).substring(0, 10) : 'anonymous';
    const cacheKey = `aiJobMatches_${userHash}_limit_${limit}`;
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(`${cacheKey}_expiry`);
    localStorage.removeItem(`${cacheKey}_cv_id`);
    console.log('Cleared AI job match cache');
  }

  async analyzeCV(cvId?: string): Promise<any> {
    const response = await api.post('cv/analyze/', { cv_id: cvId });
    return response.data;
  }

  async getSingleJobMatch(jobId: string): Promise<Job> {
    const response = await api.get(`jobs/${jobId}/ai-match/`);
    return response.data;
  }

  async getAdvancedJobMatch(jobId: string): Promise<any> {
    const response = await api.get(`jobs/${jobId}/advanced-match/`);
    return response.data;
  }

  // --- AI Interview Endpoints ---
  async startInterview(applicationId: string): Promise<any> {
    const response = await api.post(`/applications/${applicationId}/start-interview/`);
    return response.data;
  }

  async getInterview(applicationId: string): Promise<any> {
    const response = await api.get(`applications/${applicationId}/interview/`);
    return response.data;
  }

  async submitAnswerAndGetNext(
    applicationId: string, 
    answer: { text: string; audio?: Blob }
  ): Promise<any> {
    const formData = new FormData();
    formData.append('text', answer.text);
    if (answer.audio && answer.audio.size > 0) {
      formData.append('audio', answer.audio, 'interview_answer.webm');
    }
    // Remove any leading '/api' from the path
    const response = await api.post(
      `applications/${applicationId}/submit-answer/`, 
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  async generateInterviewReport(applicationId: string): Promise<any> {
    const response = await api.post(`applications/${applicationId}/generate-ai-interview-report/`);
    return response.data;
  }

  async getInterviewReport(applicationId: string): Promise<any> {
    // Always use the new endpoint for AI interview reports
    const url = `applications/${applicationId}/ai-interview-report/`;
    const response = await api.get(url);
    // Flatten all fields for frontend
    if (response.data) {
      return {
        id: response.data.id,
        summary: response.data.report_data?.summary,
        strengths: response.data.report_data?.strengths,
        weaknesses: response.data.report_data?.weaknesses,
        fit_score: response.data.report_data?.fit_score,
        culture_fit_score: response.data.report_data?.culture_fit_score,
        communication_score: response.data.report_data?.communication_score,
        technical_depth_score: response.data.report_data?.technical_depth_score,
        suggested_next_step: response.data.report_data?.suggested_next_step,
        rationale: response.data.report_data?.rationale,
        follow_up_questions: response.data.report_data?.follow_up_questions,
        version: response.data.report_version,
        model_name: response.data.model_name,
        overall_score: response.data.overall_score,
        created_at: response.data.created_at,
      };
    }
    return response.data;
  }

  /**
   * Upload an audio file as an answer for the current interview question.
   * @param applicationId - Application UUID
   * @param audioFile - File (Blob)
   * @returns {Promise<{audio_url: string}>}
   */
  async uploadInterviewAudio(applicationId: string, audioFile: File | Blob): Promise<{ audio_url: string }> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    const { data } = await api.post(`/applications/${applicationId}/upload-audio/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  /**
   * Speech-to-Text: Accept an audio file, return transcript.
   * @param applicationId - Application UUID
   * @param audioFile - File (Blob)
   * @returns {Promise<{transcript: string}>}
   */
  async sttInterviewAudio(applicationId: string, audioFile: File | Blob): Promise<{ transcript: string }> {
    console.log('[STT Debug] Audio file details:', {
      type: audioFile.type,
      size: audioFile.size,
      name: audioFile instanceof File ? audioFile.name : 'Blob'
    });

    const formData = new FormData();
    formData.append('audio', audioFile, 'recording.webm');

    try {
      const { data } = await api.post(
        `/applications/${applicationId}/stt/`,
        formData
        // Let Axios handle headers
      );
      console.log('[STT Debug] Success response:', data);
      return data;
    } catch (error: any) {
      console.error('[STT Debug] Error response:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Text-to-Speech: Accept text, return audio file URL.
   * @param applicationId - Application UUID
   * @param text - string
   * @param voice - optional string (Google TTS voice name)
   * @returns {Promise<{audio_url: string}>}
   */
  async ttsInterviewText(applicationId: string, text: string, voice?: string): Promise<{ audio_url: string }> {
    const payload: any = { text };
    if (voice) payload.voice = voice;
    const { data } = await api.post(`/applications/${applicationId}/tts/`, payload);
    return data;
  }
}

export const jobService = new JobService(); 