import api from '../lib/axios';
import type { CareerFair, Booth, StudentInterest } from './universityService';

class StudentService {
  async getConnections(): Promise<any[]> {
    const response = await api.get('/employer/connections/');
    return response.data;
  }

  async updateConnection(connectionId: string, action: 'accept' | 'reject'): Promise<any> {
    const response = await api.patch(`/employer/connections/${connectionId}/action/`, {
      action
    });
    return response.data;
  }

  // Career Fair Management for Students
  async getCareerFairs(): Promise<CareerFair[]> {
    const response = await api.get('/career-fairs/fairs/');
    return response.data.results || response.data;
  }

  async getCareerFairDetails(fairId: string): Promise<CareerFair> {
    const response = await api.get(`/career-fairs/fairs/${fairId}/`);
    return response.data;
  }

  async getFairBooths(fairId: string): Promise<Booth[]> {
    const response = await api.get(`/career-fairs/fairs/${fairId}/booths/`);
    return response.data;
  }
  // Student Interest Management
  async expressInterest(fairId: string, boothId: string): Promise<StudentInterest> {
    console.log('studentService.expressInterest called with:', { fairId, boothId });
    const payload = { booth_id: boothId };
    console.log('Sending payload:', payload);
    
    const response = await api.post(`/career-fairs/fairs/${fairId}/express_interest/`, payload);
    console.log('Express interest response:', response.data);
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

  // Get all interests for a student across all fairs
  async getAllMyInterests(): Promise<Record<string, StudentInterest[]>> {
    const fairs = await this.getCareerFairs();
    const interests: Record<string, StudentInterest[]> = {};
    
    for (const fair of fairs) {
      try {
        interests[fair.id] = await this.getMyInterests(fair.id);
      } catch (error) {
        // User might not be authenticated or no interests yet
        interests[fair.id] = [];
      }
    }
    
    return interests;
  }

  async getProfile(): Promise<any> {
    const response = await api.get('/profile/');
    return response.data;
  }
}

export const studentService = new StudentService(); 