import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  Building2,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import type { Job } from '../../types/job';

interface ApplicationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  job: Job | null;
  resumeFilename?: string;
  resumeUrl?: string;
}

export function ApplicationConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  job,
  resumeFilename = 'My_Resume.pdf',
  resumeUrl,
}: ApplicationConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setError(null);
      setHasAttemptedSubmit(false);
    }
  }, [isOpen]);

  if (!job) return null;

  const handleConfirm = async () => {
    // Prevent double submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    setHasAttemptedSubmit(true);
    
    try {
      await onConfirm();
      // The parent component will handle closing the modal on success
    } catch (err: any) {
      console.error('Error submitting application:', err);
      
      // Handle specific error cases
      if (err?.response?.status === 400 && 
          (err?.response?.data?.detail === 'Already applied.' || 
           err?.response?.data?.message?.includes('already applied'))) {
        setError('You have already applied for this job.');
      } else if (err?.response?.status === 401) {
        setError('You must be logged in to apply for this job.');
      } else if (err?.response?.status === 403) {
        setError('You do not have permission to apply for this job.');
      } else if (err?.response?.status === 404) {
        setError('This job posting is no longer available.');
      } else if (err?.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Recent";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return "Recent";
    }
  };

  const handleClose = () => {
    // Don't allow closing during submission
    if (isSubmitting) return;
    onClose();
  };

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
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Confirm Your Application</h2>
              <button 
                onClick={handleClose}
                disabled={isSubmitting}
                className={`p-2 rounded-full ${
                  isSubmitting ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6">
                You are about to apply for the following position:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-4 mb-4">
                  {job.company.logo && (
                    <img
                      src={job.company.logo}
                      alt={job.company.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Building2 className="h-4 w-4 mr-1.5" />
                      {job.company.name}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1.5" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      Posted {formatDate(job.posted_at)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Resume</p>
                    <p className="text-xs text-gray-500">{resumeFilename}</p>
                  </div>
                  {resumeUrl && (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
                    >
                      <ExternalLink className="h-3 w-3 mr-1.5" />
                      View
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This resume will be shared with {job.company.name} along with your profile
                  information.
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {job.isApplied && !hasAttemptedSubmit && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6 flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-700 text-sm">
                    You have already applied for this job. Submitting again may overwrite your previous application.
              </p>
            </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
              <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium ${
                    isSubmitting ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
              >
                Cancel
              </button>
              <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Confirm & Apply'
                  )}
              </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                By submitting, you allow {job.company.name} to view your profile and resume.
                Please ensure your information is up to date before proceeding.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 