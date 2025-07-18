import api from '../lib/axios';
import type { CVAnalysisResult } from '../types/cv';
import axios from 'axios';
import type { MatchDetails } from './jobService';

export const cvAnalysisService = {
  async uploadCV(file: File): Promise<CVAnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);

    try {
      const response = await api.post('cv/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
      return response.data;
    } catch (error) {
      console.error('Error uploading CV:', error);
      throw error;
    }
  },

  async analyzeCV(cvId: string): Promise<CVAnalysisResult> {
    try {
      const response = await api.get(`cv/${cvId}/analyze/`);
      return response.data;
    } catch (error) {
      console.error('Error analyzing CV:', error);
      throw error;
    }
  },
  
  async getUserCV(): Promise<{ id: string; file_name: string; file_url: string; analysis: CVAnalysisResult } | null> {
    try {
      const response = await api.get('cv/active/');
    return response.data;
    } catch (error) {
      // If 404, the user doesn't have an active CV
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching user CV:', error);
      throw error;
    }
  },
  
  async deleteCV(cvId: string): Promise<void> {
    try {
      await api.delete(`cv/${cvId}/`);
    } catch (error) {
      console.error('Error deleting CV:', error);
      throw error;
    }
  },

  async matchWithJob(cvId: string, jobId: string): Promise<CVAnalysisResult> {
    const response = await api.post('cv/match', {
      cvId,
      jobId,
    });

    return response.data;
  },

  async getAnalysis(cvId: string): Promise<CVAnalysisResult> {
    const response = await api.get(`cv/analysis/${cvId}`);
    return response.data;
  },

  async updateAnalysis(cvId: string, data: Partial<CVAnalysisResult>): Promise<CVAnalysisResult> {
    const response = await api.put(`cv/analysis/${cvId}`, data);
    return response.data;
  },
}; 