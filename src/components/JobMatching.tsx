import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/axios';
import { jobService } from '../services/jobService';
import { Job } from '../types/job';

interface JobMatchingProps {
  parsedResume: any;
  preferences: {
    location?: string;
    salary_range?: string;
    job_type?: string;
    skills?: string[];
  };
}

export function JobMatching({ parsedResume, preferences }: JobMatchingProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [sortBy, setSortBy] = useState<'match' | 'date'>('match');

  useEffect(() => {
    const fetchMatchingJobs = async () => {
      try {
        setLoading(true);
        const cacheKey = `jobMatches_${JSON.stringify(preferences)}_resume_${parsedResume?.id || 'no_id'}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cacheExpiry = localStorage.getItem(`${cacheKey}_expiry`);
        const currentTime = new Date().getTime();
        const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (cachedData && cacheExpiry && currentTime < parseInt(cacheExpiry)) {
          const parsedJobs = JSON.parse(cachedData);
          setJobs(parsedJobs);
          setLoading(false);
          return;
        }

        // Try AI matching first
        try {
          const aiJobs = await jobService.getAIJobMatches(10);
          setJobs(aiJobs);
          localStorage.setItem(cacheKey, JSON.stringify(aiJobs));
          localStorage.setItem(`${cacheKey}_expiry`, (currentTime + cacheDuration).toString());
        } catch (aiError) {
          console.error('AI matching failed, falling back to standard:', aiError);
          const standardJobs = await jobService.getJobMatches(10);
          setJobs(standardJobs);
          localStorage.setItem(cacheKey, JSON.stringify(standardJobs));
          localStorage.setItem(`${cacheKey}_expiry`, (currentTime + cacheDuration).toString());
        }
      } catch (err) {
        setError('Failed to fetch matching jobs');
      } finally {
        setLoading(false);
      }
    };

    if (parsedResume) {
      fetchMatchingJobs();
    }
  }, [parsedResume, preferences]);

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === 'match') {
      return (b.matchScore || 0) - (a.matchScore || 0);
    }
    const aDate = a.posted_date ? new Date(a.posted_date).getTime() : 0;
    const bDate = b.posted_date ? new Date(b.posted_date).getTime() : 0;
    return bDate - aDate;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Job Matches for You</h2>
        <div>
          <button
            onClick={() => setSortBy('match')}
            className={`px-4 py-2 rounded-md mr-2 ${sortBy === 'match' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Sort by Match Score
          </button>
          <button
            onClick={() => setSortBy('date')}
            className={`px-4 py-2 rounded-md ${sortBy === 'date' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Sort by Date
          </button>
        </div>
      </div>

      {sortedJobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No matching jobs found. Try updating your CV or preferences.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedJobs.map((job) => (
            <motion.div
              key={job.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedJob(job)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                  <p className="text-gray-600">{job.company.name}</p>
                  <p className="text-sm text-gray-500">{job.location}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-indigo-600">Match: {job.matchScore}%</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-700 line-clamp-2">{job.description}</p>
              </div>
              {job.matchReasons && job.matchReasons.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-green-600 font-medium">Why this match?</p>
                  <ul className="text-xs text-gray-600 list-disc pl-4">
                    {job.matchReasons.slice(0, 2).map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-3/4 max-w-4xl overflow-y-auto max-h-[80vh]">
            <h3 className="text-2xl font-bold mb-4">{selectedJob.title} at {selectedJob.company.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-indigo-50 p-3 rounded-lg col-span-1 md:col-span-3">
                <p className="font-semibold text-indigo-700">Match Score: {selectedJob.matchScore}%</p>
                {selectedJob.matchReasons && selectedJob.matchReasons.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mt-2">Reasons for Match:</p>
                    <ul className="text-sm list-disc pl-5">
                      {selectedJob.matchReasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-700">Location</p>
                <p className="text-sm">{selectedJob.location}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-700">Job Type</p>
                <p className="text-sm">{selectedJob.job_type}</p>
                    </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-700">Salary Range</p>
                <p className="text-sm">
                  {selectedJob.salary_min && selectedJob.salary_max 
                    ? `${selectedJob.currency}${selectedJob.salary_min.toLocaleString()} - ${selectedJob.salary_max.toLocaleString()}`
                    : 'Not specified'
                  }
                </p>
                    </div>
              <div className="bg-gray-100 p-3 rounded-lg col-span-1 md:col-span-3">
                <p className="font-semibold">Description</p>
                <p className="text-sm">{selectedJob.description}</p>
                    </div>
              {selectedJob.highlightedSkills && selectedJob.highlightedSkills.length > 0 && (
                <div className="bg-green-50 p-3 rounded-lg col-span-1 md:col-span-3">
                  <p className="font-semibold text-green-700">Your Matching Skills</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedJob.highlightedSkills.map((skill, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedJob.missingSkills && selectedJob.missingSkills.length > 0 && (
                <div className="bg-yellow-50 p-3 rounded-lg col-span-1 md:col-span-3">
                  <p className="font-semibold text-yellow-700">Skills to Develop</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedJob.missingSkills.map((skill, index) => (
                      <span key={index} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedJob.improvementSuggestions && selectedJob.improvementSuggestions.length > 0 && (
                <div className="bg-purple-50 p-3 rounded-lg col-span-1 md:col-span-3">
                  <p className="font-semibold text-purple-700">Improvement Suggestions</p>
                  <ul className="text-sm list-disc pl-5">
                    {selectedJob.improvementSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setSelectedJob(null)}>
                Close
              </button>
              <button className="px-4 py-2 bg-indigo-500 text-white rounded-md">
                    Apply Now
                  </button>
                </div>
              </div>
        </div>
      )}
    </div>
  );
} 