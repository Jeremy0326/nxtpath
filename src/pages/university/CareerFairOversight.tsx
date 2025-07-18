import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building,
  Users,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronRight,
  Briefcase
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  boothPreference: string;
  status: 'approved' | 'pending' | 'rejected';
  openPositions: number;
  previousParticipant: boolean;
}

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp',
    logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=200&fit=crop',
    industry: 'Technology',
    boothPreference: 'Main Hall',
    status: 'approved',
    openPositions: 12,
    previousParticipant: true,
  },
  {
    id: '2',
    name: 'InnovateLabs',
    logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
    industry: 'Software',
    boothPreference: 'Innovation Zone',
    status: 'pending',
    openPositions: 8,
    previousParticipant: false,
  },
];

export function CareerFairOversight() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
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
            <h1 className="text-2xl font-bold text-gray-900">Career Fair Management</h1>
            <p className="mt-1 text-gray-500">Oversee employer participation and booth assignments</p>
          </div>
          <div className="flex items-center space-x-4">
            <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option>Spring Career Fair 2024</option>
              <option>Fall Career Fair 2024</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Companies',
            value: '45',
            change: '+8',
            icon: Building,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Registered Students',
            value: '850',
            change: '+120',
            icon: Users,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Available Booths',
            value: '15',
            change: '-5',
            icon: MapPin,
            color: 'bg-purple-100 text-purple-600',
          },
          {
            label: 'Days Until Event',
            value: '12',
            change: '',
            icon: Calendar,
            color: 'bg-yellow-100 text-yellow-600',
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
                {stat.change && (
                  <span className={`text-sm font-medium ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>{stat.change}</span>
                )}
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
              placeholder="Search companies..."
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
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="grid grid-cols-1 gap-6">
        {mockCompanies.map((company) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-500">{company.industry}</p>
                  
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1.5" />
                      Booth Preference: {company.boothPreference}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Briefcase className="h-4 w-4 mr-1.5" />
                      {company.openPositions} Open Positions
                    </div>
                  </div>

                  {company.previousParticipant && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Previous Participant
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  company.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : company.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                </span>
                <button
                  onClick={() => setSelectedCompany(company)}
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Manage
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>

            {selectedCompany?.id === company.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Booth Assignment</label>
                    <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                      <option>Main Hall - A1</option>
                      <option>Main Hall - A2</option>
                      <option>Innovation Zone - B1</option>
                      <option>Innovation Zone - B2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Application Status</label>
                    <div className="mt-2 flex items-center space-x-4">
                      <button className="flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200">
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Approve
                      </button>
                      <button className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200">
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Reject
                      </button>
                      <button className="flex items-center px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200">
                        <AlertCircle className="h-4 w-4 mr-1.5" />
                        Request More Info
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedCompany(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setSelectedCompany(null)}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                      Save Changes
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