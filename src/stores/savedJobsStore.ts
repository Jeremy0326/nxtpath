import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { jobService } from '../services/jobService';
import type { Job } from '../types/job';

interface SavedJobsState {
  savedJobs: Job[];
  isLoading: boolean;
  error: string | null;
  fetchSavedJobs: () => Promise<void>;
  saveJob: (job: Job) => void;
  unsaveJob: (jobId: string) => void;
  setSavedJobs: (jobs: Job[]) => void;
}

export const useSavedJobsStore = create<SavedJobsState>()(
  devtools((set, get) => ({
    savedJobs: [],
    isLoading: false,
    error: null,
    fetchSavedJobs: async () => {
      set({ isLoading: true, error: null });
      try {
        const savedJobsRaw = await jobService.getSavedJobs();
        const jobs = Array.isArray(savedJobsRaw)
          ? savedJobsRaw.map((sj: any) => sj.job)
          : (savedJobsRaw?.results || []).map((sj: any) => sj.job);
        // Fetch applied jobs and mark isApplied
        const appliedJobsResponse = await jobService.getAppliedJobs();
        const appliedJobIds = new Set((appliedJobsResponse.results || appliedJobsResponse || []).map((app: any) => app.job.id));
        const jobsWithApplied = jobs.map((job: any) => ({ ...job, isApplied: appliedJobIds.has(job.id) }));
        set({ savedJobs: jobsWithApplied, isLoading: false });
      } catch (err) {
        set({ error: 'Failed to fetch saved jobs', isLoading: false });
      }
    },
    saveJob: (job: Job) => {
      set(state => ({ savedJobs: [...state.savedJobs, job] }));
    },
    unsaveJob: (jobId: string) => {
      set(state => ({ savedJobs: state.savedJobs.filter(j => j.id !== jobId) }));
    },
    setSavedJobs: (jobs: Job[]) => set({ savedJobs: jobs }),
  }))
); 