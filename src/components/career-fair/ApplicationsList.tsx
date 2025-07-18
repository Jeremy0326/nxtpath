import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Calendar, 
  Star, 
  ChevronRight, 
  ExternalLink,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  ChevronDown,
  ChevronUp,
  Building,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Application {
  id: string;
  company: string;
  logo: string;
  position: string;
  status: 'draft' | 'submitted' | 'in_progress' | 'completed';
  deadline?: string;
  matchScore: number;
  description?: string;
  requirements?: string[];
  location?: string;
}

interface ApplicationsListProps {
  applications: Application[];
  onUpdateStatus: (id: string, status: Application['status']) => void;
}

export function ApplicationsList({ applications, onUpdateStatus }: ApplicationsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getApplicationStatusLabel = (status: Application['status']) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'submitted': return 'Submitted';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
    }
  };

  const getApplicationStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
    }
  };

  const getApplicationStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'submitted': return <FileText className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Job Applications</h2>
        <div className="flex items-center space-x-3">
          <select className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="completed">Completed</option>
          </select>
          <Link 
            to="/jobs"
            className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
          >
            <Briefcase className="h-4 w-4 mr-1.5" />
            View All Jobs
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {applications.map((application) => (
          <motion.div
            key={application.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <img
                    src={application.logo}
                    alt={application.company}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{application.position}</h3>
                    <p className="text-sm text-gray-500">{application.company}</p>
                    
                    {application.deadline && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        Deadline: {application.deadline}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getApplicationStatusColor(application.status)}`}>
                    {getApplicationStatusIcon(application.status)}
                    <span className="ml-1">{getApplicationStatusLabel(application.status)}</span>
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Star className="h-3 w-3 mr-1" />
                    {application.matchScore}% Match
                  </span>
                  <button
                    onClick={() => setExpandedId(expandedId === application.id ? null : application.id)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    {expandedId === application.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === application.id && (
              <div className="p-4 space-y-4">
                {application.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Job Description</h4>
                    <p className="text-sm text-gray-600">{application.description}</p>
                  </div>
                )}

                {application.requirements && application.requirements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Requirements</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {application.requirements.map((req, index) => (
                        <li key={index} className="text-sm text-gray-600">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {application.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {application.location}
                  </div>
                )}

                <div className="mt-4 flex justify-end space-x-2">
                  <Link
                    to={`/jobs/${application.id}`}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    View Job
                  </Link>
                  
                  {application.status === 'draft' && (
                    <Link
                      to={`/jobs/${application.id}/apply`}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                      Continue Application
                    </Link>
                  )}
                  
                  {application.status === 'in_progress' && (
                    <Link
                      to={`/jobs/${application.id}/apply`}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                      Complete Application
                    </Link>
                  )}
                  
                  {application.status === 'submitted' && (
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                      View Status
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}