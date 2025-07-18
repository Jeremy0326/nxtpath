import React from 'react';
import { Target, Award, FileText, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors, componentStyles, typography } from '../../lib/design-system';

interface CareerReadinessScore {
  overall: number;
  resume: number;
  skills: number;
  interviews: number;
}

interface CareerReadinessPanelProps {
  score: CareerReadinessScore;
  suggestions: string[];
}

export function CareerReadinessPanel({ score, suggestions }: CareerReadinessPanelProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600 bg-green-50 border-green-100';
    if (value >= 60) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const getScoreBarColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const scoreItems = [
    { label: 'Resume', value: score.resume, icon: <FileText className="h-4 w-4 text-indigo-500" /> },
    { label: 'Skills', value: score.skills, icon: <BookOpen className="h-4 w-4 text-indigo-500" /> },
    { label: 'Interviews', value: score.interviews, icon: <Sparkles className="h-4 w-4 text-indigo-500" /> }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${componentStyles.card.base} ${componentStyles.card.hover}`}
    >
      <div className={`${componentStyles.card.header} flex items-center justify-between`}>
        <div className="flex items-center">
          <Award className="h-5 w-5 text-indigo-500 mr-2" />
          <h2 className={`${typography.fontSize.lg} font-semibold text-gray-900`}>Career Readiness</h2>
        </div>
        <div className={`flex items-center px-3 py-1.5 rounded-full border ${getScoreColor(score.overall)}`}>
          <Target className="h-4 w-4 mr-1.5" />
          <span className="font-bold">{score.overall}%</span>
        </div>
      </div>

      <div className={componentStyles.card.body}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {scoreItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col p-4 rounded-lg border border-gray-100 bg-white shadow-sm"
            >
              <div className="flex items-center mb-3">
                {item.icon}
                <span className="text-sm font-medium text-gray-700 ml-2">{item.label}</span>
              </div>
              
              <div className="flex items-baseline mb-2">
                <span className={`text-xl font-bold ${item.value >= 80 ? 'text-green-600' : item.value >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {item.value}%
                </span>
                <span className="text-xs text-gray-500 ml-1">completion</span>
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`${getScoreBarColor(item.value)} h-full rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`${typography.fontSize.base} font-semibold text-gray-900`}>AI Suggestions</h3>
            <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
              View All
              <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </button>
          </div>
          
          <div className="space-y-3">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3.5 rounded-lg bg-indigo-50 border border-indigo-100"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
              </motion.div>
            ))}
            
            {suggestions.length > 3 && (
              <p className="text-xs text-center text-gray-500 pt-1">
                +{suggestions.length - 3} more suggestions
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}