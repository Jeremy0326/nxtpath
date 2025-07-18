import React from 'react';
import { motion } from 'framer-motion';
import { Building, Globe, Calendar, Users, Link } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

interface FairTypeSelectorProps {
  fairType: 'physical' | 'virtual';
  onSelectFairType: (type: 'physical' | 'virtual') => void;
}

export function FairTypeSelector({ fairType, onSelectFairType }: FairTypeSelectorProps) {
  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Select Fair Type</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ y: -4 }}
          onClick={() => onSelectFairType('physical')}
          className={`p-6 rounded-xl text-left transition-all ${
            fairType === 'physical'
              ? 'bg-indigo-50 border-2 border-indigo-500'
              : 'bg-gray-50 border-2 border-gray-200 hover:border-indigo-200'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${
              fairType === 'physical' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
            }`}>
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h3 className={`text-lg font-medium ${
                fairType === 'physical' ? 'text-indigo-900' : 'text-gray-900'
              }`}>
                In-Person Career Fair
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Attend physically at the venue, meet recruiters face-to-face, and explore company booths
              </p>
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Scheduled Events
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1.5" />
                  In-Person Networking
                </div>
              </div>
              <div className="mt-4">
                <RouterLink 
                  to="/career-fairs/physical"
                  className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  <Link className="h-4 w-4 mr-1.5" />
                  Enter Physical Fair
                </RouterLink>
              </div>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ y: -4 }}
          onClick={() => onSelectFairType('virtual')}
          className={`p-6 rounded-xl text-left transition-all ${
            fairType === 'virtual'
              ? 'bg-indigo-50 border-2 border-indigo-500'
              : 'bg-gray-50 border-2 border-gray-200 hover:border-indigo-200'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${
              fairType === 'virtual' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
            }`}>
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h3 className={`text-lg font-medium ${
                fairType === 'virtual' ? 'text-indigo-900' : 'text-gray-900'
              }`}>
                Virtual Career Fair
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Join remotely from anywhere, attend virtual sessions, and chat with recruiters online
              </p>
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Virtual Sessions
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1.5" />
                  Online Networking
                </div>
              </div>
              <div className="mt-4">
                <RouterLink 
                  to="/career-fairs/virtual"
                  className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  <Link className="h-4 w-4 mr-1.5" />
                  Enter Virtual Fair
                </RouterLink>
              </div>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}