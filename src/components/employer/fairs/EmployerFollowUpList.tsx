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
  Star,
  Building,
  Briefcase,
  Send
} from 'lucide-react';

interface FollowUp {
  id: string;
  student: {
    name: string;
    university: string;
    major: string;
    email: string;
  };
  status: 'pending' | 'contacted' | 'responded' | 'completed';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  lastActivity: string;
  meetingDetails?: {
    date: string;
    topics: string[];
  };
}

interface EmployerFollowUpListProps {
  followUps: FollowUp[];
  onUpdateStatus: (id: string, status: FollowUp['status']) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}

export function EmployerFollowUpList({
  followUps,
  onUpdateStatus,
  onUpdateNotes,
  onDelete
}: EmployerFollowUpListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>('');

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

  const handleEditNotes = (id: string, currentNotes: string = '') => {
    setEditingNotes(id);
    setNotesText(currentNotes);
  };

  const handleSaveNotes = (id: string) => {
    onUpdateNotes(id, notesText);
    setEditingNotes(null);
  };

  const handleSendEmail = (followUp: FollowUp) => {
    console.log('Sending email to:', followUp.student.email);
    // Implement email sending logic
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Student Follow-ups</h2>
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
            Batch Email
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
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-indigo-600">{followUp.student.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{followUp.student.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Building className="h-4 w-4 mr-1" />
                      <span>{followUp.student.university}</span>
                      <span className="mx-1.5">•</span>
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>{followUp.student.major}</span>
                    </div>
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
              {editingNotes === followUp.id ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingNotes(null)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveNotes(followUp.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              ) : (
                followUp.notes && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                      <button
                        onClick={() => handleEditNotes(followUp.id, followUp.notes)}
                        className="text-xs text-indigo-600 hover:text-indigo-500"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{followUp.notes}</p>
                  </div>
                )
              )}

              {followUp.meetingDetails && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Meeting Details</h4>
                  <p className="text-sm text-gray-600">Date: {followUp.meetingDetails.date}</p>
                  {followUp.meetingDetails.topics.length > 0 && (
                    <div className="mt-1">
                      <p className="text-sm text-gray-600">Topics Discussed:</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {followUp.meetingDetails.topics.map((topic, index) => (
                          <li key={index} className="text-sm text-gray-600">{topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
                  {!followUp.notes && (
                    <button
                      onClick={() => handleEditNotes(followUp.id)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      <Edit className="h-4 w-4 inline-block mr-1.5" />
                      Add Notes
                    </button>
                  )}
                  <button
                    onClick={() => handleSendEmail(followUp)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    <Send className="h-4 w-4 mr-1.5" />
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}