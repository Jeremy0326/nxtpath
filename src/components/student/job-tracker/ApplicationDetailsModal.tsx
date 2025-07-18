import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Send, Briefcase } from 'lucide-react';
import { Application } from '../../../types/job';
import { JobDetails } from '../../jobs/JobDetails'; // Reusing for consistent UI
import { useState } from 'react';
import { jobService } from '../../../services/jobService';
import { InterviewReport } from '../../interview/InterviewReport';

interface ApplicationDetailsModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationDetailsModal({ application, isOpen, onClose }: ApplicationDetailsModalProps) {
  if (!application) {
    return null;
  }

  const [interviewModal, setInterviewModal] = useState<{ interviewId: string } | null>(null);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewError, setInterviewError] = useState<string | null>(null);

  const handleStartInterview = async () => {
    setInterviewLoading(true);
    setInterviewError(null);
    try {
      const data = await jobService.startInterview(application.id);
      setInterviewModal({ interviewId: data.interview_id });
    } catch (err) {
      setInterviewError('Failed to start AI interview. Please try again later.');
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleContinueInterview = () => {
    if (application.interview_id) {
      setInterviewModal({ interviewId: application.interview_id });
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return { icon: Send, color: 'text-blue-500', text: 'Application Sent' };
      case 'interviewed':
        return { icon: Briefcase, color: 'text-purple-500', text: 'Interviewed' };
      case 'offered':
        return { icon: CheckCircle, color: 'text-green-500', text: 'Offer received' };
      case 'rejected':
        return { icon: X, color: 'text-red-500', text: 'Application was not successful' };
      default:
        return { icon: AlertCircle, color: 'text-gray-500', text: 'Unknown status' };
    }
  };

  const statusInfo = getStatusInfo(application.status);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ y: '100vh' }}
            animate={{ y: 0 }}
            exit={{ y: '100vh' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Application Details</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto">
              {/* Application Status Banner */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex items-center space-x-3">
                  <statusInfo.icon className={`h-6 w-6 ${statusInfo.color}`} />
                  <div>
                    <p className="font-semibold text-gray-800">{statusInfo.text}</p>
                    <p className="text-sm text-gray-500">
                      Last updated: {new Date(application.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {/* AI Interview Section */}
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-indigo-700 mb-2">AI Interview</h4>
                  {application.interview_status === 'COMPLETED' && application.interview_id ? (
                    <button
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                      onClick={handleContinueInterview}
                    >
                      Continue AI Interview
                    </button>
                  ) : application.interview_status === 'IN_PROGRESS' && application.interview_id ? (
                    <button
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                      onClick={handleContinueInterview}
                    >
                      Continue AI Interview
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700"
                      onClick={handleStartInterview}
                      disabled={interviewLoading}
                    >
                      {interviewLoading ? 'Starting...' : 'Start AI Interview'}
                    </button>
                  )}
                  {interviewError && (
                    <div className="mt-2 text-xs text-red-600">{interviewError}</div>
                  )}
                </div>
              </div>

              {/* Re-using JobDetails for the main content */}
              <JobDetails
                job={application.job}
                isOpen={true} // It's always "open" inside this modal
                onClose={() => {}} // No-op since we control closing from the modal
                onApply={() => {}} // No apply action here
                onSave={() => {}} // No save action here
                isSaved={false}
              />
              {/* AI Interview Modal */}
              {interviewModal && (
                <InterviewReport
                  applicationId={interviewModal.interviewId}
                  onClose={() => setInterviewModal(null)}
                  onRetake={handleStartInterview}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 