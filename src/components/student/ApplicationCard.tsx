import { motion } from 'framer-motion';
import { Building, MapPin, Briefcase, Clock, AlertTriangle, Play, Loader2, Star, Calendar, TrendingUp, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import type { FrontendApplication } from '../../types/components';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface ApplicationCardProps {
  application: FrontendApplication;
  onWithdraw: (applicationId: string) => void;
  onStartInterview: (application: FrontendApplication) => void;
  onViewJobDetails: (application: FrontendApplication) => void;
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

  const statusConfig = {
    applied: {
      label: 'Applied',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      icon: <Clock className="h-4 w-4" />,
      progress: 25
    },
    interviewed: {
      label: 'Interviewed',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      icon: <MessageSquare className="h-4 w-4" />,
      progress: 75
    },
    offered: {
      label: 'Offered',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      icon: <CheckCircle className="h-4 w-4" />,
      progress: 100
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      icon: <XCircle className="h-4 w-4" />,
      progress: 100
    }
  };

  const config = statusConfig[status];

  const renderInterviewActions = () => {
    if (status === 'applied') {
      return (
        <Button 
          onClick={() => onStartInterview(application)} 
          size="sm" 
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Play className="mr-2 h-4 w-4" />
          Start AI Interview
        </Button>
      );
    }
    return null;
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'applied':
        return 'Ready to Start';
      case 'interviewed':
        return 'Completed';
      case 'offered':
        return 'Congratulations!';
      case 'rejected':
        return 'Keep applying!';
      default:
        return '';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className={`${config.color} text-white border-0 shadow-lg flex items-center gap-1.5 px-3 py-1.5`}>
          {config.icon}
          {config.label}
        </Badge>
      </div>

      {/* Header with gradient background */}
      <div className={`${config.bgColor} p-6 border-b ${config.borderColor}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {job.title}
            </h3>
            <div className="flex items-center text-gray-600">
              <Building className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium">{job.company.name}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <motion.div 
            className={`h-2 rounded-full ${config.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${config.progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4 flex-grow">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center text-gray-700">
            <MapPin className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium">{job.location}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Briefcase className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium">{job.job_type.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Calendar className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium">
              Applied {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : ''}
            </span>
          </div>
        </div>

        {/* AI Interview Section */}
        <div className={`${config.bgColor} rounded-xl p-4 border ${config.borderColor}`}>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-indigo-500" />
              AI Interview Status
            </h4>
            <span className={`text-xs font-semibold ${config.textColor}`}>
              {getStatusMessage()}
            </span>
          </div>
          {renderInterviewActions()}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onWithdraw(application.id)}
            disabled={isWithdrawing}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-all"
          >
            {isWithdrawing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4" />
            )}
            Withdraw
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewJobDetails(application)}
            className="border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-all"
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}