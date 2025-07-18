import React from 'react';
import { motion } from 'framer-motion';
import { Building, Users, Video, Briefcase, Star } from 'lucide-react';

interface VirtualBoothProps {
  booth: {
    id: string;
    company: string;
    logo: string;
    representatives: number;
    status: 'online' | 'busy' | 'offline';
    matchScore?: number;
  };
  onEnterBooth: (boothId: string) => void;
  onViewJobs: (boothId: string) => void;
}

export function VirtualBoothCard({ booth, onEnterBooth, onViewJobs }: VirtualBoothProps) {
  return (
    <motion.div
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
          {booth.matchScore && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Star className="h-3 w-3 mr-1" />
                {booth.matchScore}% Match
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end space-x-3">
        <button 
          onClick={() => onViewJobs(booth.id)}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <Briefcase className="h-4 w-4 mr-1.5" />
          View Jobs
        </button>
        <button
          onClick={() => onEnterBooth(booth.id)}
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
  );
}