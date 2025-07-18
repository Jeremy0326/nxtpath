import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, MessageSquare, Loader2, AlertCircle, PlayCircle, Briefcase, ChevronRight, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { useToast } from '../../hooks/useToast';
import { motion } from 'framer-motion';

interface Application {
  id: string;
  company: string;
  position: string;
  status: 'applied' | 'interviewed' | 'offered' | 'rejected';
  lastUpdated: string;
  nextStep?: string;
}

interface ApplicationTrackerProps {
  applications?: Application[];
  isLoading?: boolean;
  error?: string | null;
}

export function ApplicationTracker({ 
  applications: initialApplications,
  isLoading: externalLoading,
  error: externalError
}: ApplicationTrackerProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications || []);
  const [isLoading, setIsLoading] = useState(externalLoading !== undefined ? externalLoading : !initialApplications);
  const [error, setError] = useState<string | null>(externalError || null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Update from external props when they change
    if (externalLoading !== undefined) {
      setIsLoading(externalLoading);
    }

    if (externalError !== undefined) {
      setError(externalError);
    }
    
    if (initialApplications) {
      setApplications(initialApplications);
      return;
    }

    // Only fetch if not provided externally
    if (initialApplications === undefined && externalLoading === undefined) {
      const fetchApplications = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          const response = await jobService.getAppliedJobs();
          const fetchedApplications = response.results.map((app: any) => ({
            id: app.id,
            company: app.job.company.name,
            position: app.job.title,
            status: app.status,
            lastUpdated: new Date(app.updated_at).toLocaleDateString(),
            nextStep: getNextStep(app.status),
          }));
          
          setApplications(fetchedApplications);
          console.log('Fetched applications:', fetchedApplications);
        } catch (err: any) {
          console.error('Error fetching applications:', err);
          
          if (err.response) {
            if (err.response.status === 401) {
              setError('Please log in to view your applications.');
            } else if (err.response.data && err.response.data.error) {
              setError(err.response.data.error);
            } else {
              setError('Failed to load applications. Please try again later.');
            }
          } else {
            setError('Failed to load applications. Please try again later.');
          }
          
          addToast({
            title: 'Error Loading Applications',
            description: 'Failed to load your job applications.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchApplications();
    }
  }, [initialApplications, externalLoading, externalError, addToast]);

  const getNextStep = (status: string): string | undefined => {
    switch (status) {
      case 'applied':
        return 'Application submitted - AI interview pending';
      case 'interviewed':
        return 'Interview completed - awaiting decision';
      case 'offered':
        return 'Offer received - review and respond';
      case 'rejected':
        return 'Application not selected - keep applying';
      default:
        return undefined;
    }
  };

  const getStatusColor = (status: Application['status']) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800 border-blue-200',
      interviewed: 'bg-purple-100 text-purple-800 border-purple-200',
      offered: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status];
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'offered':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'interviewed':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusProgress = (status: Application['status']) => {
    const progressMap = {
      applied: 25,
      interviewed: 50,
      offered: 100,
      rejected: 100,
    };
    return progressMap[status];
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">Application Hub</h2>
          </div>
          <Link
            to="/student/applications"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="flex items-center justify-center h-40">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Loading your applications...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">Application Hub</h2>
          </div>
          <Link
            to="/student/applications"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-700 font-medium mb-1">Unable to load applications</p>
            <p className="text-yellow-600 text-sm mb-3">{error}</p>
            <Link 
              to="/jobs" 
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium inline-flex items-center bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-all"
            >
              <Briefcase className="h-4 w-4 mr-1.5" />
              Browse jobs
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (applications.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">Application Hub</h2>
          </div>
          <Link
            to="/student/applications"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-gray-900 font-medium mb-2">No applications yet</h3>
          <p className="text-gray-500 text-sm mb-4 max-w-sm mx-auto">Start applying to jobs to track your progress and get AI-powered interview preparation.</p>
          <Link 
            to="/jobs" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Browse available jobs
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900">Application Hub</h2>
        </div>
        <Link
          to="/student/applications"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
        >
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 divide-y divide-gray-100">
        {applications.slice(0, 5).map((application, index) => (
          <motion.div
            key={application.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-5 w-5 text-indigo-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {application.position}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{application.company}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {getStatusIcon(application.status)}
                    <span className="ml-1.5">
                      {application.status.charAt(0).toUpperCase() +
                        application.status.slice(1)}
                    </span>
                  </span>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Updated {application.lastUpdated}
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                  <div 
                    className={`h-1.5 rounded-full ${
                      application.status === 'rejected' ? 'bg-red-500' : 
                      application.status === 'offered' ? 'bg-green-500' : 'bg-indigo-500'
                    }`} 
                    style={{ width: `${getStatusProgress(application.status)}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  {application.nextStep && (
                    <div className="flex items-center text-xs text-gray-600">
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                      {application.nextStep}
                    </div>
                  )}
                  
                  {(application.status === 'applied' || application.status === 'interviewed') && (
                    <button
                      onClick={() => navigate(`/student/interview/${application.id}`)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
                      Start AI Interview
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {applications.length > 5 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <Link
            to="/student/applications"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center"
          >
            View {applications.length - 5} more applications
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}