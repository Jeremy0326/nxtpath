import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  MessageSquare,
  Calendar,
  Clock,
  Building,
  Video,
  Star,
  Bell,
  CheckCircle,
  AlertCircle,
  Globe,
  Briefcase,
  Menu,
  X
} from 'lucide-react';

interface VirtualSession {
  id: string;
  title: string;
  company: string;
  type: 'presentation' | 'qa' | 'networking';
  startTime: string;
  endTime: string;
  capacity: number;
  attendees: number;
  status: 'upcoming' | 'live' | 'ended';
}

interface VirtualBooth {
  id: string;
  company: string;
  logo: string;
  representatives: number;
  status: 'online' | 'busy' | 'offline';
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success';
  message: string;
  time: string;
}

export function VirtualFairDashboard() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'booths' | 'messages'>('sessions');
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const mockSessions: VirtualSession[] = [
    {
      id: '1',
      title: 'Company Overview & Culture',
      company: 'TechCorp',
      type: 'presentation',
      startTime: '10:00 AM',
      endTime: '10:30 AM',
      capacity: 100,
      attendees: 78,
      status: 'live',
    },
    {
      id: '2',
      title: 'Q&A with Engineering Team',
      company: 'InnovateLabs',
      type: 'qa',
      startTime: '10:45 AM',
      endTime: '11:15 AM',
      capacity: 50,
      attendees: 32,
      status: 'upcoming',
    },
  ];

  const mockBooths: VirtualBooth[] = [
    {
      id: '1',
      company: 'TechCorp',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=200&fit=crop',
      representatives: 3,
      status: 'online',
    },
    {
      id: '2',
      company: 'InnovateLabs',
      logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
      representatives: 2,
      status: 'busy',
    },
  ];

  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      message: 'You\'ve been added to the TechCorp Q&A session',
      time: '2 minutes ago',
    },
    {
      id: '2',
      type: 'info',
      message: 'InnovateLabs presentation starting in 15 minutes',
      time: '5 minutes ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Status Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-green-800 font-medium">Virtual Career Fair is Live Now</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-700">
            <Users className="h-4 w-4" />
            <span>785 attendees online</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Button (Mobile) */}
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
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                <Video className="h-6 w-6 text-indigo-600 mb-1" />
                <span className="text-xs font-medium text-indigo-700 text-center">Join Featured Session</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-green-50 rounded-lg hover:bg-green-100">
                <MessageSquare className="h-6 w-6 text-green-600 mb-1" />
                <span className="text-xs font-medium text-green-700 text-center">Message Center</span>
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
              onClick={() => setActiveTab('booths')}
              className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'booths'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building className="h-4 w-4 inline-block mr-2" />
              Virtual Booths
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
          {/* Live Sessions */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Live Sessions</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Current Time: 10:15 AM</span>
                </div>
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
                            ? 'Starting Soon' 
                            : 'Ended'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1.5" />
                          {session.company}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1.5" />
                          {session.startTime} - {session.endTime}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1.5" />
                          {session.attendees}/{session.capacity} Attendees
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end space-x-3">
                        {session.status === 'live' && (
                          <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                            <Video className="h-4 w-4 mr-1.5" />
                            Join Live
                          </button>
                        )}
                        {session.status === 'upcoming' && (
                          <button className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                            <Bell className="h-4 w-4 mr-1.5" />
                            Set Reminder
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Virtual Booths */}
          {activeTab === 'booths' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Virtual Booths</h2>
                <select className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option>All Industries</option>
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {mockBooths.map((booth) => (
                  <motion.div
                    key={booth.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:border-indigo-500 transition-colors shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={booth.logo}
                        alt={booth.company}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-medium text-gray-900">{booth.company}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booth.status === 'online'
                              ? 'bg-green-100 text-green-800'
                              : booth.status === 'busy'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              booth.status === 'online'
                                ? 'bg-green-600'
                                : booth.status === 'busy'
                                ? 'bg-yellow-600'
                                : 'bg-gray-600'
                            } mr-1.5`}></span>
                            {booth.status === 'online'
                              ? 'Online'
                              : booth.status === 'busy'
                              ? 'Busy'
                              : 'Offline'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1.5" />
                          {booth.representatives} representatives available
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                      <button className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        <Briefcase className="h-4 w-4 mr-1.5" />
                        View Jobs
                      </button>
                      <button
                        disabled={booth.status === 'offline'}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                          booth.status === 'offline'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'text-white bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        <Video className="h-4 w-4 mr-1.5" />
                        Enter Booth
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
              <h2 className="text-lg font-medium text-gray-900">Notifications & Messages</h2>
              
              <div className="space-y-4">
                {mockNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      notification.type === 'success'
                        ? 'bg-green-50'
                        : notification.type === 'warning'
                        ? 'bg-yellow-50'
                        : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {notification.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : notification.type === 'warning' ? (
                        <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      ) : (
                        <Bell className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="mt-1 text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 border-t pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Direct Messages</h3>
                <div className="space-y-2">
                  {['TechCorp Recruiter', 'InnovateLabs HR'].map((contact) => (
                    <button
                      key={contact}
                      className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                          <MessageSquare className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{contact}</span>
                      </div>
                      <span className="text-xs text-gray-500">2 new messages</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}