import React, { useEffect, useState } from 'react';
import { Job } from '@/types/job';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAiMatchReportStore } from '@/stores/aiMatchReportStore';
import { AIMatchAnalysis } from './AIMatchAnalysis';
import { Briefcase, MapPin, DollarSign, Clock, Building, X, ChevronRight, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { parseJobListItems } from '../../utils/jobParsing';

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return 'Not disclosed';
  
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `RM${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `RM${(value / 1000).toFixed(0)}K`;
    }
    return `RM${value}`;
  };
  
  if (min && max) {
    return `${formatValue(min)} - ${formatValue(max)}`;
  } else if (min) {
    return `From ${formatValue(min)}`;
  } else if (max) {
    return `Up to ${formatValue(max)}`;
  }
};

const formatDate = (dateString: string | undefined, fallback?: string) => {
  const d = dateString || fallback;
  if (!d) return 'Posted recently';
  const date = new Date(d);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const JobDescriptionView = ({ job }: { job: Job }) => {
  // Ensure job has required fields with defaults
  const jobWithDefaults = {
    ...job,
    description: job.description || 'No description provided.',
    responsibilities: job.responsibilities || 'No specific responsibilities listed.',
    requirements: job.requirements || 'No specific requirements listed.'
  };

  const responsibilities = parseJobListItems(jobWithDefaults.responsibilities);
  const requirements = parseJobListItems(jobWithDefaults.requirements);
  
  return (
    <div className="space-y-8 text-sm">
      {/* Company info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <img 
              src={job.company?.logo_url || '/placeholder.svg'} 
              alt={`${job.company?.name || 'Company'} logo`} 
              className="w-12 h-12 object-contain"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{job.company?.name || 'Company'}</h3>
            <p className="text-gray-500 flex items-center">
              <Building size={14} className="mr-1" />
              Technology
            </p>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed">{jobWithDefaults.description}</p>
      </div>
      
      {/* Key details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <MapPin size={18} className="text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Location</h3>
          </div>
          <p className="text-gray-700">{job.location}</p>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Briefcase size={18} className="text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Job Type</h3>
          </div>
          <p className="text-gray-700">{job.job_type}</p>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <DollarSign size={18} className="text-amber-600" />
            </div>
            <h3 className="font-medium text-gray-900">Salary Range</h3>
          </div>
          <p className="text-gray-700">{formatSalary(job.salary_min, job.salary_max)}</p>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Calendar size={18} className="text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">Posted Date</h3>
          </div>
          <p className="text-gray-700">{formatDate(job.created_at)}</p>
        </div>
      </div>
      
      {/* Responsibilities */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <span className="bg-indigo-100 p-1.5 rounded-md mr-2">
            <ChevronRight size={16} className="text-indigo-600" />
          </span>
          Key Responsibilities
        </h3>
        <ul className="space-y-3 list-disc list-inside">
          {responsibilities.map((item, index) => (
            <li key={index} className="text-gray-700">
              {item}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Requirements */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <span className="bg-blue-100 p-1.5 rounded-md mr-2">
            <ChevronRight size={16} className="text-blue-600" />
          </span>
          Requirements
        </h3>
        <ul className="space-y-3 list-disc list-inside">
          {requirements.map((item, index) => (
            <li key={index} className="text-gray-700">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, isOpen, onClose }) => {
  const { reports, fetchReport } = useAiMatchReportStore();
  const [activeTab, setActiveTab] = useState<string>("description");

  useEffect(() => {
    if (job) {
      const report = reports[job.id];
      if (!report || (!report.data && !report.isLoading && !report.error)) {
        // Pre-fetch in the background when modal opens
        fetchReport(job.id);
      }
    }
  }, [job, reports, fetchReport]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'ai-analysis' && job) {
      fetchReport(job.id);
    }
  };

  const handleRefreshAnalysis = () => {
    if (job) {
      fetchReport(job.id, true); // Force refresh
    }
  };

  if (!job) return null;
  
  // Ensure job has required fields for safe rendering
  const safeJob: Job = {
    ...job,
    id: job.id ? String(job.id) : '0',
    title: job.title || 'Job Position',
    description: job.description || 'No description provided.',
    company: job.company || { id: 0, name: 'Unknown Company' },
    location: job.location || 'Remote',
    job_type: job.job_type || 'full-time',
    created_at: job.created_at || new Date().toISOString(),
    skills: job.skills || [],
    requirements: job.requirements || [],
    responsibilities: job.responsibilities || [],
  };
  
  const reportData = reports[job.id];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white">
        <DialogTitle className="sr-only">Job Details for {safeJob.title}</DialogTitle>
        <DialogDescription className="sr-only">Detailed job information and AI match analysis for {safeJob.title} at {safeJob.company.name}.</DialogDescription>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white p-6 flex-shrink-0 relative">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{safeJob.title}</h2>
              <p className="text-indigo-100 mt-1">{safeJob.company.name}</p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                  <MapPin size={14} className="mr-1" /> {safeJob.location}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                  <Briefcase size={14} className="mr-1" /> {safeJob.job_type}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                  <DollarSign size={14} className="mr-1" /> {formatSalary(safeJob.salary_min, safeJob.salary_max)}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                  <Clock size={14} className="mr-1" /> {formatDate(safeJob.created_at)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 py-2 flex-shrink-0">
          <Tabs 
            value={activeTab} 
            onValueChange={handleTabChange} 
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger 
                value="description"
                className={cn(
                  "data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-md",
                  "data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600"
                )}
              >
                Job Description
              </TabsTrigger>
              <TabsTrigger 
                value="ai-analysis"
                className={cn(
                  "data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-md",
                  "data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600"
                )}
              >
                AI Match Analysis
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Content */}
        <div className="flex-grow overflow-auto p-6">
          {activeTab === "description" && <JobDescriptionView job={safeJob} />}
          {activeTab === "ai-analysis" && (
            <AIMatchAnalysis
              data={reportData?.data || null}
              isLoading={!reportData || reportData.isLoading}
              error={reportData?.error || null}
              processing={reportData?.processing}
              audience="student"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 