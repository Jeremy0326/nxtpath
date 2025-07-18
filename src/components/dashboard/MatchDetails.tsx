import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  FileText,
  Sparkles,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Job } from '../../types/job';
import { colors, componentStyles, typography } from '../../lib/design-system';

interface MatchDetailsProps {
  job: Job;
}

// Extended Job type to handle optional properties
interface ExtendedJob extends Job {
  detailed_report?: string;
}

const DetailRow = ({ 
  icon, 
  label, 
  value, 
  colorClass, 
  valueColor 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | React.ReactNode; 
  colorClass?: string;
  valueColor?: string;
}) => (
  <div className="flex items-start py-3">
    <div className={`mr-4 h-10 w-10 rounded-full flex items-center justify-center ${colorClass || 'bg-gray-100'}`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-500">{label}</p>
      <div className={`text-base font-semibold ${valueColor || 'text-gray-800'}`}>{value}</div>
    </div>
  </div>
);

const SkillTag = ({ skill, isMatch }: { skill: string; isMatch: boolean }) => (
  <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
    isMatch ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
  }`}>
    {isMatch ? 
      <CheckCircle className="h-3 w-3 mr-1.5" /> : 
      <AlertTriangle className="h-3 w-3 mr-1.5" />
    }
    {skill}
  </span>
);

export function MatchDetails({ job }: MatchDetailsProps) {
  // Cast job to ExtendedJob to handle the detailed_report property
  const extendedJob = job as ExtendedJob;
  
  const hasHighlightedSkills = job.highlightedSkills && job.highlightedSkills.length > 0;
  const hasMissingSkills = job.missingSkills && job.missingSkills.length > 0;
  
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-800';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-indigo-600';
    return 'text-amber-600';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-2"
    >
      <h3 className={`${typography.fontSize.xl} font-semibold text-gray-900 mb-6 flex items-center`}>
        <Sparkles className="h-5 w-5 text-indigo-500 mr-2" />
        Match Analysis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <DetailRow 
          icon={<TrendingUp className="h-5 w-5 text-indigo-600" />}
          label="Overall Match Score"
          value={<span className="text-xl">{job.matchScore}%</span>}
          colorClass="bg-indigo-100"
          valueColor={getScoreColor(job.matchScore)}
        />
        
        <DetailRow 
          icon={<Lightbulb className="h-5 w-5 text-amber-600" />}
          label="Primary Match Reason"
          value={job.matchReasons?.[0] || 'N/A'}
          colorClass="bg-amber-100"
        />
        
        {job.experienceMatch && (
          <DetailRow 
            icon={<Briefcase className="h-5 w-5 text-blue-600" />}
            label="Experience Match"
            value={<>
              <span className={getScoreColor(job.experienceMatch.score)}>{job.experienceMatch.score}%</span>
              <p className="text-xs text-gray-500 mt-1">{job.experienceMatch.details}</p>
            </>}
            colorClass="bg-blue-100"
          />
        )}
        
        {job.educationMatch && (
          <DetailRow 
            icon={<GraduationCap className="h-5 w-5 text-purple-600" />}
            label="Education Match"
            value={<>
              <span className={getScoreColor(job.educationMatch.score)}>{job.educationMatch.score}%</span>
              <p className="text-xs text-gray-500 mt-1">{job.educationMatch.details}</p>
            </>}
            colorClass="bg-purple-100"
          />
        )}
      </div>

      <div className="mt-8 bg-gray-50 rounded-xl p-5 border border-gray-100">
        <h4 className={`${typography.fontSize.lg} font-semibold text-gray-800 mb-4`}>Skills Breakdown</h4>
        <div className="space-y-6">
          <div>
            <div className="flex items-center mb-3">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <h5 className="text-sm font-medium text-gray-700">Matched Skills</h5>
            </div>
            
            {hasHighlightedSkills ? (
              <div className="flex flex-wrap gap-2">
                {job.highlightedSkills?.map(skill => <SkillTag key={skill} skill={skill} isMatch={true} />)}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No direct skill matches were identified based on the job description.</p>
            )}
          </div>
          
          <div>
            <div className="flex items-center mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
              <h5 className="text-sm font-medium text-gray-700">Skills to Develop</h5>
            </div>
            
            {hasMissingSkills ? (
              <div className="flex flex-wrap gap-2">
                {job.missingSkills?.map(skill => <SkillTag key={skill} skill={skill} isMatch={false} />)}
              </div>
            ) : (
              <div className="flex items-center text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                <p>Great news! You appear to have all the required skills for this role.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {extendedJob.detailed_report && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-start">
            <div className="p-2 bg-gray-100 rounded-lg mr-3">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h4 className={`${typography.fontSize.lg} font-semibold text-gray-800 mb-2`}>Detailed Analysis Report</h4>
              <div className="prose prose-sm max-w-none text-gray-700 bg-white p-4 rounded-lg border border-gray-100">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {extendedJob.detailed_report}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {job.improvementSuggestions && job.improvementSuggestions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-indigo-50 rounded-xl p-5 border border-indigo-100"
        >
          <div className="flex items-start">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <Lightbulb className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h4 className={`${typography.fontSize.lg} font-semibold text-gray-800 mb-3`}>AI Suggestions for Improvement</h4>
              <ul className="space-y-3 text-gray-700">
                {job.improvementSuggestions.map((suggestion, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start"
                  >
                    <span className="h-5 w-5 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-600 mr-2 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{suggestion}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
      
      {job.advanced_analysis && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 rounded-xl p-5 border border-blue-100"
        >
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`${typography.fontSize.lg} font-semibold text-gray-800`}>Advanced AI Analysis</h4>
                <span className={`${componentStyles.badge.base} ${
                  job.advanced_analysis.confidence_level === 'High' ? componentStyles.badge.variants.green :
                  job.advanced_analysis.confidence_level === 'Medium' ? componentStyles.badge.variants.blue :
                  componentStyles.badge.variants.yellow
                }`}>
                  {job.advanced_analysis.confidence_level} Confidence
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{job.advanced_analysis.reasoning}</p>
              
              {job.advanced_analysis.recommendations && job.advanced_analysis.recommendations.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h5>
                  <ul className="space-y-2 text-gray-700">
                    {job.advanced_analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 