import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, FileText, Clock, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface FairAnalytics {
  totalRegistrations: number;
  registrationTrend: {
    date: string;
    count: number;
  }[];
  eventBreakdown: {
    type: string;
    count: number;
  }[];
  interactions: {
    type: string;
    count: number;
  }[];
  demographics: {
    university: string;
    count: number;
  }[];
}

interface FairAnalyticsProps {
  analytics: FairAnalytics;
}

export function FairAnalytics({ analytics }: FairAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Registrations',
            value: analytics.totalRegistrations,
            icon: Users,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Messages Received',
            value: '45',
            icon: MessageSquare,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Resumes Collected',
            value: '78',
            icon: FileText,
            color: 'bg-purple-100 text-purple-600',
          },
          {
            label: 'Avg. Interaction Time',
            value: '12m',
            icon: Clock,
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
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Registration Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-6">Registration Trend</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.registrationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4F46E5"
                strokeWidth={2}
                dot={{ fill: '#4F46E5', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-6">Event Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.eventBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="type" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* University Demographics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-6">University Demographics</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.demographics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis dataKey="university" type="category" stroke="#6B7280" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Interaction Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-6">Interaction Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.interactions.map((interaction, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{interaction.type}</span>
                <span className="text-lg font-semibold text-gray-900">{interaction.count}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}