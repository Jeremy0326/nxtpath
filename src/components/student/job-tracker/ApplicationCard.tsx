import { motion } from 'framer-motion';
import { Building, MapPin, Briefcase, Clock, AlertTriangle, Play, Loader2 } from 'lucide-react';
import { Application } from '../../../types/job';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

interface ApplicationCardProps {
  application: Application;
  onWithdraw: (applicationId: string) => void;
  onStartInterview: (application: Application) => void;
  onViewJobDetails: (application: Application) => void;
  isWithdrawing: boolean;
}

// Normalize backend status to one of: 'applied', 'interviewed', 'offered', 'rejected'
function normalizeStatus(status: string): 'applied' | 'interviewed' | 'offered' | 'rejected' {
  switch (status) {
    case 'applied':
      return 'applied';
    case 'interviewed':
      return 'interviewed';
    case 'offered':
      return 'offered';
    case 'rejected':
      return 'rejected';
    default:
      return 'applied';
  }
}



export function ApplicationCard({
  application,
  onWithdraw,
  onStartInterview,

  onViewJobDetails,
  isWithdrawing,

}: ApplicationCardProps) {
  const { job } = application;
  const status = normalizeStatus(application.status);

  const statusStyles: { [key: string]: string } = {
    applied: 'bg-blue-100 text-blue-800',
    interviewed: 'bg-purple-100 text-purple-800',
    offered: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  const statusLabels: { [key: string]: string } = {
    applied: 'Applied',
    interviewed: 'Interviewed',
    offered: 'Offered',
    rejected: 'Rejected',
  };

  // Only show start interview for 'applied'.
  const renderInterviewActions = () => {
    if (status === 'applied') {
      return <Button onClick={() => onStartInterview(application)} size="sm" className="w-full"><Play className="mr-2 h-4 w-4" />Start AI Interview</Button>;
    }
    return null;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-800">{job.title}</h3>
          <Badge className={`${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>{statusLabels[status] || status}</Badge>
        </div>
        <p className="text-sm text-gray-500 flex items-center mt-1"><Building className="h-4 w-4 mr-2" />{job.company.name}</p>
        </div>

      {/* Body */}
      <div className="p-4 space-y-3 flex-grow">
        <div className="text-sm text-gray-600 flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-400" /> {job.location}</div>
        <div className="text-sm text-gray-600 flex items-center"><Briefcase className="h-4 w-4 mr-2 text-gray-400" /> {job.job_type}</div>
        <div className="text-sm text-gray-600 flex items-center"><Clock className="h-4 w-4 mr-2 text-gray-400" /> Applied {application.created_at ? new Date(application.created_at).toLocaleDateString() : ''}</div>
      </div>
      {/* AI Interview Section */}
      <div className="p-4 bg-gray-50/50 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-gray-700">AI Interview Status</h4>
                <span className="text-xs font-medium text-gray-600">
            {status === 'applied' && 'Ready to Start'}
            {status === 'interviewed' && 'Completed'}
            {status === 'offered' && 'Offered'}
            {status === 'rejected' && 'Rejected'}
                </span>
          </div>
          {renderInterviewActions()}
      </div>
      {/* Footer Actions */}
      <div className="p-3 border-t border-gray-100 flex items-center justify-end">
        <Button
            variant="ghost"
            size="sm"
            onClick={() => onWithdraw(application.id)}
            disabled={isWithdrawing}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
            {isWithdrawing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
            Withdraw
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewJobDetails(application)}
        >
          View Job Details
        </Button>
    </div>
    </motion.div>
  );
}