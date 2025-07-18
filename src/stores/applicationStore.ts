import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { jobService } from '../services/jobService';
import type { Application } from '../types/job';

interface ApplicationState {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
  withdrawingIds: Set<string>;
  fetchApplications: () => Promise<void>;
  withdrawApplication: (applicationId: string) => Promise<void>;
  setApplications: (applications: Application[]) => void;
}

export const useApplicationStore = create<ApplicationState>()(
  devtools((set, get) => ({
    applications: [],
    isLoading: false,
    error: null,
    withdrawingIds: new Set(),

    fetchApplications: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await jobService.getAppliedJobs();
        const applications = Array.isArray(response) ? response : (response?.results || []);
        set({ applications, isLoading: false });
      } catch (err: any) {
        console.error('Failed to fetch applications:', err);
        if (err?.response?.status === 401) {
          set({ error: 'Session expired. Please log in again.', isLoading: false });
          // Optionally, redirect to login:
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              window.location.href = '/login';
            }, 1500);
          }
        } else {
          set({ error: 'Failed to fetch applications', isLoading: false });
        }
      }
    },

    withdrawApplication: async (applicationId: string) => {
      const { withdrawingIds } = get();
      if (withdrawingIds.has(applicationId)) return;

      set(state => ({
        withdrawingIds: new Set([...state.withdrawingIds, applicationId])
      }));

      try {
        await jobService.withdrawApplication(applicationId);
        // Update the application status locally
        set(state => ({
          applications: state.applications.filter(app => app.id !== applicationId),
          withdrawingIds: new Set([...state.withdrawingIds].filter(id => id !== applicationId))
        }));
      } catch (err) {
        console.error('Failed to withdraw application:', err);
        set(state => ({
          withdrawingIds: new Set([...state.withdrawingIds].filter(id => id !== applicationId))
        }));
        throw err;
      }
    },

    setApplications: (applications: Application[]) => set({ applications }),
  }))
); 