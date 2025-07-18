import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Clock,
  Building,
  Target,
  ChevronRight,
  BarChart2,
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobPosition {
  id: string;
  title: string;
  type: string;
  location: string;
  description: string;
  requirements: string[];
  matchScore?: number;
  matchAnalysis?: {
    skills: {
      name: string;
      match: boolean;
      experience?: string;
      required?: boolean;
    }[];
    experience: {
      required: string;
      actual: string;
      match: boolean;
    };
    education: {
      required: string;
      actual: string;
      match: boolean;
    };
  };
}

interface JobPositionDetailsProps {
  position: JobPosition;
  companyName: string;
  onClose: () => void;
  onApply: () => void;
}

export function JobPositionDetails({
  position,
  companyName,
  onClose,
  onApply,
}: JobPositionDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
    >
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{position.title}</h2>
                <p className="mt-1 text-white/80">{companyName}</p>
              </div>
              {position.matchScore && (
                <div className="flex items-center px-3 py-1 rounded-full bg-white/10 text-white">
                  <Star className="h-4 w-4 mr-1.5" />
                  {position.matchScore}% Match
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  {position.type}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-1.5" />
                  {companyName}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  {position.location}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Position Overview</h3>
              <p className="text-gray-600">{position.description}</p>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Requirements</h3>
              <ul className="space-y-2">
                {position.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span className="text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Match Analysis */}
            {position.matchAnalysis && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Match Analysis</h3>
                
                {/* Skills Match */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">Skills Match</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {position.matchAnalysis.skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {skill.match ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                          )}
                          <span className="text-sm text-gray-900">
                            {skill.name}
                            {skill.required && (
                              <span className="ml-2 text-xs text-red-500">Required</span>
                            )}
                          </span>
                        </div>
                        {skill.experience && (
                          <span className="text-sm text-gray-500">{skill.experience}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience & Education */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Experience</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Required: {position.matchAnalysis.experience.required}</p>
                        <p className="text-sm text-gray-600">Your Experience: {position.matchAnalysis.experience.actual}</p>
                      </div>
                      {position.matchAnalysis.experience.match ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Education</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Required: {position.matchAnalysis.education.required}</p>
                        <p className="text-sm text-gray-600">Your Education: {position.matchAnalysis.education.actual}</p>
                      </div>
                      {position.matchAnalysis.education.match ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <div className="flex space-x-3">
              <Link
                to={`/jobs/${position.id}`}
                className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                View Full Details
              </Link>
              <button
                onClick={onApply}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Apply Now
                <ChevronRight className="ml-1.5 h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}