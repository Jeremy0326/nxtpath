import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { CVAnalysisResult } from '../../types/cv';

interface CVAnalysisResultsProps {
  analysis: CVAnalysisResult;
}

export function CVAnalysisResults({ analysis }: CVAnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    if (score >= 60) return <AlertCircle className="h-6 w-6 text-yellow-600" />;
    return <XCircle className="h-6 w-6 text-red-600" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overall Match Score */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Overall Match Score</h3>
          {getScoreIcon(analysis.matchScore)}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getScoreColor(analysis.matchScore).replace('text', 'bg')}`}
                style={{ width: `${analysis.matchScore}%` }}
              />
            </div>
          </div>
          <span className={`text-2xl font-bold ${getScoreColor(analysis.matchScore)}`}>
            {analysis.matchScore}%
          </span>
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Analysis</h3>
        <div className="space-y-4">
          {analysis.skillMatches.map((match, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-700">{match.skill}</span>
              <div className="flex items-center space-x-2">
                {match.match ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm text-gray-500">
                  {match.relevance}% relevance
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Analysis</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Years of Experience</span>
            <span className="text-gray-900 font-medium">{analysis.experience.years} years</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Roles</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.experience.roles.map((role, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Industries</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.experience.industries.map((industry, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Education Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Education Analysis</h3>
        <div className="space-y-4">
          {analysis.education.map((edu, index) => (
            <div key={index} className="flex items-start justify-between">
              <div>
                <p className="text-gray-900 font-medium">{edu.degree}</p>
                <p className="text-gray-600">{edu.field}</p>
                <p className="text-sm text-gray-500">{edu.institution}</p>
              </div>
              <span className="text-sm text-gray-500">{edu.graduationYear}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
        <ul className="space-y-2">
          {analysis.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <span className="text-gray-700">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
} 