import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Bookmark,
  Briefcase,
  ChevronRight,
  Filter,
  Frown,
  Loader2,
  Sparkles,
  Star,
  X,
  Search,
  MapPin,
} from 'lucide-react';

import { getJobs } from '@/lib/api/jobs';
import { applyForJob } from '@/lib/api/jobs';
import { cvAnalysisService } from '@/services/cvAnalysisService';
import type { JobSearchParams } from '@/services/jobService';
import { getSavedJobs, saveJob, unsaveJob } from '@/lib/api/savedJobs';
import type { Job, SavedJob } from '@/types';
import { useToast } from '@/hooks/useToast';
import { jobService } from '@/services/jobService';
import { JobCard } from '@/components/jobs/JobCard';
import { JobDetailsModal } from '@/components/jobs/JobDetailsModal';
import { SavedJobsDrawer } from '@/components/jobs/SavedJobsDrawer';
import { ApplicationConfirmationModal } from '@/components/jobs/ApplicationConfirmationModal';
import { useAiMatchReportStore } from '@/stores/aiMatchReportStore';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

function JobSearchPageContent() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { clearStaleReports } = useAiMatchReportStore();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<JobSearchParams>({});
  const [sortOption, setSortOption] = useState<string>('recent');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

  const [jobToApply, setJobToApply] = useState<Job | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [activeResume, setActiveResume] = useState<{ filename: string; url: string } | null>(null);

  const [aiJobs, setAiJobs] = useState<Job[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiRefreshTrigger, setAiRefreshTrigger] = useState(0); // Increment to force refresh

  useEffect(() => {
    fetchData();
  }, [filters, pagination.page, sortOption]);

  // Sync filters.sort_by with sortOption
  useEffect(() => {
    if (['recent', 'match', 'salary-asc', 'salary-desc'].includes(sortOption)) {
      setFilters(prev => ({ ...prev, sort_by: sortOption as 'recent' | 'match' | 'salary-asc' | 'salary-desc' }));
    } else {
      setFilters(prev => ({ ...prev, sort_by: 'recent' }));
    }
  }, [sortOption]);

  // Listen for CV upload/reanalyze event to refresh AI matches
  useEffect(() => {
    const handleCVRefresh = () => setAiRefreshTrigger(t => t + 1);
    window.addEventListener('cv:refresh-matches', handleCVRefresh);
    return () => window.removeEventListener('cv:refresh-matches', handleCVRefresh);
  }, []);

  // Fetch AI job matches when sortOption is 'match'
  useEffect(() => {
    if (sortOption !== 'match') return;
    setAiLoading(true);
    setAiError(null);
    Promise.all([
      jobService.getAIJobMatches(20, !!aiRefreshTrigger),
      jobService.getAppliedJobs(),
    ]).then(async ([aiJobsRaw, applicationsResponse]) => {
      const appliedJobIds = new Set((applicationsResponse.results || applicationsResponse || []).map((app: any) => app.job.id));
      // Merge isApplied into aiJobs
      let aiJobsWithApplied = aiJobsRaw.map((job: any) => ({
        ...job,
        isApplied: appliedJobIds.has(job.id),
      }));
      // For jobs missing LLM score, fetch vector_score as fallback
      const jobsNeedingVector = aiJobsWithApplied.filter(j => {
        // Only fetch vector_score if there is NO LLM score in the database
        const hasLLMScore = (j.ai_match_report && typeof j.ai_match_report.overall_score === 'number') || (typeof j.overall_score === 'number');
        return !hasLLMScore && typeof j.vector_score !== 'number';
      });
      if (jobsNeedingVector.length > 0) {
        const vectorScores = await Promise.all(jobsNeedingVector.map(j => jobService.getSingleJobMatch(j.id)));
        aiJobsWithApplied = aiJobsWithApplied.map(job => {
          const vectorJob = vectorScores.find(vj => vj.id === job.id);
          if (vectorJob && typeof vectorJob.vector_score === 'number') {
            return { ...job, vector_score: vectorJob.vector_score };
          }
          return job;
        });
      }
      setAiJobs(aiJobsWithApplied);
    }).catch(err => {
        setAiError('Failed to load AI job matches. Please upload your CV or try again.');
        setAiJobs([]);
    }).finally(() => setAiLoading(false));
  }, [sortOption, aiRefreshTrigger]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Debug logging
      console.log('Filters', filters);
      console.log('SortOption', sortOption);
      // Normalize filters for backend
      const normalizedFilters = { ...filters };
      
      // Map keyword to search if it exists
      if (normalizedFilters.keyword) {
        normalizedFilters.search = normalizedFilters.keyword;
        delete normalizedFilters.keyword; // Remove keyword as backend expects search
      }
      
      // Make sure location is properly passed to backend
      if (normalizedFilters.location && normalizedFilters.location.trim() !== '') {
        // Keep location as is, just ensure it's not empty
        normalizedFilters.location = normalizedFilters.location.trim();
      } else {
        delete normalizedFilters.location;
      }
      
      // Map job_type to backend expected values (e.g., FULL_TIME, PART_TIME, etc.)
      if (normalizedFilters.job_type) {
        normalizedFilters.job_type = (Array.isArray(normalizedFilters.job_type) ? normalizedFilters.job_type : [normalizedFilters.job_type])
          .map((t) => {
            if (t === 'full-time') return 'FULL_TIME';
            if (t === 'part-time') return 'PART_TIME';
            if (t === 'contract') return 'CONTRACT';
            if (t === 'internship') return 'INTERNSHIP';
            return t;
          });
      }
      if (normalizedFilters.experience) {
        normalizedFilters.experience = Array.isArray(normalizedFilters.experience) ? normalizedFilters.experience : [normalizedFilters.experience];
      }
      if (normalizedFilters.skills) {
        normalizedFilters.skills = Array.isArray(normalizedFilters.skills) ? normalizedFilters.skills : [normalizedFilters.skills];
      }
      if (normalizedFilters.salary_min === undefined) delete normalizedFilters.salary_min;
      if (normalizedFilters.salary_max === undefined) delete normalizedFilters.salary_max;
      if (normalizedFilters.industry === '') delete normalizedFilters.industry;
      if (normalizedFilters.location === '') delete normalizedFilters.location;
      if (normalizedFilters.remote === false) delete normalizedFilters.remote;
      if (normalizedFilters.sort_by === undefined) {
        if (['recent', 'match', 'salary-asc', 'salary-desc'].includes(sortOption)) {
          normalizedFilters.sort_by = sortOption as 'recent' | 'match' | 'salary-asc' | 'salary-desc';
        } else {
          normalizedFilters.sort_by = 'recent';
        }
      }
      // Fetch jobs and applications in parallel
      const [jobsResponse, savedJobsData, applicationsResponse] = await Promise.all([
        getJobs({ ...normalizedFilters, page: pagination.page }),
        getSavedJobs(),
        jobService.getAppliedJobs(),
      ]);
      const appliedJobIds = new Set((applicationsResponse.results || applicationsResponse || []).map((app: any) => app.job.id));
      // Mark jobs as isApplied if user has applied
      const jobsWithApplied = jobsResponse.results.map((job: any) => ({
        ...job,
        isApplied: appliedJobIds.has(job.id),
      }));
      setJobs(jobsWithApplied);
      setPagination(prev => ({ ...prev, total: jobsResponse.count }));
      setSavedJobs(savedJobsData);
      // Clear stale AI match reports from the store
      clearStaleReports(jobsWithApplied.map(j => j.id));
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const savedJobIds = useMemo(() => new Set(savedJobs.map(sj => sj.job.id)), [savedJobs]);

  const handleSaveJob = async (job: Job) => {
    const savedJob = savedJobs.find(sj => sj.job.id === job.id);
    try {
      if (savedJob) {
        await unsaveJob(savedJob.id);
        setSavedJobs(prev => prev.filter(sj => sj.id !== savedJob.id));
        addToast({ title: 'Job Unsaved', variant: 'default' });
      } else {
        const newSavedJob = await saveJob(job.id);
        setSavedJobs(prev => [...prev, newSavedJob]);
        addToast({ title: 'Job Saved!', variant: 'success' });
      }
    } catch (err) {
      addToast({
        title: 'Error',
        description: 'Could not update saved jobs.',
        variant: 'destructive',
      });
    }
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  const handleSearch = (searchParams: { keyword?: string; location?: string }) => {
    setFilters(prev => ({ ...prev, ...searchParams }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (newFilters: Partial<JobSearchParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleApplyClick = async (job: Job) => {
    setJobToApply(job);
    try {
        const userCV = await cvAnalysisService.getUserCV();
        if (userCV && userCV.id) {
            // The backend provides a full URL.
            setActiveResume({ filename: userCV.file_name, url: userCV.file_url });
        } else {
            setActiveResume(null);
            addToast({
                title: 'No Active Resume',
                description: 'Please upload or select an active resume before applying.',
                variant: 'destructive',
            });
            // Optionally, prevent the modal from opening if no resume
            // return;
        }
    } catch (error) {
        setActiveResume(null);
        addToast({
            title: 'Error Fetching Resume',
            description: 'Could not fetch your active resume. Please try again.',
            variant: 'destructive',
        });
        // Optionally, prevent the modal from opening on error
        // return;
    }
      setIsConfirmModalOpen(true);
  };

  // Replace handleApplicationSuccess with real application logic
  const handleApplicationConfirm = async () => {
    if (!jobToApply) return;
    try {
      // Fetch the user's active resume
      const userCV = await cvAnalysisService.getUserCV();
      if (!userCV || !userCV.id) {
        addToast({
          title: 'No Resume Found',
          description: 'Please upload a resume before applying.',
          variant: 'destructive',
        });
        throw new Error('No active resume found');
      }
      // Call the API to apply for the job
      await applyForJob({
        job: jobToApply.id,
        resume: userCV.id,
      });
      addToast({
        title: 'Application Sent!',
        description: `Your application for ${jobToApply.title} has been sent.`,
        variant: 'success',
      });
      // Re-fetch jobs and applications to update isApplied status everywhere
      await fetchData();
      setIsConfirmModalOpen(false);
      setJobToApply(null);
    } catch (err: any) {
      // Error will be handled by the modal's error logic
      throw err;
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const industries = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Education', label: 'Education' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Hospitality', label: 'Hospitality' },
    { value: 'Other', label: 'Other' },
  ];

  const jobTypes = [
    { value: 'FULL_TIME', label: 'Full-Time' },
    { value: 'PART_TIME', label: 'Part-Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'FREELANCE', label: 'Freelance' },
  ];

  const companySizes = [
    { value: '1-10', label: '1-10 Employees' },
    { value: '11-50', label: '11-50 Employees' },
    { value: '51-200', label: '51-200 Employees' },
    { value: '201-500', label: '201-500 Employees' },
    { value: '501-1000', label: '501-1000 Employees' },
    { value: '1000+', label: '1000+ Employees' },
  ];

  const remoteOptions = [
    { value: 'REMOTE', label: 'Remote' },
    { value: 'ONSITE', label: 'On-Site' },
    { value: 'HYBRID', label: 'Hybrid' },
  ];

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
    </div>
  );

  const NoJobsFound = () => (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <Frown className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
      <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
    </div>
  );

  const ErrorDisplay = () => (
    <div className="text-center py-12 bg-red-50 text-red-700 rounded-lg">
      <p>{error}</p>
      <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">
        Try Again
        </button>
        </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Your Next Role</h1>
          <p className="text-gray-500">Search through thousands of job listings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSavedDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm font-medium shadow-sm"
          >
            <Bookmark className="h-4 w-4" /> Saved Jobs
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={filters.keyword || ''}
                onChange={(e) => handleFilterChange({ keyword: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location || ''}
                onChange={(e) => handleFilterChange({ location: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <button
              onClick={() => fetchData()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Search Jobs
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium">Filters</h2>
          <button 
            onClick={handleClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <X className="h-4 w-4 mr-1" /> Clear
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Industry Filter */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <select
              id="industry"
              value={filters.industry || ''}
              onChange={(e) => handleFilterChange({ industry: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Industries</option>
              {industries.map((industry) => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Job Type Filter */}
          <div>
            <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
            <select
              id="job_type"
              value={Array.isArray(filters.job_type) ? filters.job_type[0] || '' : filters.job_type || ''}
              onChange={(e) => handleFilterChange({ job_type: e.target.value ? [e.target.value] : [] })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              {jobTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Company Size Filter */}
          <div>
            <label htmlFor="company_size" className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
            <select
              id="company_size"
              value={filters.company_size || ''}
              onChange={(e) => handleFilterChange({ company_size: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Sizes</option>
              {companySizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Remote Option Filter */}
          <div>
            <label htmlFor="remote_option" className="block text-sm font-medium text-gray-700 mb-2">Remote Option</label>
            <select
              id="remote_option"
              value={filters.remote_option || ''}
              onChange={(e) => handleFilterChange({ remote_option: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Options</option>
              {remoteOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-bold">{jobs.length}</span> of <span className="font-bold">{pagination.total}</span> results
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-gray-600">Sort by:</label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="match">AI Match Score</option>
              <option value="salary-desc">Salary (High to Low)</option>
              <option value="salary-asc">Salary (Low to High)</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        {sortOption === 'match' ? (
          aiLoading ? (
            <LoadingSpinner />
          ) : aiError ? (
            <ErrorDisplay />
          ) : aiJobs.length === 0 ? (
            <NoJobsFound />
          ) : (
            <div className="space-y-4">
              {aiJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSelect={() => handleJobSelect(job)}
                  onSave={() => handleSaveJob(job)}
                  onApply={() => handleApplyClick(job)}
                  isSaved={savedJobIds.has(job.id)}
                  isSelected={selectedJob?.id === job.id}
                />
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {([...jobs].sort((a,b)=>{
              if(sortOption==='match') return (b.vector_score||0)-(a.vector_score||0);
              if(sortOption==='salary-desc') return (b.salary_max||0)-(a.salary_max||0);
              if(sortOption==='salary-asc') return (a.salary_min||0)-(b.salary_min||0);
              const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
              const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
              return bDate - aDate;
            })).map(job => (
              <JobCard
                key={job.id}
                job={job}
                onSelect={() => handleJobSelect(job)}
                onSave={() => handleSaveJob(job)}
                onApply={() => handleApplyClick(job)}
                isSaved={savedJobIds.has(job.id)}
                isSelected={selectedJob?.id === job.id}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > jobs.length && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setPagination(p => ({...p, page: p.page + 1}))}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      <JobDetailsModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />

      <ApplicationConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleApplicationConfirm}
        job={jobToApply}
        resumeFilename={activeResume?.filename}
        resumeUrl={activeResume?.url}
      />

      <SavedJobsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        onRemoveJob={async (id) => {
          const sj = savedJobs.find(s => s.id === id);
          if (!sj) return false;
          await unsaveJob(id);
          setSavedJobs(prev => prev.filter(s => s.id !== id));
          return true;
        }}
        onApplyJob={handleApplyClick}
      />
    </div>
  );
}

export function JobSearchPage() {
  return <JobSearchPageContent />;
}