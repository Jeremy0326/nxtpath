import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Briefcase, 
  Award, 
  Calendar, 
  ChevronRight, 
  Upload, 
  Bell, 
  X, 
  User
} from 'lucide-react';
import { JobList } from '../jobs/JobList';
import { JobDetails } from '../jobs/JobDetails';
import { CVUpload } from '../cv/CVUpload';
import { CVAnalysisResults } from '../cv/CVAnalysisResults';
import { JobMatchingPanel } from './JobMatchingPanel';
import { CareerReadinessPanel } from './CareerReadinessPanel';
import { ApplicationTracker } from './ApplicationTracker';
import type { Job } from '../../types/job';
import type { CVAnalysisResult } from '../../types/cv';
import { useToast } from '../../hooks/useToast';
import { colors, componentStyles, typography, layout } from '../../lib/design-system';

export function StudentDashboard() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showCVUpload, setShowCVUpload] = useState(false);
  const [cvAnalysis, setCVAnalysis] = useState<CVAnalysisResult | null>(null);
  const { addToast } = useToast();

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const handleJobClose = () => {
    setShowJobDetails(false);
    setSelectedJob(null);
  };

  const handleJobApply = async () => {
    if (!selectedJob) return;

    try {
      // TODO: Implement job application logic
      addToast({
        title: 'Application Submitted',
        description: `Your application for ${selectedJob.title} has been submitted successfully.`,
      });
    } catch (error) {
      addToast({
        title: 'Application Failed',
        description: 'Failed to submit your application. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleJobSave = async () => {
    if (!selectedJob) return;

    try {
      // TODO: Implement job saving logic
      addToast({
        title: 'Job Saved',
        description: `${selectedJob.title} has been saved to your bookmarks.`,
      });
    } catch (error) {
      addToast({
        title: 'Failed to Save',
        description: 'Failed to save the job. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCVAnalysisComplete = (analysis: CVAnalysisResult) => {
    setCVAnalysis(analysis);
    setShowCVUpload(false);
    addToast({
      title: 'CV Analysis Complete',
      description: 'Your CV has been successfully analyzed.',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`${layout.container} py-8`}>
        <div className="mb-8">
          <h1 className={`${typography.fontSize['3xl']} font-bold text-gray-900`}>Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's an overview of your job search progress.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${componentStyles.card.base} p-5`}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2.5 bg-indigo-100 rounded-lg">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Applications</p>
                    <p className="text-2xl font-semibold text-gray-900">12</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`${componentStyles.card.base} p-5`}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2.5 bg-green-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Saved Jobs</p>
                    <p className="text-2xl font-semibold text-gray-900">8</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`${componentStyles.card.base} p-5`}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2.5 bg-amber-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                    <p className="text-2xl font-semibold text-gray-900">3</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Job Matching Panel */}
            <JobMatchingPanel />

            {/* Application Tracker */}
            <ApplicationTracker />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${componentStyles.card.base}`}
            >
              <div className={`${componentStyles.card.header} flex items-center justify-between`}>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-indigo-500 mr-2" />
                  <h2 className={`${typography.fontSize.lg} font-semibold text-gray-900`}>Profile Summary</h2>
                </div>
                <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                  Edit Profile
                  <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </button>
              </div>
              <div className={componentStyles.card.body}>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-indigo-600">JS</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">John Smith</h3>
                  <p className="text-sm text-gray-500 mb-4">Computer Science Student</p>
                  
                  <div className="w-full border-t border-gray-100 pt-4 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">Profile Completion</span>
                      <span className="text-sm font-medium text-indigo-600">85%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CV Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`${componentStyles.card.base}`}
            >
              <div className={`${componentStyles.card.header} flex items-center justify-between`}>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                  <h2 className={`${typography.fontSize.lg} font-semibold text-gray-900`}>CV Analysis</h2>
                </div>
              </div>
              <div className={componentStyles.card.body}>
                {!showCVUpload && !cvAnalysis && (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4">
                      <Upload className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-gray-800 font-medium mb-2">No CV Uploaded</h3>
                    <p className="text-gray-500 mb-4 text-sm">Upload your CV to get personalized job recommendations and insights.</p>
                    <button
                      onClick={() => setShowCVUpload(true)}
                      className={`${componentStyles.button.base} ${componentStyles.button.sizes.md} ${componentStyles.button.variants.primary}`}
                    >
                      Upload CV
                    </button>
                  </div>
                )}

                {showCVUpload && (
                  <CVUpload onAnalysisComplete={handleCVAnalysisComplete} />
                )}

                {cvAnalysis && (
                  <CVAnalysisResults analysis={cvAnalysis} />
                )}
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${componentStyles.card.base}`}
            >
              <div className={`${componentStyles.card.header} flex items-center justify-between`}>
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-indigo-500 mr-2" />
                  <h2 className={`${typography.fontSize.lg} font-semibold text-gray-900`}>Notifications</h2>
                </div>
                <span className={`${componentStyles.badge.base} ${componentStyles.badge.variants.indigo}`}>3 new</span>
              </div>
              <div className={componentStyles.card.body}>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New job match found</p>
                      <p className="text-xs text-gray-500 mt-1">A new job matching your profile was posted 2 hours ago.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Application status update</p>
                      <p className="text-xs text-gray-500 mt-1">Your application for Software Engineer has moved to the interview stage.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Career fair reminder</p>
                      <p className="text-xs text-gray-500 mt-1">The Spring Tech Career Fair is happening tomorrow.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && showJobDetails && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleJobClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className={`${typography.fontSize.xl} font-semibold text-gray-900`}>Job Details</h2>
              <button 
                onClick={handleJobClose}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-0 max-h-[calc(90vh-5rem)]">
              <JobDetails
                job={selectedJob}
                isOpen={showJobDetails}
                onClose={handleJobClose}
                onApply={handleJobApply}
                onSave={handleJobSave}
                showMatchMatrix={!!cvAnalysis}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 