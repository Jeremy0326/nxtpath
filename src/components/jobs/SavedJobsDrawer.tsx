import React, { useState, useEffect, useCallback } from 'react';
import { X, Bookmark, MapPin, Briefcase, Calendar, Loader2, RefreshCw, AlertCircle, Clock, Building, Star, ChevronRight, Trash2, CheckCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExtendedJob } from '../../types/components';
import { jobService } from '../../services/jobService';
import { format, formatDistanceToNow } from 'date-fns';
import { useSavedJobsStore } from '../../stores/savedJobsStore';
import { useAiMatchReportStore } from '@/stores/aiMatchReportStore';

interface SavedJobsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRemoveJob: (jobId: string) => Promise<boolean>;
  onApplyJob: (job: Job) => void;
}

export function SavedJobsDrawer({
  isOpen,
  onClose,
  onRemoveJob,
  onApplyJob,
}: Omit<SavedJobsDrawerProps, 'savedJobs'>) {
  const { savedJobs, fetchSavedJobs, isLoading, error } = useSavedJobsStore();
  const { reports } = useAiMatchReportStore();
  const [removingJobId, setRemovingJobId] = useState<string | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'applied' | 'not-applied'>('all');

  // Simulate loading effect when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchSavedJobs();
    }
  }, [isOpen, fetchSavedJobs]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Recently posted";
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Recently posted";
      }
      
      // Use formatDistanceToNow for relative time
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Recently posted";
    }
  };
  
  const handleRemoveJob = async (jobId: string) => {
    setRemovingJobId(jobId);
    try {
      const success = await onRemoveJob(jobId);
      if (!success) {
        // Optionally handle error
      }
    } finally {
      setRemovingJobId(null);
    }
  };

  const handleApplyJob = async (job: Job) => {
    setApplyingJobId(job.id);
    try {
      await onApplyJob(job);
    } finally {
      setApplyingJobId(null);
    }
  };

  const refreshSavedJobs = async () => {
    setIsRefreshing(true);
    await fetchSavedJobs();
    setIsRefreshing(false);
  };

  // Filter jobs based on active tab
  const filteredJobs = savedJobs.filter(job => {
    if (activeTab === 'all') return true;
    if (activeTab === 'applied') return job.isApplied;
    if (activeTab === 'not-applied') return !job.isApplied;
    return true;
  });

  // Count jobs by status
  const appliedCount = savedJobs.filter(job => job.isApplied).length;
  const notAppliedCount = savedJobs.filter(job => !job.isApplied).length;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-full md:w-96 bg-gray-50 overflow-y-auto shadow-xl"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Bookmark className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Saved Jobs</h2>
                    {!isLoading && savedJobs.length > 0 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        {savedJobs.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={refreshSavedJobs}
                      disabled={isRefreshing || isLoading}
                      className={`p-2 rounded-full ${
                        isRefreshing || isLoading ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                      aria-label="Refresh saved jobs"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                </div>

                {/* Tabs */}
                {!isLoading && savedJobs.length > 0 && (
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'all'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      All ({savedJobs.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('applied')}
                      className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'applied'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Applied ({appliedCount})
                    </button>
                    <button
                      onClick={() => setActiveTab('not-applied')}
                      className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'not-applied'
                          ? 'border-amber-500 text-amber-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Not Applied ({notAppliedCount})
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {error && (
                  <div className="bg-red-50 m-4 p-3 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500">Loading saved jobs...</p>
                  </div>
                ) : filteredJobs.length > 0 ? (
                  <div className="p-4 space-y-4">
                    {filteredJobs.map((job) => (
                      <motion.div 
                        key={job.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Job header with logo */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-start space-x-3">
                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                              {job.company?.logo_url ? (
                                <img
                                  src={job.company.logo_url}
                                  alt={job.company?.name}
                                  className="h-full w-full object-contain p-1"
                                />
                              ) : (
                                <Building className="h-8 w-8 text-gray-400 m-2" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{job.title}</h3>
                              <p className="text-sm text-gray-600">{job.company?.name}</p>
                              
                              {/* Match score */}
                              {(() => {
                                const report = reports[job.id];
                                if (report && report.processing) {
                                  return (
                                    <span className="mt-1 flex items-center bg-gradient-to-r from-gray-300 to-gray-400 text-white text-xs px-2 py-0.5 rounded-full shadow animate-pulse">
                                      <Star className="h-3 w-3 mr-1 fill-white text-white" />
                                      Preparing AI Match...
                                    </span>
                                  );
                                } else if (report && typeof report.score === 'number') {
                                  return (
                                    <span
                                      className="mt-1 flex items-center bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs px-2 py-0.5 rounded-full shadow"
                                      aria-label={report.scoreSource === 'llm' ? 'AI Match Score' : 'AI Vector Score'}
                                      title={report.scoreSource === 'llm' ? 'This is your advanced AI match score based on LLM analysis.' : 'This is your AI vector match score based on your CV and job requirements.'}
                                    >
                                      <Star className="h-3 w-3 mr-1 fill-white text-white" />
                                      {report.score}% {report.scoreSource === 'llm' ? 'AI Match Score' : 'AI Vector Score'}
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Job details */}
                        <div className="px-4 py-3 space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate">{job.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{job.job_type}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span>Posted {formatDate(job.created_at)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                          <button
                            onClick={() => handleRemoveJob(job.id)}
                            disabled={removingJobId === job.id}
                            className={`flex items-center text-xs font-medium px-2 py-1 rounded ${
                              removingJobId === job.id
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {removingJobId === job.id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Trash2 className="h-3 w-3 mr-1" />
                          )}
                            Remove
                          </button>
                          
                          <button
                            onClick={() => handleApplyJob(job)}
                            disabled={applyingJobId === job.id || job.isApplied}
                            className={`flex items-center text-xs font-medium px-3 py-1.5 rounded ${
                              job.isApplied
                                ? 'bg-green-100 text-green-700'
                                : applyingJobId === job.id
                                ? 'bg-blue-100 text-blue-400'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {job.isApplied ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Applied
                              </>
                            ) : applyingJobId === job.id ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Applying...
                              </>
                            ) : (
                              <>
                                <Send className="h-3 w-3 mr-1" />
                            Apply Now
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full px-6 text-center py-12">
                    <div className="p-4 bg-blue-50 rounded-full mb-4">
                      {activeTab === 'all' ? (
                        <Bookmark className="h-8 w-8 text-blue-400" />
                      ) : activeTab === 'applied' ? (
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      ) : (
                        <Send className="h-8 w-8 text-amber-400" />
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {activeTab === 'all' 
                        ? 'No saved jobs yet' 
                        : activeTab === 'applied' 
                        ? 'No applied jobs' 
                        : 'No pending applications'}
                    </h3>
                    <p className="text-gray-500 max-w-xs">
                      {activeTab === 'all' 
                        ? "Save jobs you're interested in to keep track of them here and apply later." 
                        : activeTab === 'applied' 
                        ? "Jobs you apply for will appear here so you can track your applications." 
                        : "Apply to your saved jobs to start your application process."}
                    </p>
                    <button 
                      onClick={onClose}
                      className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Jobs
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}