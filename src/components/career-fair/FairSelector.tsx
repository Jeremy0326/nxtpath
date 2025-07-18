import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Building, Users, ChevronRight } from 'lucide-react';

interface CareerFair {
  id: string;
  title: string;
  date: string;
  location: string;
  companies: number;
  registrationDeadline: string;
  type: 'in-person' | 'virtual' | 'hybrid';
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface FairSelectorProps {
  fairs: CareerFair[];
  selectedFairId: string | null;
  onSelectFair: (fairId: string) => void;
}

export function FairSelector({ fairs, selectedFairId, onSelectFair }: FairSelectorProps) {
  return (
    <div className="space-y-6">
      {fairs.map((fair) => (
        <motion.div
          key={fair.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer ${
            selectedFairId === fair.id ? 'ring-2 ring-indigo-500' : ''
          }`}
          onClick={() => onSelectFair(fair.id)}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">{fair.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  fair.type === 'virtual' 
                    ? 'bg-purple-100 text-purple-800'
                    : fair.type === 'hybrid'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {fair.type.charAt(0).toUpperCase() + fair.type.slice(1)}
                </span>
              </div>
              
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {fair.date}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  {fair.location}
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1.5" />
                  {fair.companies} Companies
                </div>
              </div>

              <p className="mt-2 text-sm text-orange-600">
                Register by {fair.registrationDeadline}
              </p>
            </div>
            
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}