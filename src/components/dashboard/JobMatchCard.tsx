import React from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../../types/job';
import { MapPin, Briefcase, Star, Sparkles, Eye, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors, componentStyles, typography } from '../../lib/design-system';

interface JobMatchCardProps {
  job: Job;
  onViewDetails: () => void;
}

export const JobMatchCard: React.FC<JobMatchCardProps> = ({ job, onViewDetails }) => {
  // Format the match score to ensure it's a whole number
  const matchScore = job.matchScore ? Math.round(job.matchScore) : null;
  
  // Determine match score color based on the score value
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 text-green-700';
    if (score >= 60) return 'bg-blue-50 text-blue-700';
    return 'bg-amber-50 text-amber-700';
  };
  
  // Determine match score icon fill based on the score value
  const getMatchScoreIconColor = (score: number) => {
    if (score >= 80) return 'fill-green-500 text-green-500';
    if (score >= 60) return 'fill-blue-500 text-blue-500';
    return 'fill-amber-500 text-amber-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${componentStyles.card.base} ${componentStyles.card.hover} flex flex-col h-full`}
    >
      <div className="flex-grow p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {job.company?.logo_url && (
              <div className="mb-3 h-10 w-10 rounded-md bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                <img 
                  src={job.company.logo_url} 
                  alt={`${job.company.name} logo`} 
                  className="h-8 w-8 object-contain" 
                />
              </div>
            )}
            <h3 className={`font-semibold text-gray-900 ${typography.fontSize.lg}`}>
              <Link to={`/jobs/${job.id}`} className="hover:text-indigo-600 transition-colors">
                {job.title}
              </Link>
            </h3>
            <p className="text-sm text-gray-600 mt-1 flex items-center">
              {job.company?.name}
              {job.posted_date && (
                <>
                  <span className="mx-2 text-gray-300">•</span>
                  <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                  <span className="text-xs text-gray-500">Posted {job.posted_date}</span>
                </>
              )}
            </p>
          </div>
          
          {matchScore && (
            <div className={`flex items-center ${getMatchScoreColor(matchScore)} text-xs font-medium px-2.5 py-1.5 rounded-full`}>
              <Star className={`h-3 w-3 mr-1 ${getMatchScoreIconColor(matchScore)}`} />
              <span>{matchScore}% Match</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center text-sm text-gray-500 gap-3">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-1.5 text-gray-400" />
            <span>{job.job_type || job.type}</span>
          </div>
        </div>

        {job.highlightedSkills && job.highlightedSkills.length > 0 && (
          <div className="mt-4 flex items-center">
            <Sparkles className="h-4 w-4 mr-1.5 text-indigo-500 flex-shrink-0" />
            <span className="text-xs text-gray-600">
              <span className="font-medium text-gray-700">Matching skills:</span>{' '}
              {job.highlightedSkills.slice(0, 3).join(', ')}
              {job.highlightedSkills.length > 3 && ` +${job.highlightedSkills.length - 3} more`}
            </span>
          </div>
        )}
        
        {job.missingSkills && job.missingSkills.length > 0 && (
          <div className="mt-2 flex items-center">
            <div className="h-4 w-4 mr-1.5 rounded-full border border-amber-300 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-500 text-xs font-bold">!</span>
            </div>
            <span className="text-xs text-gray-600">
              <span className="font-medium text-gray-700">Consider improving:</span>{' '}
              {job.missingSkills.slice(0, 2).join(', ')}
              {job.missingSkills.length > 2 && ` +${job.missingSkills.length - 2} more`}
            </span>
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {job.isApplied ? (
            <span className="inline-flex items-center text-green-600">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
              Applied
            </span>
          ) : job.application_deadline ? (
            <span className="inline-flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
              Deadline: {job.application_deadline}
            </span>
          ) : null}
        </div>
        
        <button
          onClick={onViewDetails}
          className={`${componentStyles.button.base} ${componentStyles.button.sizes.sm} text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 focus:ring-indigo-500 group`}
        >
          View Match Details
          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}; 