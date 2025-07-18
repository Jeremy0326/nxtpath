import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BarChart2, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';

interface InterviewHistory {
  id: string;
  type: string;
  date: string;
  duration: string;
  score: number;
  scoreChange: number;
  strengths: string[];
  improvements: string[];
  questions: {
    question: string;
    performance: 'excellent' | 'good' | 'needs_improvement';
    feedback: string;
  }[];
}

interface InterviewHistoryProps {
  history: InterviewHistory[];
  onViewReport: (interview: InterviewHistory) => void;
  onRetake: (type: string) => void;
}

export function InterviewHistory({ history, onViewReport, onRetake }: InterviewHistoryProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Interview History</h2>
        <select className="text-sm border-0 bg-transparent font-medium text-gray-500 focus:ring-0">
          <option>All Time</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
        </select>
      </div>

      <div className="space-y-4">
        {history.map((interview, index) => (
          <motion.div
            key={interview.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border p-6 hover:border-indigo-500 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{interview.type}</h3>
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    {interview.date}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1.5" />
                    {interview.duration}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    <BarChart2 className="h-4 w-4 mr-1.5" />
                    {interview.score}%
                  </span>
                  <span className={`flex items-center text-sm ${
                    interview.scoreChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {interview.scoreChange > 0 ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(interview.scoreChange)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Strengths</h4>
                <div className="space-y-1">
                  {interview.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2" />
                      {strength}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Areas for Improvement</h4>
                <div className="space-y-1">
                  {interview.improvements.map((improvement, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2" />
                      {improvement}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-4">
              <button
                onClick={() => onRetake(interview.type)}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Retake Interview
              </button>
              <button
                onClick={() => onViewReport(interview)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                View Full Report
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}