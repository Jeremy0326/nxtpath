import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Users, 
  Clock, 
  Calendar, 
  MessageSquare,
  MapPin,
  Search,
  Filter,
  ArrowLeft,
  FileText,
  Mail,
  CheckCircle,
  Star,
  Briefcase,
  ExternalLink,
  Plus
} from 'lucide-react';
import { FairPhaseNavigation } from '../../components/career-fair/FairPhaseNavigation';
import { Link, useParams } from 'react-router-dom';
import { PostFairSummary } from '../../components/career-fair/PostFairSummary';
import { FollowUpList } from '../../components/career-fair/FollowUpList';
import { ApplicationsList } from '../../components/career-fair/ApplicationsList';
import { NotesAndMaterials } from '../../components/career-fair/NotesAndMaterials';
import { FollowUpEmailTemplate } from '../../components/career-fair/FollowUpEmailTemplate';

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

interface Note {
  id: string;
  company: string;
  logo: string;
  title: string;
  content: string;
  date: string;
  type: 'note' | 'document' | 'link';
  url?: string;
}

export function PostFairPage() {
  const { fairId } = useParams<{ fairId: string }>();
  const [activeTab, setActiveTab] = useState<'followups' | 'applications' | 'notes'>('followups');
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);
  
  const mockFairData = {
    id: fairId || '1',
    title: 'Spring Tech Career Fair 2024',
    date: 'March 20, 2024',
    companies: 8,
    connections: 12,
    eventsAttended: 5,
    pendingFollowUps: 6,
    applications: 4
  };
  
  const mockFollowUps: FollowUp[] = [
    {
      id: '1',
      company: 'TechCorp',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=200&fit=crop',
      contactName: 'Sarah Wilson',
      contactTitle: 'Technical Recruiter',
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
      company: 'InnovateLabs',
      logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
      contactName: 'Michael Chen',
      contactTitle: 'Engineering Manager',
      status: 'contacted',
      priority: 'medium',
      lastActivity: '1 day ago',
      meetingDetails: {
        date: 'March 20, 2024',
        topics: ['Frontend Developer position', 'Tech stack discussion']
      }
    },
  ];

  const mockApplications: Application[] = [
    {
      id: '1',
      company: 'TechCorp',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=200&fit=crop',
      position: 'Senior Software Engineer',
      status: 'in_progress',
      deadline: 'March 30, 2024',
      matchScore: 95,
      description: 'Join our team to build next-generation AI solutions and scalable cloud infrastructure.',
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        "5+ years of experience in software development",
        "Strong experience with React and Node.js",
        "Experience with cloud platforms (AWS/GCP)",
      ],
      location: 'San Francisco, CA (Remote Option Available)'
    },
    {
      id: '2',
      company: 'InnovateLabs',
      logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
      position: 'Full Stack Developer',
      status: 'draft',
      matchScore: 88,
      description: 'Build modern web applications using React and TypeScript.',
      requirements: [
        "2+ years of frontend development experience",
        "Proficiency in React, TypeScript, and modern CSS",
        "Experience with state management libraries",
        "Knowledge of responsive design principles",
      ],
      location: 'Remote'
    },
  ];

  const mockNotes: Note[] = [
    {
      id: '1',
      company: 'TechCorp',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=200&fit=crop',
      title: 'Company Overview Notes',
      content: 'TechCorp is expanding their AI division and looking for experienced engineers. They offer remote work options and competitive benefits. The engineering team uses React, Node.js, and AWS for most projects. They mentioned they value problem-solving skills and cultural fit.',
      date: 'March 20, 2024',
      type: 'note'
    },
    {
      id: '2',
      company: 'InnovateLabs',
      logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
      title: 'Company Brochure',
      content: 'Digital brochure with company information and open positions',
      date: 'March 20, 2024',
      type: 'document',
      url: '#'
    },
    {
      id: '3',
      company: 'TechCorp',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=200&fit=crop',
      title: 'Career Page',
      content: 'Link to TechCorp careers page with all current openings',
      date: 'March 20, 2024',
      type: 'link',
      url: 'https://example.com/careers'
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

  const handleUpdateApplicationStatus = (id: string, status: Application['status']) => {
    console.log('Update application status:', id, status);
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
            <Link to="/career-fairs" className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Fairs
            </Link>
          </div>
        </div>
      </div>

      {/* Fair Phase Navigation */}
      <FairPhaseNavigation fairId={fairId || "1"} currentPhase="post-fair" />

      {/* Post-Fair Summary */}
      <PostFairSummary fairData={mockFairData} />

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
              onClick={() => setActiveTab('applications')}
              className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Briefcase className="h-4 w-4 inline-block mr-2" />
              Applications
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
            <FollowUpList
              followUps={mockFollowUps}
              onUpdateStatus={handleUpdateFollowUpStatus}
              onUpdateNotes={handleUpdateFollowUpNotes}
              onDelete={handleDeleteFollowUp}
            />
          )}

          {/* Applications */}
          {activeTab === 'applications' && (
            <ApplicationsList
              applications={mockApplications}
              onUpdateStatus={handleUpdateApplicationStatus}
            />
          )}

          {/* Notes & Materials */}
          {activeTab === 'notes' && (
            <NotesAndMaterials
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