import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  MessageSquare,
  Video,
  Mic,
  Volume2,
  ChevronRight,
  Download,
  Share2,
  X,
  Loader2,
  ServerCrash
} from 'lucide-react';
import { jobService } from '../../services/jobService';
import type { AIInterviewReportData } from '../../types/analysis';

// Matches the AIInterviewReport model in the backend
interface AIInterviewReportData {
  id: string;
  overall_score: number;
  summary: string;
  strengths: string[];
  areas_for_improvement: string[];
  question_analysis: {
    question: string;
    answer: string;
    evaluation: string;
  }[];
  interview: {
    job_title: string;
    completed_at: string;
  };
}

interface InterviewReportProps {
  applicationId: string;
  onClose: () => void;
  onRetake: () => void;
}

export function InterviewReport({ applicationId, onClose, onRetake }: InterviewReportProps) {
  const [report, setReport] = useState<AIInterviewReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await jobService.getInterviewReport(applicationId);
        setReport(data);
      } catch (err) {
        setError("Failed to load the interview report. Please try again later.");
        console.error("Error fetching interview report:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (applicationId) {
      fetchReport();
    }
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto" />
          <p className="mt-4 text-lg">Generating your report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <ServerCrash className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="mt-4 text-xl font-semibold">Could not load report</h3>
          <p className="mt-2 text-gray-600">{error || "An unknown error occurred."}</p>
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Interview Report</h2>
            <div className="mt-1 text-sm text-gray-500">
              Generated on {report.created_at ? new Date(report.created_at).toLocaleDateString() : '...'}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-8 space-y-8">
          {/* Summary */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
              AI Summary
            </h3>
            <p className="text-gray-600">{report.summary}</p>
          </div>
          {/* Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white text-center">
              <div className="text-xs">Fit Score</div>
              <div className="text-2xl font-bold">{report.fit_score ?? 'N/A'}</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-4 text-white text-center">
              <div className="text-xs">Culture Fit</div>
              <div className="text-2xl font-bold">{report.culture_fit_score ?? 'N/A'}</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white text-center">
              <div className="text-xs">Communication</div>
              <div className="text-2xl font-bold">{report.communication_score ?? 'N/A'}</div>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-xl p-4 text-white text-center">
              <div className="text-xs">Technical Depth</div>
              <div className="text-2xl font-bold">{report.technical_depth_score ?? 'N/A'}</div>
            </div>
          </div>
          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-semibold text-green-700 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1 text-green-500" /> Strengths
              </h4>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {report.strengths?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold text-red-700 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1 text-red-500" /> Weaknesses
              </h4>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {report.weaknesses?.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
          {/* Next Steps & Rationale */}
          <div className="space-y-2">
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Suggested Next Step:</span> {report.suggested_next_step}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Rationale:</span> {report.rationale}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Follow-up Questions:</span>
              <ul className="list-disc pl-5">
                {report.follow_up_questions?.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}