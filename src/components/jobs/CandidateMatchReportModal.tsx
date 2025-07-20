import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { jobService } from '@/services/jobService';
import { AIMatchAnalysis } from './AIMatchAnalysis';
import { GroupedMatchReport } from '@/types';

interface CandidateMatchReportModalProps {
  jobId: string;
  resumeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CandidateMatchReportModal: React.FC<CandidateMatchReportModalProps> = ({
  jobId,
  resumeId,
  isOpen,
  onClose,
}) => {
  const [report, setReport] = useState<GroupedMatchReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchReport = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await jobService.getAnalysisReportForCandidate(jobId, resumeId, forceRefresh);
      if (data.processing) {
        setProcessing(true);
        setIsPolling(true);
        setReport(null);
      } else {
        setProcessing(false);
        setIsPolling(false);
        setReport(data);
      }
    } catch (err: any) {
      if (err.response?.status === 202) {
        setProcessing(true);
        setIsPolling(true);
        setReport(null);
      } else {
        setError('Failed to fetch AI match report.');
        setProcessing(false);
        setIsPolling(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && jobId && resumeId) {
      fetchReport();
    }
  }, [isOpen, jobId, resumeId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPolling) {
      interval = setInterval(() => {
        fetchReport();
      }, 5000); // Poll every 5 seconds
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPolling]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 bg-white">
        <DialogTitle className="sr-only">AI Match Analysis</DialogTitle>
        <DialogDescription className="sr-only">Analysis of candidate's resume against the job description.</DialogDescription>
        <div className="p-6 flex justify-between items-center border-b bg-white">
            <div>
                <h2 className="text-2xl font-bold">AI Match Analysis</h2>
                <p className="text-gray-600">Analysis of candidate's resume against the job description.</p>
            </div>
        </div>
        <div className="flex-grow overflow-auto p-6 bg-white">
          {processing ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
              <p className="text-lg text-indigo-700 font-semibold mb-2">Generating AI Match Report…</p>
              <p className="text-gray-600 mb-4">This may take a few moments. The report will appear automatically when ready.</p>
              <Button variant="outline" size="sm" onClick={() => fetchReport(true)} disabled={isLoading || isPolling}>
                <RefreshCw className={`h-4 w-4 ${isLoading || isPolling ? 'animate-spin' : ''}`} />
                <span className="ml-2">Force Regenerate</span>
              </Button>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <X className="h-10 w-10 text-red-600 mb-4" />
              <p className="text-lg text-red-700 font-semibold mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchReport(true)}>
                <RefreshCw className="h-4 w-4" />
                <span className="ml-2">Try Again</span>
              </Button>
            </div>
          ) : report ? (
            <AIMatchAnalysis
              data={report}
              isLoading={isLoading}
              error={error}
              processing={processing}
              audience="employer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-lg text-gray-700 font-semibold mb-2">No AI Match Report found for this candidate.</p>
              <Button variant="outline" size="sm" onClick={() => fetchReport(true)}>
                <RefreshCw className="h-4 w-4" />
                <span className="ml-2">Generate Report</span>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 