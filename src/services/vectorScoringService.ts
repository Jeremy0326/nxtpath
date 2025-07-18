import api from '../lib/axios';

export interface VectorJobMatch {
  job_id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logo_url?: string;
  };
  location: string;
  type: string;
  salary_min?: number;
  salary_max?: number;
  vector_score: number;
  score_type: 'vector';
  posted_date?: string;
}

export interface TopJobMatch extends VectorJobMatch {
  description_snippet: string;
  key_skills: string[];
  match_confidence: string;
  requirements_snippet: string;
}

export interface VectorScoringResponse {
  success: boolean;
  cv_id: string;
  total_jobs: number;
  jobs: VectorJobMatch[];
}

export interface TopMatchesResponse {
  success: boolean;
  cv_id: string;
  total_matches: number;
  top_matches: TopJobMatch[];
}

export interface SingleJobScoreResponse {
  job_id: string;
  cv_id: string;
  vector_score: number;
  confidence: string;
}

class VectorScoringService {
  /**
   * Get vector-based scores for multiple jobs
   */
  async getJobScores(limit: number = 10, jobIds?: string[]): Promise<VectorJobMatch[]> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      
      if (jobIds) {
        jobIds.forEach(id => params.append('job_ids', id));
      }

      const response = await api.get<VectorScoringResponse>(`/jobs/vector-scores/?${params.toString()}`);
      return response.data.jobs;
    } catch (error) {
      console.error('Failed to fetch job vector scores:', error);
      throw error;
    }
  }

  /**
   * Get vector score for a single job, optionally for a specific CV
   */
  async getSingleJobScore(jobId: string, cvId?: string): Promise<SingleJobScoreResponse> {
    try {
      let url = `/jobs/${jobId}/vector-score/`;
      if (cvId) {
        url += `?cv_id=${encodeURIComponent(cvId)}`;
      }
      const response = await api.get<SingleJobScoreResponse>(url);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch vector score for job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Get top job matches with enhanced metadata
   */
  async getTopMatches(limit: number = 5): Promise<TopJobMatch[]> {
    try {
      const response = await api.get<TopMatchesResponse>(`/jobs/top-matches/?limit=${limit}`);
      return response.data.top_matches;
    } catch (error) {
      console.error('Failed to fetch top job matches:', error);
      throw error;
    }
  }

  /**
   * Batch fetch scores for a list of job IDs
   */
  async batchGetJobScores(jobIds: string[]): Promise<Record<string, number>> {
    try {
      const jobs = await this.getJobScores(jobIds.length, jobIds);
      const scores: Record<string, number> = {};
      
      jobs.forEach(job => {
        scores[job.job_id] = job.vector_score;
      });
      
      return scores;
    } catch (error) {
      console.error('Failed to batch fetch job scores:', error);
      return {};
    }
  }

  /**
   * Get confidence level text based on score
   */
  getConfidenceLevel(score: number): string {
    if (score >= 70) return "High";
    if (score >= 50) return "Medium";
    if (score >= 30) return "Low";
    return "Very Low";
  }

  /**
   * Get score color class for UI
   */
  getScoreColorClass(score: number): string {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    if (score >= 30) return "text-orange-600";
    return "text-red-600";
  }

  /**
   * Get score background color class for UI
   */
  getScoreBgColorClass(score: number): string {
    if (score >= 70) return "bg-green-100";
    if (score >= 50) return "bg-yellow-100";
    if (score >= 30) return "bg-orange-100";
    return "bg-red-100";
  }

  /**
   * Get match label based on score
   */
  getMatchLabel(score: number): string {
    if (score >= 70) return "Excellent Match";
    if (score >= 50) return "Good Match";
    if (score >= 30) return "Fair Match";
    return "Poor Match";
  }
}

export const vectorScoringService = new VectorScoringService(); 