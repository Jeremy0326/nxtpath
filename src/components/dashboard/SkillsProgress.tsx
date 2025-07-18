import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { colors, componentStyles, typography } from '../../lib/design-system';

interface Skill {
  name: string;
  progress: number;
  category?: string;
}

interface SkillsProgressProps {
  skills?: Skill[];
}

const defaultSkills: Skill[] = [
  { name: 'JavaScript', progress: 85, category: 'technical' },
  { name: 'React', progress: 80, category: 'technical' },
  { name: 'Node.js', progress: 70, category: 'technical' },
  { name: 'Communication', progress: 85, category: 'soft' },
  { name: 'Problem Solving', progress: 80, category: 'soft' },
  { name: 'Teamwork', progress: 90, category: 'soft' },
];

export function SkillsProgress({ skills = defaultSkills }: SkillsProgressProps) {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-indigo-500';
    return 'bg-amber-500';
  };

  // Group skills by category
  const technicalSkills = skills.filter(skill => skill.category === 'technical');
  const softSkills = skills.filter(skill => skill.category === 'soft');
  const otherSkills = skills.filter(skill => !skill.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${componentStyles.card.base}`}
    >
      <div className={`${componentStyles.card.header} flex items-center`}>
        <Zap className="h-5 w-5 text-indigo-500 mr-2" />
        <h2 className={`${typography.fontSize.lg} font-semibold text-gray-900`}>Skills Progress</h2>
      </div>
      
      <div className={componentStyles.card.body}>
        {technicalSkills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Technical Skills</h3>
            <div className="space-y-4">
              {technicalSkills.map((skill, index) => (
                <motion.div 
                  key={skill.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-800">{skill.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      skill.progress >= 80 ? 'bg-green-100 text-green-800' : 
                      skill.progress >= 60 ? 'bg-indigo-100 text-indigo-800' : 
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {skill.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                      className={`${getProgressColor(skill.progress)} h-full rounded-full`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {softSkills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Soft Skills</h3>
            <div className="space-y-4">
              {softSkills.map((skill, index) => (
                <motion.div 
                  key={skill.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-800">{skill.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      skill.progress >= 80 ? 'bg-green-100 text-green-800' : 
                      skill.progress >= 60 ? 'bg-indigo-100 text-indigo-800' : 
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {skill.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 + 0.3 }}
                      className={`${getProgressColor(skill.progress)} h-full rounded-full`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {otherSkills.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Other Skills</h3>
            <div className="space-y-4">
              {otherSkills.map((skill, index) => (
                <motion.div 
                  key={skill.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-800">{skill.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      skill.progress >= 80 ? 'bg-green-100 text-green-800' : 
                      skill.progress >= 60 ? 'bg-indigo-100 text-indigo-800' : 
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {skill.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 + 0.6 }}
                      className={`${getProgressColor(skill.progress)} h-full rounded-full`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}