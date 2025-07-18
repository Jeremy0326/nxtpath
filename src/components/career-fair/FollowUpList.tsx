import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';
import { FollowUpEmailTemplate } from './FollowUpEmailTemplate';

interface FollowUp {
  id: string;
  company: string;
  logo: string;
  contactName: string;
  contactTitle: string;
  status: 'pending' | 'contacted' | 'responded' | 'completed';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  lastActivity: string;
  meetingDetails?: {
    date: string;
    topics: string[];
  };
}

interface FollowUpListProps {
  followUps: FollowUp[];
  onUpdateStatus: (id: string, status: FollowUp['status']) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}

export function FollowUpList({
  followUps,
  onUpdateStatus,
  onUpdateNotes,
  onDelete
}: FollowUpListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{
    name: string;
    title: string;
    company: string;
  } | null>(null);
  const [selectedMeetingDetails, setSelectedMeetingDetails] = useState<{
    date: string;
    topics: string[];
  } | null>(null);

  const getStatusLabel = (status: FollowUp['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'contacted': return 'Contacted';
      case 'responded': return 'Responded';
      case 'completed': return 'Completed';
    }
  };

  const getStatusColor = (status: FollowUp['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'responded': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
    }
  };

  const getStatusIcon = (status: FollowUp['status']) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'contacted': return <Mail className="h-4 w-4" />;
      case 'responded': return <MessageSquare className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: FollowUp['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const handleSendEmail = (followUp: FollowUp) => {
    setSelectedContact({
      name: followUp.contactName,
      title: followUp.contactTitle,
      company: followUp.company
    });
    setSelectedMeetingDetails(followUp.meetingDetails || null);
    setShowEmailTemplate(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Recruiter Follow-ups</h2>
        <div className="flex items-center space-x-3">
          <select className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="responded">Responded</option>
            <option value="completed">Completed</option>
          </select>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
            <Mail className="h-4 w-4 mr-1.5" />
            Compose Email
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {followUps.map((followUp) => (
          <motion.div
            key={followUp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={followUp.logo}
                    alt={followUp.company}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{followUp.company}</h3>
                    <p className="text-sm text-gray-500">{followUp.contactName} • {followUp.contactTitle}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(followUp.status)}`}>
                    {getStatusIcon(followUp.status)}
                    <span className="ml-1">{getStatusLabel(followUp.status)}</span>
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(followUp.priority)}`}>
                    {followUp.priority.charAt(0).toUpperCase() + followUp.priority.slice(1)} Priority
                  </span>
                  <button
                    onClick={() => setExpandedId(expandedId === followUp.id ? null : followUp.id)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    {expandedId === followUp.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className={`p-4 ${expandedId === followUp.id ? 'block' : 'hidden'}`}>
              {followUp.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                  <p className="text-sm text-gray-600">{followUp.notes}</p>
                </div>
              )}

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'contacted', 'responded', 'completed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => onUpdateStatus(followUp.id, status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                        followUp.status === status
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Last activity: {followUp.lastActivity}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {}}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="h-4 w-4 inline-block mr-1.5" />
                    Edit Notes
                  </button>
                  <button
                    onClick={() => handleSendEmail(followUp)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    <Mail className="h-4 w-4 mr-1.5" />
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Email Template Modal */}
      {showEmailTemplate && selectedContact && (
        <FollowUpEmailTemplate
          isOpen={showEmailTemplate}
          onClose={() => setShowEmailTemplate(false)}
          contact={selectedContact}
          meetingDetails={selectedMeetingDetails || undefined}
        />
      )}
    </div>
  );
}