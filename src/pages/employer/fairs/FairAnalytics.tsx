import React from 'react';
import { motion } from 'framer-motion';
import { FairAnalytics as FairAnalyticsComponent } from '../../../components/employer/events/FairAnalytics';

const mockAnalytics = {
  totalRegistrations: 156,
  registrationTrend: [
    { date: 'Mar 1', count: 10 },
    { date: 'Mar 5', count: 25 },
    { date: 'Mar 10', count: 45 },
    { date: 'Mar 15', count: 78 },
    { date: 'Mar 20', count: 156 },
  ],
  eventBreakdown: [
    { type: 'Presentations', count: 12 },
    { type: 'Interviews', count: 45 },
    { type: 'Networking', count: 25 },
  ],
  interactions: [
    { type: 'Resume Downloads', count: 78 },
    { type: 'Messages Sent', count: 45 },
    { type: 'Interviews Scheduled', count: 24 },
    { type: 'Booth Visits', count: 156 },
  ],
  demographics: [
    { university: 'Stanford University', count: 45 },
    { university: 'MIT', count: 35 },
    { university: 'UC Berkeley', count: 30 },
    { university: 'Carnegie Mellon', count: 25 },
    { university: 'Others', count: 21 },
  ],
};

export function FairAnalyticsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fair Analytics</h1>
            <p className="mt-1 text-gray-500">Track engagement and performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <select className="px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option>Spring Tech Fair 2024</option>
              <option>Virtual Career Fair</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <FairAnalyticsComponent analytics={mockAnalytics} />
    </motion.div>
  );
}