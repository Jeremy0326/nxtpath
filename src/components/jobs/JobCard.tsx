import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Bookmark, Briefcase, MapPin, DollarSign, Building, Clock, CheckCircle } from 'lucide-react';
import type { ExtendedJob } from '@/types/components';
import { cn } from '@/lib/utils';
import { useAiMatchReportStore } from '@/stores/aiMatchReportStore';

export interface JobCardProps {
  job: ExtendedJob;
  isSaved: boolean;
  isSelected: boolean;
  onSelect: (job: ExtendedJob) => void;
  onSave: (job: ExtendedJob) => void;
  onApply: (job: ExtendedJob) => void;
}

export function JobCard({ job, isSaved, isSelected, onSelect, onSave, onApply }: JobCardProps) {
  const { reports } = useAiMatchReportStore();
  const report = reports[job.id];

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(job);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply(job);
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min || !max) return 'Competitive';
    return `RM${(min / 1000).toFixed(0)}k - RM${(max / 1000).toFixed(0)}k`;
  };
  const formatPostedDate = (date?: string) => {
    const d = date || job.created_at;
    if (!d) return 'Recently posted';
    const posted = new Date(d);
    const now = new Date();
    const diff = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Posted today';
    if (diff === 1) return 'Posted yesterday';
    return `Posted ${diff} days ago`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
      onClick={() => onSelect(job)}
    >
      <Card
        className={cn(
          'p-5 border-2 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer',
          isSelected ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'bg-white'
        )}
      >
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="flex-grow">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center border flex-shrink-0">
                <img src={job.company.logo_url || '/placeholder.svg'} alt={job.company.name} className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{job.title}</h3>
                <p className="text-md text-gray-600 flex items-center gap-1.5"><Building size={16} /> {job.company.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1"><Clock size={14} className="mr-1" />{formatPostedDate(job.created_at)}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-700">
                <p className="flex items-center gap-2 capitalize"><MapPin size={16} /> {job.location.toLowerCase()}</p>
                <p className="flex items-center gap-2 capitalize"><Briefcase size={16} /> {job.job_type.replace('_', ' ').toLowerCase()}</p>
                <p className="flex items-center gap-2"><DollarSign size={16} /> {formatSalary(job.salary_min, job.salary_max)}</p>
                {/* AI Match/Vector Score Badge */}
                {typeof job.ai_match_score === 'number' ? (
                  <span
                    className="ml-2 px-2 py-1 rounded bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs font-semibold shadow"
                    aria-label="AI Match Score"
                    title="This is your advanced AI match score based on LLM analysis."
                  >
                    AI Match Score: {job.ai_match_score}%
                  </span>
                ) : typeof job.vector_score === 'number' ? (
                  <span
                    className="ml-2 px-2 py-1 rounded bg-gradient-to-r from-gray-400 to-blue-400 text-white text-xs font-semibold shadow"
                    aria-label="AI Vector Score"
                    title="This is your AI vector match score based on your CV and job requirements."
                  >
                    AI Vector Score: {job.vector_score}%
                  </span>
                ) : null}
            </div>
          </div>

          <div className="w-full sm:w-auto flex-shrink-0 flex flex-col items-center justify-center gap-2">
              <Button 
                onClick={handleApplyClick} 
                className={cn(
                  "w-full font-semibold transition-all",
                  job.isApplied ? "bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                )}
                disabled={job.isApplied}
                aria-label={job.isApplied ? 'Already applied' : 'Apply for this job'}
              >
                {job.isApplied ? (<><CheckCircle className="h-5 w-5 mr-2" />Applied</>) : 'Apply Now'}
              </Button>
              <Button 
              onClick={handleSaveClick}
              variant={isSaved ? "secondary" : "outline"}
              className="w-full"
            >
              <Bookmark className={cn("h-4 w-4 mr-2", isSaved && "fill-current text-indigo-600")} />
              {isSaved ? 'Saved' : 'Save'}
              </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}