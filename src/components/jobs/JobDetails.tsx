import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, Building, DollarSign, MapPin, Send, X, Bookmark } from 'lucide-react';

import type { Job } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface JobDetailsProps {
  job: Job | null;
  isOpen: boolean;
  isSaved: boolean;
  onClose: () => void;
  onApply: () => void;
  onSave: () => void;
}

export function JobDetails({ job, isOpen, isSaved, onClose, onApply, onSave }: JobDetailsProps) {
  if (!job) return null;

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min || !max) return 'Not Disclosed';
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const ListSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
    <div className="p-6 bg-white rounded-xl border">
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <ul className="list-disc pl-5 space-y-2 text-gray-700">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 40 }}
            className="fixed top-0 right-0 h-full w-full max-w-3xl bg-gray-50 z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border">
                  <img src={job.company.logo_url || '/placeholder.svg'} alt={job.company.name} className="w-12 h-12 object-contain" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                  <p className="text-md text-gray-600 flex items-center gap-1.5"><Building size={16} /> {job.company.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100"><X className="h-6 w-6" /></button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Key Details Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-white rounded-lg border capitalize"><p className="font-semibold text-gray-800">{job.location.toLowerCase()}</p><p className="text-xs text-gray-500">Location</p></div>
                  <div className="p-3 bg-white rounded-lg border capitalize"><p className="font-semibold text-gray-800">{job.job_type.replace('_', ' ').toLowerCase()}</p><p className="text-xs text-gray-500">Job Type</p></div>
                  <div className="p-3 bg-white rounded-lg border"><p className="font-semibold text-gray-800">{formatSalary(job.salary_min, job.salary_max)}</p><p className="text-xs text-gray-500">Salary</p></div>
                  <div className="p-3 bg-white rounded-lg border"><p className="font-semibold text-gray-800">{job.remote_option.replace('_', ' ').toLowerCase()}</p><p className="text-xs text-gray-500">Remote</p></div>
              </div>

              {/* Job Description */}
              <div className="p-6 bg-white rounded-xl border">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Job Description</h3>
                <div className="prose prose-sm max-w-none text-gray-700">{job.description}</div>
              </div>
              
              <ListSection title="Key Responsibilities" items={job.responsibilities} />
              <ListSection title="Requirements" items={job.requirements} />
            </div>

            {/* AI Match Score */}
            {typeof job.vector_score === 'number' && (
              <div className="mt-6">
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm">
                  AI Match: {job.vector_score}%
                </span>
              </div>
            )}
            {/* AI Match Report Placeholder */}
            {job.ai_match_report && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-700 mb-2">AI Match Report</h4>
                <pre className="text-xs text-blue-900 whitespace-pre-wrap">{JSON.stringify(job.ai_match_report, null, 2)}</pre>
              </div>
            )}

            {/* Footer */}
            <div className="p-5 border-t border-gray-200 bg-white/80 backdrop-blur-sm sticky bottom-0">
                <div className="flex justify-end items-center gap-4">
                  <Button variant="outline" onClick={onSave}>
                      <Bookmark className={cn("h-5 w-5 mr-2", isSaved && "fill-current text-indigo-600")} />
                      {isSaved ? 'Saved' : 'Save Job'}
                  </Button>
                  <Button onClick={onApply} className={`min-w-[150px] font-semibold ${job.isApplied ? 'bg-green-100 text-green-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`} disabled={job.isApplied}>
                    <Send className="h-5 w-5 mr-2" />
                    {job.isApplied ? 'Applied' : 'Apply Now'}
                  </Button>
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}