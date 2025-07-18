import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Users, 
  Clock, 
  Calendar, 
  Video, 
  MessageSquare,
  Globe,
  Search,
  ArrowLeft,
  Menu,
  X,
  Briefcase,
  Star,
  Bell,
  CheckCircle,
  AlertCircle,
  Download,
  BarChart2,
  Settings,
  UserPlus
} from 'lucide-react';
import { FairPhaseNavigation } from '../../../components/career-fair/FairPhaseNavigation';
import { Link, useNavigate } from 'react-router-dom';

export function EmployerVirtualFair() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'visitors' | 'messages'>('overview');
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const mockStats = [
    {
      label: 'Booth Visitors',
      value: '78',
      change: '+15',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Live Sessions',
      value: '3',
      change: '+1',
      icon: Video,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Active Chats',
      value: '12',
      change: '+4',
      icon: MessageSquare,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Avg. Engagement',
      value: '6m',
      change: '+1m',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  const mockSessions = [
    {
      id: '1',
      title: 'Company Overview & Culture',
      type: 'presentation',
      startTime: '10:00 AM',
      endTime: '10:30 AM',
      attendees: 45,
      capacity: 100,
      status: 'live',
      presenter: 'Sarah Wilson',
    },
    {
      id: '2',
      title: 'Q&A with Engineering Team',
      type: 'qa',
      startTime: '11:30 AM',
      endTime: '12:00 PM',
      attendees: 0,
      capacity: 50,
      status: 'upcoming',
      presenter: 'Michael Chen',
    },
  ];

  const mockVisitors = [
    {
      id: '1',
      name: 'Alex Johnson',
      university: 'Stanford University',
      major: 'Computer Science',
      visitTime: '10:15 AM',
      duration: '8 minutes',
      resumeUrl: '#',
      matchScore: 95,
      status: 'in-booth',
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      university: 'MIT',
      major: 'Electrical Engineering',
      visitTime: '10:05 AM',
      duration: '12 minutes',
      resumeUrl: '#',
      matchScore: 88,
      status: 'in-queue',
    },
  ];

  const mockQueue = [
    {
      id: '1',
      name: 'Sarah Wilson',
      university: 'MIT',
      position: 1,
      waitTime: '2 minutes',
    },
    {
      id: '2',
      name: 'David Lee',
      university: 'UC Berkeley',
      position: 2,
      waitTime: '5 minutes',
    },
  ];

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
            <h1 className="text-2xl font-bold text-gray-900">Virtual Tech & Engineering Fair</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                April 5, 2024
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                9:00 AM - 3:00 PM
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-1.5" />
                Virtual Event
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              <span className="h-2 w-2 bg-green-500 rounded-full inline-block mr-1.5"></span>
              Live Now
            </div>
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
      <FairPhaseNavigation fairId="2" currentPhase="on-fair" />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building className="h-4 w-4 inline-block mr-2" />
              Booth Overview
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Video className="h-4 w-4 inline-block mr-2" />
              Live Sessions
            </button>
            <button
              onClick={() => setActiveTab('visitors')}
              className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'visitors'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline-block mr-2" />
              Visitors
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="h-4 w-4 inline-block mr-2" />
              Messages
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Booth Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Virtual Booth Status</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Current Time: 10:15 AM</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booth Settings */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-gray-900">Booth Settings</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600 mr-1.5"></span>
                      Online
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Booth Status</span>
                      <select className="text-sm border-0 bg-transparent font-medium text-gray-900 focus:ring-0">
                        <option>Online</option>
                        <option>Busy</option>
                        <option>Away</option>
                        <option>Offline</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Auto-Queue</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Active Representatives</span>
                      <span className="text-sm font-medium text-gray-900">3/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Queue Limit</span>
                      <select className="text-sm border-0 bg-transparent font-medium text-gray-900 focus:ring-0">
                        <option>5 students</option>
                        <option>10 students</option>
                        <option>15 students</option>
                        <option>No limit</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                      <Settings className="h-4 w-4 mr-1.5" />
                      Booth Settings
                    </button>
                  </div>
                </div>

                {/* Queue Management */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-base font-medium text-gray-900 mb-4">Queue Management</h3>
                  {mockQueue.length > 0 ? (
                    <div className="space-y-4">
                      {mockQueue.map((student, index) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="flex items-center">
                              <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium mr-2">
                                {student.position}
                              </span>
                              <span className="text-sm font-medium text-gray-900">{student.name}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{student.university}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{student.waitTime}</span>
                            <button className="flex items-center px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                              <UserPlus className="h-3 w-3 mr-1" />
                              Admit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Users className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No students in queue</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Visitors */}
              <div className="border rounded-lg p-6">
                <h3 className="text-base font-medium text-gray-900 mb-4">Currently In Booth</h3>
                {mockVisitors.filter(v => v.status === 'in-booth').length > 0 ? (
                  <div className="space-y-4">
                    {mockVisitors.filter(v => v.status === 'in-booth').map((visitor) => (
                      <div key={visitor.id} className="flex items-start justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{visitor.name}</h4>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span>{visitor.university}</span>
                            <span>•</span>
                            <span>{visitor.major}</span>
                            <span>•</span>
                            <span>Duration: {visitor.duration}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Star className="h-3 w-3 mr-1" />
                            {visitor.matchScore}%
                          </span>
                          <button className="flex items-center px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No active visitors at the moment</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Live Sessions */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Live Sessions</h2>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Session
                </button>
              </div>

              <div className="space-y-4">
                {mockSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className={`p-4 ${
                      session.status === 'live' 
                        ? 'bg-green-50 border-b border-green-100' 
                        : session.status === 'upcoming'
                        ? 'bg-blue-50 border-b border-blue-100'
                        : 'bg-gray-50 border-b border-gray-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {session.status === 'live' && (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                          )}
                          <h3 className="text-base font-medium text-gray-900">{session.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            session.type === 'presentation'
                              ? 'bg-blue-100 text-blue-800'
                              : session.type === 'qa'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {session.type === 'presentation' 
                              ? 'Presentation' 
                              : session.type === 'qa' 
                              ? 'Q&A Session' 
                              : 'Networking'}
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          session.status === 'live'
                            ? 'bg-green-100 text-green-800'
                            : session.status === 'upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {session.status === 'live' 
                            ? 'Live Now' 
                            : session.status === 'upcoming' 
                            ? 'Upcoming' 
                            : 'Completed'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1.5" />
                          {session.startTime} - {session.endTime}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1.5" />
                          {session.attendees}/{session.capacity} Attendees
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1.5" />
                          Presenter: {session.presenter}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end space-x-3">
                        <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
                          <Users className="h-4 w-4 mr-1.5" />
                          View Attendees
                        </button>
                        {session.status === 'upcoming' && (
                          <button className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                            <Bell className="h-4 w-4 mr-1.5" />
                            Send Reminder
                          </button>
                        )}
                        {session.status === 'live' && (
                          <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                            <Video className="h-4 w-4 mr-1.5" />
                            Join Session
                          </button>
                        )}
                        {session.status === 'upcoming' && (
                          <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                            <Video className="h-4 w-4 mr-1.5" />
                            Start Session
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Visitors */}
          {activeTab === 'visitors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Booth Visitors</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search visitors..."
                      className="pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                    <Download className="h-4 w-4 mr-1.5" />
                    Export List
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {mockVisitors.map((visitor) => (
                  <motion.div
                    key={visitor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:border-indigo-500 transition-colors shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{visitor.name}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1.5" />
                            {visitor.university}
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1.5" />
                            {visitor.major}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1.5" />
                            {visitor.status === 'in-booth' ? `Active for ${visitor.duration}` : `Visited at ${visitor.visitTime}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          {visitor.matchScore}% Match
                        </span>
                        {visitor.status === 'in-booth' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-600 mr-1.5"></span>
                            Active Now
                          </span>
                        )}
                        {visitor.status === 'in-queue' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-1.5"></span>
                            In Queue
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                      <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
                        <FileText className="h-4 w-4 mr-1.5" />
                        View Resume
                      </button>
                      {visitor.status === 'in-queue' ? (
                        <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                          <UserPlus className="h-4 w-4 mr-1.5" />
                          Admit to Booth
                        </button>
                      ) : (
                        <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                          <MessageSquare className="h-4 w-4 mr-1.5" />
                          Message
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {activeTab === 'messages' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              {/* Contacts List */}
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto h-[calc(600px-65px)]">
                  {['Alex Johnson', 'Sarah Wilson', 'David Lee'].map((name, index) => (
                    <button
                      key={index}
                      className={`w-full flex items-start p-4 text-left hover:bg-gray-50 ${
                        index === 0 ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mr-3">
                        <span className="text-lg font-medium text-indigo-600">{name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">{name}</h3>
                          <span className="text-xs text-gray-500">10:30 AM</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 truncate">
                          Hello, I'm interested in learning more about...
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-2 border rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <span className="text-lg font-medium text-indigo-600">A</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Alex Johnson</h3>
                        <p className="text-xs text-gray-500">Stanford University • Computer Science</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full">
                        <FileText className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full">
                        <Video className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg p-3 shadow-sm max-w-[80%]">
                        <p className="text-sm text-gray-800">Hello, I'm interested in learning more about the Senior Software Engineer position at your company. Could you tell me more about the team and the projects they're working on?</p>
                        <p className="text-xs text-gray-500 mt-1">10:30 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 rounded-lg p-3 shadow-sm max-w-[80%]">
                        <p className="text-sm text-white">Hi Alex! Thanks for your interest. Our engineering team is currently working on scaling our AI platform and building new features for our enterprise clients. The role would involve working with React, Node.js, and AWS.</p>
                        <p className="text-xs text-indigo-200 mt-1">10:32 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg p-3 shadow-sm max-w-[80%]">
                        <p className="text-sm text-gray-800">That sounds exciting! I have experience with all those technologies. What's the interview process like?</p>
                        <p className="text-xs text-gray-500 mt-1">10:34 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full">
                      <Plus className="h-5 w-5" />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <button className="p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700">
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}