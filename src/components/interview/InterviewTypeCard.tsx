import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, ChevronRight } from 'lucide-react';

interface InterviewType {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  duration: string;
  difficulty: string;
  matchScore?: number;
}

interface InterviewTypeCardProps {
  type: InterviewType;
  isSelected: boolean;
  onClick: () => void;
}

export function InterviewTypeCard({ type, isSelected, onClick }: InterviewTypeCardProps) {
  const Icon = type.icon;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-white rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-indigo-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${type.color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{type.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{type.description}</p>
          
          {type.matchScore && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-500">AI Match Score</span>
                <span className="font-medium text-indigo-600">{type.matchScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full"
                  style={{ width: `${type.matchScore}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                {type.duration}
              </span>
              <span className="flex items-center">
                <Target className="h-4 w-4 mr-1.5" />
                {type.difficulty}
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}