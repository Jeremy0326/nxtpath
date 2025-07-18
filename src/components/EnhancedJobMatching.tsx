import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Job, JobMatchResponse } from '../types/job';
import api from '../lib/axios';
import EnhancedJobCard from './jobs/EnhancedJobCard';

interface EnhancedJobMatchingProps {
  onJobApply?: (jobId: string) => void;
}

const EnhancedJobMatching: React.FC<EnhancedJobMatchingProps> = ({ onJobApply }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'match' | 'confidence' | 'date'>('match');
  const [filterBy, setFilterBy] = useState<'all' | 'strong' | 'good' | 'moderate'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set());

  const fetchJobMatches = async (forceRefresh = false) => {
    try {
      setLoading(!forceRefresh);
      setIsRefreshing(forceRefresh);
      setError('');

      const params = new URLSearchParams({
        limit: '10',
        ...(forceRefresh && { force_reparse: 'true' })
      });

      const response = await api.get<JobMatchResponse>(`/api/jobs/ai-match/?${params}`);
      
      setJobs(response.data.results);
      setSummary(response.data.summary);
      
      if (response.data.message) {
        setError(response.data.message);
      }
    } catch (err: any) {
      console.error('Failed to fetch job matches:', err);
      if (err.response?.status === 404) {
        setError('No active CV found. Please upload your CV first.');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch job matches. Please try again.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobMatches();
  }, []);

  const handleJobApply = async (jobId: string) => {
    if (onJobApply) {
      setApplyingJobs(prev => new Set([...prev, jobId]));
      try {
        await onJobApply(jobId);
      } finally {
        setApplyingJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      }
    }
  };

  const getFilteredJobs = () => {
    let filtered = [...jobs];

    // Apply filters
    switch (filterBy) {
      case 'strong':
        filtered = filtered.filter(job => (job.matchScore || 0) >= 80);
        break;
      case 'good':
        filtered = filtered.filter(job => (job.matchScore || 0) >= 60 && (job.matchScore || 0) < 80);
        break;
      case 'moderate':
        filtered = filtered.filter(job => (job.matchScore || 0) >= 40 && (job.matchScore || 0) < 60);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'match':
        filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
      case 'confidence':
        filtered.sort((a, b) => {
          const aConfidence = a.advanced_analysis?.confidence_level === 'High' ? 3 : 
                            a.advanced_analysis?.confidence_level === 'Medium' ? 2 : 1;
          const bConfidence = b.advanced_analysis?.confidence_level === 'High' ? 3 : 
                            b.advanced_analysis?.confidence_level === 'Medium' ? 2 : 1;
          return bConfidence - aConfidence;
        });
        break;
      case 'date':
        filtered.sort((a, b) => {
          const aDate = a.posted_date ? new Date(a.posted_date).getTime() : 0;
          const bDate = b.posted_date ? new Date(b.posted_date).getTime() : 0;
          return bDate - aDate;
        });
        break;
    }

    return filtered;
  };

  const filteredJobs = getFilteredJobs();

  const getMatchDistribution = () => {
    const distribution = {
      strong: jobs.filter(job => (job.matchScore || 0) >= 80).length,
      good: jobs.filter(job => (job.matchScore || 0) >= 60 && (job.matchScore || 0) < 80).length,
      moderate: jobs.filter(job => (job.matchScore || 0) >= 40 && (job.matchScore || 0) < 60).length,
      weak: jobs.filter(job => (job.matchScore || 0) < 40).length
    };
    return distribution;
  };

  const distribution = getMatchDistribution();

  if (loading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI is Analyzing Your Profile</h2>
            <p className="text-gray-600">Finding the best job matches for you...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Find Matches</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => fetchJobMatches(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤖 AI-Powered Job Matches
          </h1>
          <p className="text-xl text-gray-600">
            Sophisticated analysis tailored to your unique profile
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Matches</p>
                  <p className="text-3xl font-bold text-indigo-600">{summary.total_jobs}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Strong Matches</p>
                  <p className="text-3xl font-bold text-green-600">{distribution.strong}</p>
                  <p className="text-xs text-gray-500">80%+ compatibility</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Profile</p>
                  <p className="text-lg font-bold text-purple-600">{summary.cv_summary.name}</p>
                  <p className="text-xs text-gray-500">{summary.cv_summary.skills_count} skills analyzed</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {summary.successful_matches}/{summary.total_jobs}
                  </p>
                  <p className="text-xs text-gray-500">AI analysis completed</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Match Quality:</label>
                <div className="flex space-x-2">
                  {[
                    { key: 'all', label: 'All', count: jobs.length },
                    { key: 'strong', label: 'Strong', count: distribution.strong },
                    { key: 'good', label: 'Good', count: distribution.good },
                    { key: 'moderate', label: 'Moderate', count: distribution.moderate }
                                      ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setFilterBy(key as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filterBy === key 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="match">Match Score</option>
                  <option value="confidence">AI Confidence</option>
                  <option value="date">Date Posted</option>
                </select>
              </div>
              
              <button
                onClick={() => fetchJobMatches(true)}
                disabled={isRefreshing}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isRefreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Refresh Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Job Cards */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs match your current filter</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or refresh the analysis</p>
            <button
              onClick={() => setFilterBy('all')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Show All Jobs
            </button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
            layout
          >
            <AnimatePresence>
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <EnhancedJobCard 
                    job={job} 
                    onApply={handleJobApply}
                    isApplying={applyingJobs.has(job.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Footer */}
        {filteredJobs.length > 0 && (
          <div className="text-center mt-12 p-6 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-600">
              Showing {filteredJobs.length} of {jobs.length} jobs • 
              Powered by AI analysis • 
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedJobMatching; 