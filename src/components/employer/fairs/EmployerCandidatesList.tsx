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
  MapPin,
  Download,
  MessageSquare,
  User,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Candidate {
  id: string;
  name: string;
  university: string;
  major: string;
  visitTime: string;
  resumeUrl: string;
  matchScore: number;
  status: 'new' | 'contacted' | 'interviewing' | 'offered' | 'rejected';
  notes?: string;
}

interface EmployerCandidatesListProps {
  candidates: Candidate[];
  onUpdateStatus: (id: string, status: Candidate['status']) => void;
}

export function EmployerCandidatesList({ candidates, onUpdateStatus }: EmployerCandidatesListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>('');

  const getCandidateStatusLabel = (status: Candidate['status']) => {
    switch (status) {
      case 'new': return 'New';
      case 'contacted': return 'Contacted';
      case 'interviewing': return 'Interviewing';
      case 'offered': return 'Offered';
      case 'rejected': return 'Rejected';
    }
  };

  const getCandidateStatusColor = (status: Candidate['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-indigo-100 text-indigo-800';
      case 'interviewing': return 'bg-purple-100 text-purple-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
    }
  };

  const getCandidateStatusIcon = (status: Candidate['status']) => {
    switch (status) {
      case 'new': return <AlertCircle className="h-4 w-4" />;
      case 'contacted': return <Mail className="h-4 w-4" />;
      case 'interviewing': return <Calendar className="h-4 w-4" />;
      case 'offered': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleEditNotes = (id: string, currentNotes: string = '') => {
    setEditingNotes(id);
    setNotesText(currentNotes);
  };

  const handleSaveNotes = (id: string) => {
    // Implement save notes logic
    console.log('Saving notes for candidate', id, notesText);
    setEditingNotes(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Potential Candidates</h2>
        <div className="flex items-center space-x-3">
          <select className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interviewing">Interviewing</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
            <Download className="h-4 w-4 mr-1.5" />
            Export List
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {candidates.map((candidate) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{candidate.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1.5" />
                        {candidate.university}
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1.5" />
                        {candidate.major}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1.5" />
                        Visited at {candidate.visitTime}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCandidateStatusColor(candidate.status)}`}>
                    {getCandidateStatusIcon(candidate.status)}
                    <span className="ml-1">{getCandidateStatusLabel(candidate.status)}</span>
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Star className="h-3 w-3 mr-1" />
                    {candidate.matchScore}% Match
                  </span>
                  <button
                    onClick={() => setExpandedId(expandedId === candidate.id ? null : candidate.id)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    {expandedId === candidate.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === candidate.id && (
              <div className="p-4 space-y-4">
                {editingNotes === candidate.id ? (
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
                        onClick={() => handleSaveNotes(candidate.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  candidate.notes ? (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                        <button
                          onClick={() => handleEditNotes(candidate.id, candidate.notes)}
                          className="text-xs text-indigo-600 hover:text-indigo-500"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{candidate.notes}</p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <button
                        onClick={() => handleEditNotes(candidate.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        + Add Notes
                      </button>
                    </div>
                  )
                )}

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {(['new', 'contacted', 'interviewing', 'offered', 'rejected'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => onUpdateStatus(candidate.id, status)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                          candidate.status === status
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getCandidateStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
                    <FileText className="h-4 w-4 mr-1.5" />
                    View Resume
                  </button>
                  <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    Schedule Interview
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <MessageSquare className="h-4 w-4 mr-1.5" />
                    Contact Candidate
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}