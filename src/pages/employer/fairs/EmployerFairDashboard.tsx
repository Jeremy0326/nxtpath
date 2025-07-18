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
  QrCode,
  Scan,
  Menu,
  Link,
  Video,
  Briefcase,
  Star,
  Bell,
  CheckCircle,
  AlertCircle,
  Download,
  BarChart2,
  FileText,
  Plus,
  Edit
} from 'lucide-react';
import { FairPhaseNavigation } from '../../../components/career-fair/FairPhaseNavigation';
import { useNavigate } from 'react-router-dom';

export function EmployerFairDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'visitors' | 'messages'>('overview');
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const mockStats = [
    {
      label: 'Booth Visitors',
      value: '45',
      change: '+12',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Resumes Collected',
      value: '28',
      change: '+8',
      icon: FileText,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Scheduled Interviews',
      value: '12',
      change: '+3',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Avg. Engagement Time',
      value: '8m',
      change: '+2m',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  const mockVisitors = [
    {
      id: '1',
      name: 'Alex Johnson',
      university: 'Stanford University',
      major: 'Computer Science',
      visitTime: '10:15 AM',
      resumeUrl: '#',
      matchScore: 95,
      notes: 'Interested in software engineering roles, strong React experience',
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      university: 'MIT',
      major: 'Electrical Engineering',
      visitTime: '10:45 AM',
      resumeUrl: '#',
      matchScore: 88,
      notes: '',
    },
  ];

  const mockEvents = [
    {
      id: '1',
      title: 'Company Overview Presentation',
      type: 'presentation',
      startTime: '11:00 AM',
      endTime: '11:30 AM',
      location: 'Main Stage',
      registeredAttendees: 35,
      capacity: 50,
      status: 'upcoming',
    },
    {
      id: '2',
      title: 'Technical Interview Sessions',
      type: 'interview',
      startTime: '1:00 PM',
      endTime: '3:00 PM',
      location: 'Booth A1',
      registeredAttendees: 8,
      capacity: 10,
      status: 'upcoming',
    },
  ];

  const mockMessages = [
    {
      id: '1',
      sender: 'Alex Johnson',
      content: 'Hello, I\'m interested in learning more about the Senior Software Engineer position.',
      time: '10:30 AM',
      unread: true,
    },
    {
      id: '2',
      sender: 'Sarah Wilson',
      content: 'Thank you for the information about your company culture. I\'d love to discuss the internship opportunities.',
      time: '10:45 AM',
      unread: true,
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
            <h1 className="text-2xl font-bold text-gray-900">Spring Tech Career Fair 2024</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                March 20, 2024
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                10:00 AM - 4:00 PM
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1.5" />
                University Convention Center
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
      <FairPhaseNavigation fairId="1" currentPhase="on-fair" />

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

      {/* Quick Actions (Mobile) */}
      <div className="md:hidden">
        <button 
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-sm"
        >
          <span className="font-medium text-gray-900">Quick Actions</span>
          {showQuickActions ? (
            <X className="h-5 w-5 text-gray-500" />
          ) : (
            <Menu className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 bg-white rounded-lg shadow-sm p-4"
          >
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                <QrCode className="h-6 w-6 text-indigo-600 mb-1" />
                <span className="text-xs font-medium text-indigo-700 text-center">Generate QR</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-green-50 rounded-lg hover:bg-green-100">
                <MessageSquare className="h-6 w-6 text-green-600 mb-1" />
                <span className="text-xs font-medium text-green-700 text-center">Messages</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100">
                <Download className="h-6 w-6 text-purple-600 mb-1" />
                <span className="text-xs font-medium text-purple-700 text-center">Export Data</span>
              </button>
            </div>
          </motion.div>
        )}
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
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4 inline-block mr-2" />
              Schedule
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
                <h2 className="text-lg font-medium text-gray-900">Booth Status</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Current Time: 10:15 AM</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booth Info */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-gray-900">Booth Information</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600 mr-1.5"></span>
                      Active
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Booth Number</span>
                      <span className="text-sm font-medium text-gray-900">A1</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Location</span>
                      <span className="text-sm font-medium text-gray-900">Main Hall - Section A</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Representatives</span>
                      <span className="text-sm font-medium text-gray-900">3 Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">QR Code Check-ins</span>
                      <span className="text-sm font-medium text-gray-900">32</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                      <QrCode className="h-4 w-4 mr-1.5" />
                      Generate Booth QR
                    </button>
                  </div>
                </div>

                {/* Live Activity */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-base font-medium text-gray-900 mb-4">Live Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Current Visitors</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">In Queue</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Unread Messages</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">7</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Next Presentation</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">11:00 AM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Alerts */}
              <div className="space-y-4">
                <h3 className="text-base font-medium text-gray-900">Real-time Alerts</h3>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">High Traffic Expected</p>
                      <p className="mt-1 text-sm text-yellow-700">
                        Your booth is expected to have high traffic between 11:30 AM - 1:00 PM. 
                        Consider having additional team members available during this time.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Presentation Reminder</p>
                      <p className="mt-1 text-sm text-green-700">
                        Your company presentation is scheduled for 11:00 AM at the Main Stage. 
                        Please arrive 15 minutes early to set up.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Today's Schedule</h2>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Event
                </button>
              </div>

              <div className="space-y-4">
                {mockEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className={`p-4 ${
                      event.status === 'live' 
                        ? 'bg-green-50 border-b border-green-100' 
                        : event.status === 'upcoming'
                        ? 'bg-blue-50 border-b border-blue-100'
                        : 'bg-gray-50 border-b border-gray-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {event.status === 'live' && (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                          )}
                          <h3 className="text-base font-medium text-gray-900">{event.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.type === 'presentation'
                              ? 'bg-blue-100 text-blue-800'
                              : event.type === 'interview'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {event.type === 'presentation' 
                              ? 'Presentation' 
                              : event.type === 'interview' 
                              ? 'Interview' 
                              : 'Networking'}
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.status === 'live'
                            ? 'bg-green-100 text-green-800'
                            : event.status === 'upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status === 'live' 
                            ? 'Live Now' 
                            : event.status === 'upcoming' 
                            ? 'Upcoming' 
                            : 'Completed'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1.5" />
                          {event.startTime} - {event.endTime}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1.5" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1.5" />
                          {event.registeredAttendees}/{event.capacity} Registered
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end space-x-3">
                        <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
                          <Users className="h-4 w-4 mr-1.5" />
                          View Attendees
                        </button>
                        {event.status === 'upcoming' && (
                          <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                            <Bell className="h-4 w-4 mr-1.5" />
                            Send Reminder
                          </button>
                        )}
                        {event.status === 'live' && (
                          <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
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
                            Visited at {visitor.visitTime}
                          </div>
                        </div>
                        {visitor.notes && (
                          <p className="mt-2 text-sm text-gray-600">{visitor.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          {visitor.matchScore}% Match
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                      <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
                        <FileText className="h-4 w-4 mr-1.5" />
                        View Resume
                      </button>
                      <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
                        <Edit className="h-4 w-4 mr-1.5" />
                        Add Notes
                      </button>
                      <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                        <MessageSquare className="h-4 w-4 mr-1.5" />
                        Message
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Incoming Messages</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {mockMessages.filter(m => m.unread).length} Unread
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {mockMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-lg p-4 ${message.unread ? 'bg-indigo-50 border-indigo-200' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-medium text-indigo-600">{message.sender.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">{message.sender}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{message.time}</span>
                            {message.unread && (
                              <span className="h-2 w-2 bg-indigo-600 rounded-full"></span>
                            )}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{message.content}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                        <MessageSquare className="h-4 w-4 mr-1.5" />
                        Reply
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}