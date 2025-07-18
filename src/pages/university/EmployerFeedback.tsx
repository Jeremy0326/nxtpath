import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare,
  Building,
  Star,
  TrendingUp,
  Target,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react';

interface EmployerFeedback {
  id: string;
  employer: {
    name: string;
    logo: string;
    industry: string;
  };
  rating: number;
  strengths: string[];
  improvements: string[];
  date: string;
  department: string;
}

const mockFeedback: EmployerFeedback[] = [
  {
    id: '1',
    employer: {
      name: 'TechCorp',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=200&fit=crop',
      industry: 'Technology',
    },
    rating: 4.8,
    strengths: ['Technical skills', 'Problem solving', 'Team collaboration'],
    improvements: ['Communication skills', 'Project management'],
    date: '2024-03-15',
    department: 'Computer Science',
  },
  {
    id: '2',
    employer: {
      name: 'InnovateLabs',
      logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
      industry: 'Software',
    },
    rating: 4.5,
    strengths: ['Coding skills', 'Adaptability'],
    improvements: ['System design knowledge'],
    date: '2024-03-14',
    department: 'Software Engineering',
  },
];

export function EmployerFeedback() {
  const [selectedFeedback, setSelectedFeedback] = useState<EmployerFeedback | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

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
            <h1 className="text-2xl font-bold text-gray-900">Employer Feedback</h1>
            <p className="mt-1 text-gray-500">Track employer satisfaction and student performance</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Average Rating',
            value: '4.7',
            change: '+0.2',
            icon: Star,
            color: 'bg-yellow-100 text-yellow-600',
          },
          {
            label: 'Total Feedback',
            value: '85',
            change: '+12',
            icon: MessageSquare,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Improvement Areas',
            value: '8',
            change: '-2',
            icon: Target,
            color: 'bg-green-100 text-green-600',
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
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>{stat.change}</span>
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
              placeholder="Search by employer or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Departments</option>
              <option value="cs">Computer Science</option>
              <option value="engineering">Engineering</option>
              <option value="business">Business</option>
            </select>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="grid grid-cols-1 gap-6">
        {mockFeedback.map((feedback) => (
          <motion.div
            key={feedback.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <img
                  src={feedback.employer.logo}
                  alt={feedback.employer.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{feedback.employer.name}</h3>
                  <p className="text-sm text-gray-500">{feedback.employer.industry}</p>
                  
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="ml-1 text-sm font-medium text-gray-900">{feedback.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{feedback.department}</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Strengths</h4>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {feedback.strengths.map((strength) => (
                          <span
                            key={strength}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Areas for Improvement</h4>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {feedback.improvements.map((improvement) => (
                          <span
                            key={improvement}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                          >
                            {improvement}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedFeedback(feedback)}
                className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}