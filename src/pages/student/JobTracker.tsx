import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Inbox } from 'lucide-react';
import { ApplicationStats } from '../../components/student/ApplicationStats';
import { ApplicationCard } from '../../components/student/ApplicationCard';
import { useApplicationStore } from '../../stores/applicationStore';
import { useToast } from '../../hooks/useToast';
import type { Job } from '../../types/models';
import type { FrontendApplication } from '../../types/components';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { JobDetailsModal } from '../../components/jobs/JobDetailsModal';

export function JobTracker() {
  const {
    applications,
    isLoading,
    error,
    withdrawingIds,
    fetchApplications,
    withdrawApplication,
  } = useApplicationStore();
  
  const navigate = useNavigate();
  const { addToast } = useToast();


  // States for the new modals
  const [jobToView, setJobToView] = useState<Job | null>(null);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<FrontendApplication | null>(null);


  useEffect(() => {
    fetchApplications();
    
    // Re-fetch applications when the window gains focus
    const handleFocus = () => fetchApplications();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchApplications]);

  const handleWithdraw = async () => {
    if (!applicationToWithdraw) return;

    try {
      await withdrawApplication(applicationToWithdraw.id);
      addToast({
        title: 'Application Withdrawn',
        description: 'You have successfully withdrawn your application.',
        variant: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Withdrawal Failed',
        description: 'Could not withdraw application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setApplicationToWithdraw(null); // Close the confirmation modal
    }
  };

  const handleStartInterview = (app: FrontendApplication) => {
    navigate(`/student/interview/${app.id}`);
  };



  const handleViewJobDetails = (app: FrontendApplication) => {
    setJobToView(app.job);
  };

  const handleCloseModals = () => {
    fetchApplications(); // Re-fetch to update status
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <h3 className="font-semibold">Error Loading Applications</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Application Hub</h1>
        </div>

        <ApplicationStats applications={applications} />

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Applications</h2>
          {applications.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <Inbox className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No applications yet.</h3>
              <p className="mt-1 text-sm text-gray-500">When you apply for jobs, they'll appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {applications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onWithdraw={() => setApplicationToWithdraw(app)}
                  onStartInterview={handleStartInterview}
                  onViewJobDetails={handleViewJobDetails}
                  isWithdrawing={withdrawingIds.has(app.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {jobToView && (
        <JobDetailsModal
            job={jobToView}
            isOpen={!!jobToView}
            onClose={() => setJobToView(null)}
        />
      )}

      {applicationToWithdraw && (
        <ConfirmationModal
          isOpen={!!applicationToWithdraw}
          onClose={() => setApplicationToWithdraw(null)}
          onConfirm={handleWithdraw}
          title="Confirm Withdrawal"
          description={`Are you sure you want to withdraw your application for ${applicationToWithdraw.job.title}? This action cannot be undone.`}
          confirmText="Withdraw"
        />
      )}
    </>
  );
}