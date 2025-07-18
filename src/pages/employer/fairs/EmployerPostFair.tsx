import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Users, 
  Clock, 
  Calendar, 
  MessageSquare,
  FileText,
  ArrowLeft,
  Download,
  BarChart2,
  Mail,
  CheckCircle,
  Star,
  Briefcase,
  ExternalLink,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { FairPhaseNavigation } from '../../../components/career-fair/FairPhaseNavigation';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { EmployerPostFairSummary } from '../../../components/employer/fairs/EmployerPostFairSummary';
import { EmployerFollowUpList } from '../../../components/employer/fairs/EmployerFollowUpList';
import { EmployerCandidatesList } from '../../../components/employer/fairs/EmployerCandidatesList';
import { EmployerNotesAndMaterials } from '../../../components/employer/fairs/EmployerNotesAndMaterials';

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

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'note' | 'document' | 'link';
  url?: string;
  author: string;
}

export function EmployerPostFair() {
  const { fairId } = useParams<{ fairId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'followups' | 'candidates' | 'notes'>('followups');
  
  const mockFairData = {
    id: fairId || '1',
    title: 'Spring Tech Career Fair 2024',
    date: 'March 20, 2024',
    visitors: 156,
    connections: 78,
    resumesCollected: 65,
    pendingFollowUps: 42,
    potentialCandidates: 28
  };
  
  const mockFollowUps: FollowUp[] = [
    {
      id: '1',
      student: {
        name: 'Alex Johnson',
        university: 'Stanford University',
        major: 'Computer Science',
        email: 'alex@example.com',
      },
      status: 'pending',
      priority: 'high',
      notes: 'Discussed software engineering roles, follow up about the senior position',
      lastActivity: '2 days ago',
      meetingDetails: {
        date: 'March 20, 2024',
        topics: ['Senior Software Engineer role', 'Remote work options', 'AI team expansion']
      }
    },
    {
      id: '2',
      student: {
        name: 'Sarah Wilson',
        university: 'MIT',
        major: 'Electrical Engineering',
        email: 'sarah@example.com',
      },
      status: 'contacted',
      priority: 'medium',
      lastActivity: '1 day ago',
      meetingDetails: {
        date: 'March 20, 2024',
        topics: ['Frontend Developer position', 'Tech stack discussion']
      }
    },
  ];

  const mockCandidates: Candidate[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      university: 'Stanford University',
      major: 'Computer Science',
      visitTime: '10:15 AM',
      resumeUrl: '#',
      matchScore: 95,
      status: 'new',
      notes: 'Strong technical skills, particularly in React and Node.js',
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      university: 'MIT',
      major: 'Electrical Engineering',
      visitTime: '10:45 AM',
      resumeUrl: '#',
      matchScore: 88,
      status: 'contacted',
      notes: 'Interested in our hardware team, has relevant internship experience',
    },
  ];

  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'Career Fair Summary',
      content: 'Overall, the career fair was a success. We had strong interest in our software engineering and product management roles. Many students were interested in our remote work options and AI initiatives.',
      date: 'March 20, 2024',
      type: 'note',
      author: 'Michael Chen',
    },
    {
      id: '2',
      title: 'Top Candidates List',
      content: 'Spreadsheet with rankings of top candidates from the fair',
      date: 'March 21, 2024',
      type: 'document',
      url: '#',
      author: 'Sarah Wilson',
    },
    {
      id: '3',
      title: 'Follow-up Email Template',
      content: 'Template for sending personalized follow-up emails to candidates',
      date: 'March 21, 2024',
      type: 'link',
      url: 'https://example.com/templates',
      author: 'Sarah Wilson',
    },
  ];

  const handleUpdateFollowUpStatus = (id: string, status: FollowUp['status']) => {
    console.log('Update follow-up status:', id, status);
    // Implement status update logic
  };

  const handleUpdateFollowUpNotes = (id: string, notes: string) => {
    console.log('Update follow-up notes:', id, notes);
    // Implement notes update logic
  };

  const handleDeleteFollowUp = (id: string) => {
    console.log('Delete follow-up:', id);
    // Implement delete logic
  };

  const handleUpdateCandidateStatus = (id: string, status: Candidate['status']) => {
    console.log('Update candidate status:', id, status);
    // Implement status update logic
  };

  const handleAddNote = () => {
    console.log('Add new note');
    // Implement add note logic
  };

  const handleEditNote = (id: string) => {
    console.log('Edit note:', id);
    // Implement edit note logic
  };

  const handleDeleteNote = (id: string) => {
    console.log('Delete note:', id);
    // Implement delete note logic
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Spring Tech Career Fair 2024</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                March 20, 2024
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Event Completed
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/employer/fairs/analytics')}
              className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
            >
              <BarChart2 className="h-4 w-4 mr-1.5" />
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Fair Phase Navigation */}
      <FairPhaseNavigation fairId={fairId || "1"} currentPhase="post-fair" />

      {/* Post-Fair Summary */}
      <EmployerPostFairSummary fairData={mockFairData} />

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('followups')}
              className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'followups'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="h-4 w-4 inline-block mr-2" />
              Follow-ups
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'candidates'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline-block mr-2" />
              Candidates
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'notes'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 inline-block mr-2" />
              Notes & Materials
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Follow-ups */}
          {activeTab === 'followups' && (
            <EmployerFollowUpList
              followUps={mockFollowUps}
              onUpdateStatus={handleUpdateFollowUpStatus}
              onUpdateNotes={handleUpdateFollowUpNotes}
              onDelete={handleDeleteFollowUp}
            />
          )}

          {/* Candidates */}
          {activeTab === 'candidates' && (
            <EmployerCandidatesList
              candidates={mockCandidates}
              onUpdateStatus={handleUpdateCandidateStatus}
            />
          )}

          {/* Notes & Materials */}
          {activeTab === 'notes' && (
            <EmployerNotesAndMaterials
              notes={mockNotes}
              onAddNote={handleAddNote}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}