import React from 'react';
import { motion } from 'framer-motion';
import type { ExtendedJob } from '../../types/components';
import { MapPin, Building, Calendar, DollarSign, Users, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface EnhancedJobCardProps {
  job: Job;
  onApply: (jobId: string) => void;
  isApplying?: boolean;
}

const EnhancedJobCard: React.FC<EnhancedJobCardProps> = ({ job, onApply, isApplying = false }) => {
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatSalary = () => {
    if (job.salary_min && job.salary_max) {
      return `${job.currency}${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`;
    }
    return 'Salary not specified';
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
      whileHover={{ y: -4 }}
      layout
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Building className="w-4 h-4 mr-2" />
              <span className="font-medium">{job.company.name}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{job.location}</span>
            </div>
          </div>
          
          {/* Match Score */}
          <div className="text-right ml-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(job.matchScore || 0)}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {job.matchScore || 0}%
            </div>
            {job.advanced_analysis && (
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getConfidenceColor(job.advanced_analysis.confidence_level)}`}>
                {job.advanced_analysis.confidence_level} Confidence
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="truncate">{formatSalary()}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>{job.applicants_count || 0} applicants</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
          {job.description}
        </p>

        {/* Skills Match */}
        {job.highlightedSkills && job.highlightedSkills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center text-green-600 text-sm font-medium mb-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Your Matching Skills
            </div>
            <div className="flex flex-wrap gap-2">
              {job.highlightedSkills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
              {job.highlightedSkills.length > 4 && (
                <span className="text-gray-500 text-xs">+{job.highlightedSkills.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {job.missingSkills && job.missingSkills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center text-yellow-600 text-sm font-medium mb-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              Skills to Develop
            </div>
            <div className="flex flex-wrap gap-2">
              {job.missingSkills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
              {job.missingSkills.length > 3 && (
                <span className="text-gray-500 text-xs">+{job.missingSkills.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Match Reasons */}
        {job.matchReasons && job.matchReasons.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Why this match?</div>
            <ul className="text-xs text-gray-600 space-y-1">
              {job.matchReasons.slice(0, 2).map((reason, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Analysis */}
        {job.advanced_analysis && (
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
            <div className="text-sm font-medium text-indigo-700 mb-2">AI Analysis</div>
            <p className="text-xs text-indigo-600 line-clamp-2">
              {job.advanced_analysis.reasoning}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Job Type:</span>
            <span className="text-xs font-medium text-gray-700">{job.job_type}</span>
          </div>
          
          <button
            onClick={() => onApply(job.id)}
            disabled={isApplying || job.isApplied}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
              job.isApplied
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : isApplying
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {job.isApplied ? (
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Applied
              </span>
            ) : isApplying ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Applying...
              </span>
            ) : (
              'Apply Now'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedJobCard; 