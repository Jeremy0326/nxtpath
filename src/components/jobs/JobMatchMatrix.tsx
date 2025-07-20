import React from 'react';
import { CheckCircle, AlertCircle, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ExtendedJob } from '../../types/components';

interface MatchCategory {
  name: string;
  score: number;
  weight: number;
  description: string;
  matches: string[];
  gaps: string[];
}

interface JobMatchMatrixProps {
  job: Job;
  matchDetails: {
    skills: MatchCategory;
    experience: MatchCategory;
    education: MatchCategory;
    overall_score: number;
  };
}

export function JobMatchMatrix({ job, matchDetails }: JobMatchMatrixProps) {
  const categories = [
    {
      ...matchDetails.skills,
      name: 'Skills',
      color: 'blue',
      weight: job.matching_weightage?.skill_weight || 0.5,
    },
    {
      ...matchDetails.experience,
      name: 'Experience',
      color: 'green',
      weight: job.matching_weightage?.experience_weight || 0.3,
    },
    {
      ...matchDetails.education,
    name: 'Education',
      color: 'purple',
      weight: job.matching_weightage?.education_weight || 0.2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-2" />
          <span className="text-lg font-semibold text-gray-900">Overall Match Score</span>
        </div>
        <div className="text-2xl font-bold text-blue-600">{matchDetails.overall_score}%</div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">
                  Weight: {(category.weight * 100).toFixed(0)}%
        </p>
      </div>
              <div className={`text-xl font-bold text-${category.color}-600`}>
                {category.score}%
              </div>
            </div>

            <div className="space-y-4">
              {/* Matches */}
            {category.matches.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Matching Points</h4>
                  <ul className="space-y-2">
                    {category.matches.map((match, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{match}</span>
                      </li>
                  ))}
                  </ul>
              </div>
            )}

              {/* Gaps */}
            {category.gaps.length > 0 && (
              <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Areas for Improvement</h4>
                  <ul className="space-y-2">
                    {category.gaps.map((gap, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {category.description && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-start text-sm">
                  <ArrowRight className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{category.description}</span>
                  </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}