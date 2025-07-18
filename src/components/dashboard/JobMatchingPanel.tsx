import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { Job } from '../../types/job';
import { 
  Briefcase, 
  MapPin, 
  Star, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  Upload, 
  X, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { JobMatchCard } from './JobMatchCard';
import { MatchDetails } from './MatchDetails';
import { colors, componentStyles, typography, layout } from '../../lib/design-system';

interface JobMatchingPanelProps {
  jobs?: Job[];
  isLoading?: boolean;
  error?: string | null;
}

export const JobMatchingPanel: React.FC<JobMatchingPanelProps> = ({ 
  jobs: initialJobs,
  isLoading: externalLoading,
  error: externalError
}) => {
  const [matchedJobs, setMatchedJobs] = useState<Job[]>(initialJobs || []);
  const [isLoading, setIsLoading] = useState(externalLoading !== undefined ? externalLoading : !initialJobs);
  const [error, setError] = useState<string | null>(externalError || null);
  const [matchType, setMatchType] = useState<'standard' | 'ai'>('ai');
  const [retryCount, setRetryCount] = useState(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    // Update from external props when they change
    if (externalLoading !== undefined) {
      setIsLoading(externalLoading);
    }

    if (externalError !== undefined) {
      setError(externalError);
    }
    
    if (initialJobs) {
      setMatchedJobs(initialJobs);
      return;
    }

    // Only fetch if not provided externally
    if (initialJobs === undefined && externalLoading === undefined) {
      const fetchMatchedJobs = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          let jobs;
          try {
            if (matchType === 'ai') {
              jobs = await jobService.getAIJobMatches(3); // Get top 3 AI matches
            } else {
              jobs = await jobService.getJobMatches(3); // Get top 3 standard matches
            }
            
            setMatchedJobs(jobs);
          } catch (err: any) {
            console.error('Error fetching matched jobs:', err);
            
            // If AI matching fails, try standard matching as fallback
            if (matchType === 'ai' && retryCount === 0) {
              console.log('AI matching failed, falling back to standard matching');
              setRetryCount(1);
              setMatchType('standard');
              return; // The useEffect will run again with the new matchType
            }
            
            // Check for specific error types
            if (err.response) {
              if (err.response.status === 404) {
                setError('No CV found. Please upload your CV to get personalized job matches.');
              } else if (err.response.status === 401) {
                setError('Please log in to view your job matches.');
              } else if (err.response.data && err.response.data.error) {
                setError(err.response.data.error);
              } else {
                setError('Failed to load job matches. Please try again later.');
              }
            } else {
              setError('Failed to load job matches. Please upload your CV to get personalized matches.');
            }
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchMatchedJobs();
    }
  }, [matchType, initialJobs, externalLoading, externalError, retryCount]);

  const toggleMatchType = () => {
    setRetryCount(0); // Reset retry count when manually switching
    setMatchType(prevType => prevType === 'standard' ? 'ai' : 'standard');
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${componentStyles.card.base} ${componentStyles.card.header} p-6`}
      >
        <h2 className={`${typography.fontSize.lg} font-semibold mb-4 flex items-center`}>
          <Briefcase className="h-5 w-5 text-indigo-500 mr-2" />
          Job Matches
        </h2>
        <div className="flex flex-col items-center justify-center h-48">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-gray-500 text-sm">Finding your perfect job matches...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${componentStyles.card.base}`}
      >
        <div className={componentStyles.card.header}>
          <h2 className={`${typography.fontSize.lg} font-semibold flex items-center`}>
            <Briefcase className="h-5 w-5 text-indigo-500 mr-2" />
            Job Matches
          </h2>
        </div>
        <div className={componentStyles.card.body}>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-amber-700">{error}</p>
              <div className="flex items-center mt-2">
                <Link 
                  to="/student/profile" 
                  className={`${componentStyles.button.base} ${componentStyles.button.sizes.sm} ${componentStyles.button.variants.secondary} mr-3`}
                >
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload CV
                </Link>
                <button 
                  onClick={toggleMatchType} 
                  className={`${componentStyles.button.base} ${componentStyles.button.sizes.sm} text-gray-600 hover:text-indigo-600 flex items-center`}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Try {matchType === 'ai' ? 'standard' : 'AI'} matching
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (matchedJobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${componentStyles.card.base}`}
      >
        <div className={componentStyles.card.header}>
          <h2 className={`${typography.fontSize.lg} font-semibold flex items-center`}>
            <Briefcase className="h-5 w-5 text-indigo-500 mr-2" />
            Job Matches
          </h2>
        </div>
        <div className={componentStyles.card.body}>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <Briefcase className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-gray-800 font-medium mb-2">No job matches found</h3>
            <p className="text-gray-600 mb-4">Upload or update your CV to get personalized job recommendations.</p>
            <Link 
              to="/student/profile" 
              className={`${componentStyles.button.base} ${componentStyles.button.sizes.md} ${componentStyles.button.variants.primary} inline-flex`}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload your CV
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${componentStyles.card.base}`}
      >
        <div className={componentStyles.card.header}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-indigo-500 mr-2" />
              <h2 className={`${typography.fontSize.lg} font-semibold`}>
                {matchType === 'ai' ? 'AI-Powered Job Matches' : 'Job Matches'}
              </h2>
              {matchType === 'ai' && (
                <div className="ml-2 bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleMatchType}
                className="text-xs text-gray-600 hover:text-indigo-600 flex items-center group"
              >
                <RefreshCw className="h-3 w-3 mr-1.5 group-hover:rotate-180 transition-transform duration-500" />
                Switch to {matchType === 'ai' ? 'standard' : 'AI'} matching
              </button>
            </div>
          </div>
        </div>

        <div className={componentStyles.card.body}>
          <div className="space-y-4">
            {matchedJobs.map((job) => (
              <JobMatchCard 
                key={job.id} 
                job={job} 
                onViewDetails={() => handleViewDetails(job)}
              />
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link 
              to="/student/job-matches" 
              className={`${componentStyles.button.base} ${componentStyles.button.sizes.md} text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 group`}
            >
              View all job matches
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <MatchDetails job={selectedJob} />
              </div>
              <button 
                onClick={handleCloseModal} 
                className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};