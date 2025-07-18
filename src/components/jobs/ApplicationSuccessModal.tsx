import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Calendar, Share2, ArrowRight, MapPin, Briefcase } from 'lucide-react';
import type { Job } from '../../types/job';

interface ApplicationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onViewApplications: () => void;
}

export function ApplicationSuccessModal({
  isOpen,
  onClose,
  job,
  onViewApplications,
}: ApplicationSuccessModalProps) {
  if (!job) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "Recent";
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Recent";
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Recent";
    }
  };

  const applicationDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            {/* Header with close button */}
            <div className="flex justify-end p-4">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Success content */}
            <div className="px-8 pb-8 pt-2 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Application Submitted!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Your application for <span className="font-semibold">{job.title}</span> at{' '}
                <span className="font-semibold">{job.company.name}</span> has been successfully submitted.
              </p>

              {/* Job card summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-center space-x-3 mb-3">
                  {job.company.logo && (
                    <img 
                      src={job.company.logo} 
                      alt={job.company.name} 
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.company.name}</p>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span>Application date: {applicationDate}</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Status: Under Review
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Next steps:</span>
                </div>
                <ul className="space-y-3 text-left">
                  <li className="flex items-start">
                    <span className="h-2 w-2 rounded-full bg-blue-500 mr-3 mt-2.5 flex-shrink-0"></span>
                    <span className="text-gray-700">The employer will review your application</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-2 w-2 rounded-full bg-blue-500 mr-3 mt-2.5 flex-shrink-0"></span>
                    <span className="text-gray-700">You'll receive a notification if you're selected for an interview</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-2 w-2 rounded-full bg-blue-500 mr-3 mt-2.5 flex-shrink-0"></span>
                    <span className="text-gray-700">Track your application status in the Applications section</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Continue Browsing
                </button>
                <button
                  onClick={onViewApplications}
                  className="flex-1 px-4 py-2.5 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  View Applications
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 