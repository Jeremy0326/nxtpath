import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building,
  Users,
  Calendar,
  MapPin,
  Clock,
  Plus,
  ChevronRight,
  MessageSquare,
  Briefcase,
  Star,
  Filter,
  Settings,
  Edit,
  Trash2,
  ExternalLink,
  ArrowRight,
  BarChart2 
} from 'lucide-react';
import { useCareerFair } from '../../contexts/CareerFairContext';
import { FloorMap } from '../../components/career-fair/FloorMap';
import { BookingModal } from '../../components/career-fair/BookingModal';
import { CompanyCard } from '../../components/career-fair/CompanyCard';
import { Link, useNavigate } from 'react-router-dom';

const mockBooths = [
  {
    id: '1',
    number: 'A1',
    company: {
      name: 'TechCorp',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=200&fit=crop',
    },
    position: { x: 30, y: 20 },
  },
  {
    id: '2',
    number: 'B2',
    company: {
      name: 'InnovateLabs',
      logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
    },
    position: { x: 60, y: 40 },
  },
];

const mockFairs = [
  {
    id: '1',
    title: 'Spring Tech Career Fair 2024',
    date: 'March 20, 2024',
    location: 'University Convention Center',
    type: 'in-person',
    status: 'upcoming',
    registeredStudents: 450,
    description: 'Connect with top talent from leading universities in computer science, engineering, and related fields.',
    time: '10:00 AM - 4:00 PM',
  },
  {
    id: '2',
    title: 'Virtual Tech & Engineering Fair',
    date: 'April 5, 2024',
    location: 'Virtual Event',
    type: 'virtual',
    status: 'upcoming',
    registeredStudents: 785,
    description: 'Our virtual career fair connects employers with students and recent graduates from across the country.',
    time: '9:00 AM - 3:00 PM',
  },
  {
    id: '3',
    title: 'Fall Recruitment Fair 2023',
    date: 'October 15, 2023',
    location: 'University Convention Center',
    type: 'in-person',
    status: 'completed',
    registeredStudents: 520,
    description: 'Past event focused on fall recruitment for full-time positions and internships.',
    time: '10:00 AM - 4:00 PM',
  },
];

export function CareerFairManagement() {
  const navigate = useNavigate();
  const { currentFair } = useCareerFair();
  const [selectedBooth, setSelectedBooth] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedFair, setSelectedFair] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'details'>('list');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Career Fair Management</h1>
            <p className="mt-1 text-gray-500">Manage your participation in upcoming career fairs</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
              Find Events
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Register for Fair
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Fairs */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Career Fairs</h2>
        <div className="space-y-4">
          {mockFairs.filter(fair => fair.status === 'upcoming').map((fair) => (
            <div 
              key={fair.id}
              className="border rounded-lg p-6 hover:border-indigo-500 transition-colors cursor-pointer"
              onClick={() => {
                setSelectedFair(fair.id);
                setView('details');
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{fair.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      fair.type === 'virtual' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {fair.type === 'virtual' ? 'Virtual' : 'In-Person'}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      {fair.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5" />
                      {fair.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1.5" />
                      {fair.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1.5" />
                      {fair.registeredStudents} Registered Students
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">{fair.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Registered
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                {fair.type === 'in-person' ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/employer/fairs/booth');
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                  >
                    <Building className="h-4 w-4 mr-1.5" />
                    Booth Setup
                  </button>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/employer/fairs/booth');
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                  >
                    <Settings className="h-4 w-4 mr-1.5" />
                    Virtual Booth
                  </button>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/employer/fairs/schedule');
                  }}
                  className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                >
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Schedule
                </button>
                {fair.status === 'upcoming' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (fair.type === 'in-person') {
                        navigate('/employer/fairs/physical');
                      } else {
                        navigate('/employer/fairs/virtual');
                      }
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    <ArrowRight className="h-4 w-4 mr-1.5" />
                    Manage Live Fair
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Fairs */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Career Fairs</h2>
        <div className="space-y-4">
          {mockFairs.filter(fair => fair.status === 'completed').map((fair) => (
            <div 
              key={fair.id}
              className="border rounded-lg p-6 hover:border-indigo-500 transition-colors cursor-pointer"
              onClick={() => {
                setSelectedFair(fair.id);
                setView('details');
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{fair.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      fair.type === 'virtual' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {fair.type === 'virtual' ? 'Virtual' : 'In-Person'}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      {fair.date}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1.5" />
                      {fair.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1.5" />
                      {fair.registeredStudents} Attended
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Completed
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/employer/fairs/analytics');
                  }}
                  className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                >
                  <BarChart2 className="h-4 w-4 mr-1.5" />
                  View Analytics
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/employer/fairs/${fair.id}/follow-up`);
                  }}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  Post-Fair Follow-up
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}