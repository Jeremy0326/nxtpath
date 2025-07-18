import { create } from 'zustand';
import { jobService } from '@/services/jobService';
import { vectorScoringService } from '@/services/vectorScoringService';
import { GroupedMatchReport } from '@/types';
import axios from 'axios';
import api from '@/lib/axios';

interface AiMatchReport {
  data: GroupedMatchReport | null;
  isLoading: boolean;
  error: string | null;
  score?: number;
  scoreSource?: 'llm' | 'vector';
  processing?: boolean;
}

interface AiMatchReportState {
  reports: Record<string, AiMatchReport>;
  fetchReport: (jobId: string, forceRefresh?: boolean) => Promise<void>;
  getReport: (jobId: string) => AiMatchReport | undefined;
  updateVectorScore: (jobId: string, vectorScore: number) => void;
  compareScores: (jobId: string) => { vectorScore?: number; llmScore?: number; difference?: number } | null;
  clearStaleReports: (activeJobIds: string[]) => void;
}

export const useAiMatchReportStore = create<AiMatchReportState>((set, get) => ({
  reports: {},

  getReport: (jobId: string) => {
    return get().reports[jobId];
  },

  fetchReport: async (jobId: string, forceRefresh: boolean = false) => {
    set((state) => ({
      reports: {
        ...state.reports,
        [jobId]: {
          ...(state.reports[jobId] || { data: null, error: null }),
          isLoading: true,
        },
      },
    }));

    try {
      let cvId: string | undefined = undefined;
      try {
        const cvRes = await api.get('/cv/active/');
        cvId = cvRes.data?.id;
      } catch (cvErr) {
        set((state) => ({
          reports: {
            ...state.reports,
            [jobId]: {
              data: null,
              isLoading: false,
              error: 'No active CV found. Please upload or activate a resume.',
              processing: false,
            },
          },
        }));
        return;
      }

      // Always fetch the latest LLM report if forceRefresh or no report in cache
      let llmReport: any = null;
      let llmProcessing = false;
      let shouldFetchLLM = forceRefresh || !get().reports[jobId] || !get().reports[jobId].data;
      if (shouldFetchLLM) {
      try {
        const llmRes = await jobService.getAnalysisReport(jobId, cvId);
        if (llmRes && llmRes.overall_score !== undefined) {
          llmReport = llmRes;
        }
      } catch (err: any) {
        if (err?.response?.status === 202 && err?.response?.data?.processing) {
          llmProcessing = true;
        } else if (err?.response?.data?.processing) {
          llmProcessing = true;
        } else if (err?.response?.status === 404) {
          // No report yet, not an error
        } else {
          set((state) => ({
            reports: {
              ...state.reports,
              [jobId]: {
                data: null,
                isLoading: false,
                error: err?.message || 'Failed to fetch AI match report.',
                processing: false,
              },
            },
          }));
          return;
          }
        }
      } else {
        llmReport = get().reports[jobId]?.data;
      }

      // Fetch vector score only if no LLM report
      let vectorScoreData: any = null;
      if (!llmReport) {
        try {
          const vectorRes = await vectorScoringService.getSingleJobScore(jobId, cvId);
          vectorScoreData = vectorRes;
        } catch (err) {
          // Ignore, handled below
        }
      }

      // Determine which score to show
      let score: number | undefined = undefined;
      let scoreSource: 'llm' | 'vector' | undefined = undefined;
      let processing = false;
      let data: GroupedMatchReport | null = null;

      if (llmReport && llmReport.overall_score !== undefined) {
        score = llmReport.overall_score;
        scoreSource = 'llm';
        data = llmReport;
        processing = false;
      } else if (vectorScoreData && vectorScoreData.score !== undefined && !vectorScoreData.processing) {
        score = vectorScoreData.score;
        scoreSource = vectorScoreData.source || 'vector';
        processing = false;
      } else if ((vectorScoreData && vectorScoreData.processing) || llmProcessing) {
        processing = true;
      }

      set((state) => ({
        reports: {
          ...state.reports,
          [jobId]: {
            data,
            isLoading: false,
            error: null,
            score,
            scoreSource,
            processing,
          },
        },
      }));
    } catch (error: any) {
      set((state) => ({
        reports: {
          ...state.reports,
          [jobId]: {
            data: null,
            isLoading: false,
            error: error?.message || 'Failed to fetch AI match report.',
            processing: false,
          },
        },
      }));
    }
  },

  updateVectorScore: (jobId: string, vectorScore: number) => {
    set((state) => ({
      reports: {
        ...state.reports,
        [jobId]: {
          ...(state.reports[jobId] || { data: null, isLoading: false, error: null }),
          vectorScore,
          vectorScoreUpdated: true,
        },
      },
    }));
  },

  compareScores: (jobId: string) => {
    const report = get().reports[jobId];
    if (!report) return null;

    const vectorScore = report.vectorScore;
    const llmScore = report.data?.overall_score;

    if (vectorScore === undefined || llmScore === undefined) {
      return { vectorScore, llmScore };
    }

    return {
      vectorScore,
      llmScore,
      difference: Math.abs(vectorScore - llmScore),
    };
  },

  // Clear reports for jobs not in the current job list
  clearStaleReports: (activeJobIds: string[]) => {
    set((state) => {
      const newReports: Record<string, AiMatchReport> = {};
      for (const jobId of activeJobIds) {
        if (state.reports[jobId]) {
          newReports[jobId] = state.reports[jobId];
        }
      }
      return { reports: newReports };
    });
  },
})); 