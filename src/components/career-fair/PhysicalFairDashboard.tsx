import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  MessageSquare,
  Calendar,
  Clock,
  Building,
  MapPin,
  Star,
  Bell,
  CheckCircle,
  QrCode,
  Scan,
  Coffee,
  Menu,
  X
} from 'lucide-react';

interface PhysicalEvent {
  id: string;
  title: string;
  company: string;
  type: 'presentation' | 'workshop' | 'networking';
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  attendees: number;
  status: 'upcoming' | 'live' | 'ended';
}

interface BoothVisit {
  id: string;
  company: string;
  boothId: string;
  visitTime: string;
  notes?: string;
  followUp: boolean;
}

export function PhysicalFairDashboard() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'visits'>('schedule');
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const mockEvents: PhysicalEvent[] = [
    {
      id: '1',
      title: 'Company Overview & Culture',
      company: 'TechCorp',
      type: 'presentation',
      startTime: '10:00 AM',
      endTime: '10:30 AM',
      location: 'Main Hall - Stage A',
      capacity: 50,
      attendees: 45,
      status: 'live',
    },
    {
      id: '2',
      title: 'Technical Workshop: Cloud Solutions',
      company: 'InnovateLabs',
      type: 'workshop',
      startTime: '10:45 AM',
      endTime: '11:15 AM',
      location: 'Innovation Zone - Room B3',
      capacity: 30,
      attendees: 12,
      status: 'upcoming',
    },
  ];

  const mockVisits: BoothVisit[] = [
    {
      id: '1',
      company: 'TechCorp',
      boothId: 'A1',
      visitTime: '9:45 AM',
      notes: 'Discussed software engineering roles, follow up with Sarah',
      followUp: true,
    },
    {
      id: '2',
      company: 'InnovateLabs',
      boothId: 'B3',
      visitTime: '10:15 AM',
      followUp: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Status Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-green-800 font-medium">Career Fair is Live Now</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-700">
            <Users className="h-4 w-4" />
            <span>450+ attendees on-site</span>
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
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                <QrCode className="h-6 w-6 text-indigo-600 mb-1" />
                <span className="text-xs font-medium text-indigo-700 text-center">Scan QR</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-green-50 rounded-lg hover:bg-green-100">
                <MessageSquare className="h-6 w-6 text-green-600 mb-1" />
                <span className="text-xs font-medium text-green-700 text-center">Messages</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100">
                <Coffee className="h-6 w-6 text-purple-600 mb-1" />
                <span className="text-xs font-medium text-purple-700 text-center">Break Areas</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Actions (Desktop) */}
      <div className="hidden md:block bg-white rounded-xl p-4">
        <div className="grid grid-cols-3 gap-3">
          <button className="flex flex-col items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100">
            <QrCode className="h-6 w-6 text-indigo-600 mb-1" />
            <span className="text-xs font-medium text-indigo-700">Scan QR</span>
          </button>
          <button className="flex flex-col items-center p-3 bg-green-50 rounded-lg hover:bg-green-100">
            <MessageSquare className="h-6 w-6 text-green-600 mb-1" />
            <span className="text-xs font-medium text-green-700">Messages</span>
          </button>
          <button className="flex flex-col items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100">
            <Coffee className="h-6 w-6 text-purple-600 mb-1" />
            <span className="text-xs font-medium text-purple-700">Break Areas</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4 inline-block mr-2" />
              Event Schedule
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'visits'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building className="h-4 w-4 inline-block mr-2" />
              Booth Visits
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Event Schedule */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Today's Events</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Current Time: 10:15 AM</span>
                </div>
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
                              : event.type === 'workshop'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {event.type === 'presentation' 
                              ? 'Presentation' 
                              : event.type === 'workshop' 
                              ? 'Workshop' 
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
                            ? 'Happening Now' 
                            : event.status === 'upcoming' 
                            ? 'Starting Soon' 
                            : 'Ended'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1.5" />
                          {event.company}
                        </div>
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
                          {event.attendees}/{event.capacity} Attendees
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end space-x-3">
                        {event.status === 'live' && (
                          <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                            <MapPin className="h-4 w-4 mr-1.5" />
                            Navigate to Event
                          </button>
                        )}
                        {event.status === 'upcoming' && (
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

          {/* Booth Visits */}
          {activeTab === 'visits' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Booth Visits</h2>
                <button className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                  <Scan className="h-4 w-4 mr-1.5" />
                  Scan New Booth
                </button>
              </div>
              
              {mockVisits.length > 0 ? (
                <div className="space-y-4">
                  {mockVisits.map((visit) => (
                    <motion.div
                      key={visit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-medium text-gray-900">{visit.company}</h3>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1.5" />
                              Booth {visit.boothId}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1.5" />
                              Visited at {visit.visitTime}
                            </div>
                          </div>
                          {visit.notes && (
                            <p className="mt-2 text-sm text-gray-600">{visit.notes}</p>
                          )}
                        </div>
                        {visit.followUp && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            Follow Up
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-4 flex justify-end space-x-3">
                        <button className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                          Add Notes
                        </button>
                        <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                          <MessageSquare className="h-4 w-4 mr-1.5" />
                          Message Recruiter
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Booth Visits Yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Scan QR codes at booths to track your visits</p>
                  <div className="mt-6">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                      <Scan className="h-4 w-4 inline-block mr-1.5" />
                      Scan Booth QR Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}