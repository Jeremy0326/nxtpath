import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Building,
  Briefcase,
  Star,
  ChevronRight,
  ArrowLeft,
  User,
  MapPin,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PhysicalBoothProps {
  booth: {
    id: string;
    company: {
      id: string;
      name: string;
      logo: string;
      description: string;
      representatives: {
        id: string;
        name: string;
        title: string;
        avatar?: string;
      }[];
    };
    location: string;
    status: 'available' | 'busy' | 'break';
    nextPresentation?: {
      title: string;
      time: string;
    };
  };
  onBack: () => void;
  onCheckIn: () => void;
  onMessageRecruiter: () => void;
  onViewJobs: () => void;
}

export function PhysicalBoothView({
  booth,
  onBack,
  onCheckIn,
  onMessageRecruiter,
  onViewJobs
}: PhysicalBoothProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'team' | 'jobs'>('info');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <button
                onClick={onBack}
                className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">{booth.company.name}</h1>
                <div className="mt-1 flex items-center space-x-2 text-white/80">
                  <span>Booth {booth.id}</span>
                  <span>•</span>
                  <span className={`flex items-center ${
                    booth.status === 'available' 
                      ? 'text-green-300' 
                      : booth.status === 'busy' 
                      ? 'text-yellow-300'
                      : 'text-gray-300'
                  }`}>
                    <span className="h-2 w-2 rounded-full bg-current mr-1.5"></span>
                    {booth.status === 'available' 
                      ? 'Available Now' 
                      : booth.status === 'busy' 
                      ? 'Currently Busy'
                      : 'On Break'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onMessageRecruiter}
                className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
              <button
                onClick={onViewJobs}
                className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
              >
                <Briefcase className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('info')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Booth Info
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'team'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Meet the Team
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Open Positions
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Booth Info */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={booth.company.logo}
                    alt={booth.company.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{booth.company.name}</h2>
                    <p className="text-sm text-gray-500">Technology • San Francisco, CA</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {booth.location}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">About</h3>
                <p className="text-sm text-gray-600">{booth.company.description}</p>
              </div>

              {booth.nextPresentation && (
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-indigo-900">Next Presentation</h3>
                      <p className="text-sm text-indigo-700">{booth.nextPresentation.title}</p>
                    </div>
                    <div className="flex items-center text-sm text-indigo-700">
                      <Clock className="h-4 w-4 mr-1.5" />
                      {booth.nextPresentation.time}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-sm font-medium text-green-900 mb-2">Check-In at Booth</h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-green-700">
                    Scan the QR code at the booth to check in and track your visit
                  </p>
                  <button
                    onClick={onCheckIn}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    <QrCode className="h-4 w-4 mr-1.5" />
                    Check In
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={onMessageRecruiter}
                  className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                >
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  Message Recruiter
                </button>
                <button
                  onClick={onViewJobs}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  View Open Positions
                </button>
              </div>
            </div>
          )}

          {/* Meet the Team */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Meet the Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booth.company.representatives.map((rep) => (
                  <div key={rep.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    {rep.avatar ? (
                      <img
                        src={rep.avatar}
                        alt={rep.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{rep.name}</h3>
                      <p className="text-sm text-gray-500">{rep.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={onMessageRecruiter}
                  className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                >
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  Start Conversation
                </button>
              </div>
            </div>
          )}

          {/* Open Positions */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Open Positions</h2>
              <div className="space-y-4">
                {[
                  {
                    id: '1',
                    title: 'Senior Software Engineer',
                    type: 'Full-time',
                    location: 'San Francisco, CA',
                    matchScore: 95,
                  },
                  {
                    id: '2',
                    title: 'Product Manager',
                    type: 'Full-time',
                    location: 'Remote',
                    matchScore: 88,
                  },
                ].map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg hover:border-indigo-500 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{job.title}</h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1.5" />
                            {job.type}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1.5" />
                            {job.location}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Star className="h-3 w-3 mr-1" />
                        {job.matchScore}% Match
                      </span>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Link to={`/jobs/${job.id}`} className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={onViewJobs}
                  className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                >
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  View All Positions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}