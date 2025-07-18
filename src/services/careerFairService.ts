import api from '../lib/axios';
import { CareerFair, PaginatedFairsResponse } from '../types/career-fair';
import { Booth } from '../types/career-fair';

class CareerFairService {
  async getFairs(params?: { search?: string }): Promise<PaginatedFairsResponse> {
    const response = await api.get('/career-fairs/fairs/', { params });
    return response.data;
  }

  async getDiscoverableFairs(params?: { search?: string }): Promise<PaginatedFairsResponse> {
    const response = await api.get('/career-fairs/discover/', { params });
    return response.data;
  }

  async registerForFair(fairId: string): Promise<void> {
    await api.post(`/career-fairs/fairs/${fairId}/register/`);
  }

  async unregisterFromFair(fairId: string): Promise<void> {
    await api.post(`/career-fairs/fairs/${fairId}/unregister/`);
  }

  async getFairDetails(fairId: string): Promise<CareerFair> {
    const response = await api.get(`/career-fairs/fairs/${fairId}/`);
    return response.data;
  }

  async getEmployerFairs(params?: { search?: string }): Promise<PaginatedFairsResponse> {
    const response = await api.get('/career-fairs/employer-fairs/', { params });
    return response.data;
  }

  async getBoothDetails(boothId: string): Promise<Booth> {
    const response = await api.get(`/career-fairs/booths/${boothId}/`);
    return response.data;
  }

  async updateBooth(boothId: string, data: { label?: string, job_ids?: string[] }): Promise<Booth> {
    const response = await api.patch(`/career-fairs/booths/${boothId}/`, data);
    return response.data;
  }

  async createBooth(fairId: string): Promise<Booth> {
    // Use the new create_booth endpoint which handles both creation and existing booth retrieval
    const response = await api.post(`/career-fairs/fairs/${fairId}/create_booth/`);
    return response.data;
  }
}

export const careerFairService = new CareerFairService(); 
 
 
 
 
 
 
 
 
 
 
 