import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  MessageSquare,
  Building
} from 'lucide-react';

interface Registration {
  id: string;
  student: {
    name: string;
    email: string;
    major: string;
    year: string;
    resume?: string;
  };
  event: {
    title: string;
    company: string;
    type: 'presentation' | 'interview' | 'networking';
    time: string;
  };
  status: 'confirmed' | 'waitlist' | 'cancelled';
  registeredAt: string;
  notes?: string;
}

const mockRegistrations: Registration[] = [
  {
    id: '1',
    student: {
      name: 'Alex Johnson',
      email: 'alex@university.edu',
      major: 'Computer Science',
      year: '3rd',
      resume: 'resume.pdf',
    },
    event: {
      title: 'Technical Interview Session',
      company: 'TechCorp',
      type: 'interview',
      time: '10:00 AM - 10:30 AM',
    },
    status: 'confirmed',
    registeredAt: '2024-03-15 09:30 AM',
    notes: 'Interested in full-stack development roles',
  },
  {
    id: '2',
    student: {
      name: 'Sarah Wilson',
      email: 'sarah@university.edu',
      major: 'Software Engineering',
      year: '4th',
      resume: 'resume.pdf',
    },
    event: {
      title: 'Company Overview',
      company: 'InnovateLabs',
      type: 'presentation',
      time: '11:00 AM - 12:00 PM',
    },
    status: 'waitlist',
    registeredAt: '2024-03-15 10:15 AM',
  },
];

export function RegistrationManagement() {
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

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
            <h1 className="text-2xl font-bold text-gray-900">Registration Management</h1>
            <p className="mt-1 text-gray-500">Track and manage career fair registrations</p>
          </div>
          <div className="flex items-center space-x-4">
            <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option>Spring Tech Fair 2024</option>
              <option>Fall Career Fair 2024</option>
            </select>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              <Download className="h-4 w-4 mr-2" />
              Export List
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Registrations',
            value: '156',
            change: '+12',
            icon: Users,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Confirmed',
            value: '124',
            change: '+8',
            icon: CheckCircle,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Waitlist',
            value: '32',
            change: '+4',
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-600',
          },
          {
            label: 'Cancelled',
            value: '8',
            change: '+1',
            icon: XCircle,
            color: 'bg-red-100 text-red-600',
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6"
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

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="waitlist">Waitlist</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="grid grid-cols-1 gap-6">
        {mockRegistrations.map((registration) => (
          <motion.div
            key={registration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{registration.student.name}</h3>
                  <p className="text-sm text-gray-500">{registration.student.email}</p>
                  
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Building className="h-4 w-4 mr-1.5" />
                      {registration.event.company} - {registration.event.title}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      {registration.event.time}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {registration.student.major}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {registration.student.year} Year
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      registration.event.type === 'presentation'
                        ? 'bg-blue-100 text-blue-800'
                        : registration.event.type === 'interview'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {registration.event.type.charAt(0).toUpperCase() + registration.event.type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  registration.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : registration.status === 'waitlist'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                </span>
                <button
                  onClick={() => setSelectedRegistration(registration)}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>
            </div>

            {selectedRegistration?.id === registration.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registration Status</label>
                    <div className="mt-2 flex items-center space-x-4">
                      <button className="flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200">
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Confirm
                      </button>
                      <button className="flex items-center px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200">
                        <Clock className="h-4 w-4 mr-1.5" />
                        Move to Waitlist
                      </button>
                      <button className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200">
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Cancel
                      </button>
                    </div>
                  </div>

                  {registration.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Student Notes</label>
                      <p className="mt-1 text-sm text-gray-600">{registration.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedRegistration(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Close
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                      Send Message
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}