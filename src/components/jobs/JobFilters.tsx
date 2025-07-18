import React, { useState } from 'react';
import { Filter, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobSearchParams } from '../../services/jobService';

interface FilterOption {
  label: string;
  value: string;
}

export interface JobFiltersProps {
  filters: JobSearchParams;
  onFilterChange: (newFilters: Partial<JobSearchParams>) => void;
  totalJobs?: number;
  savedJobsCount?: number;
  onShowSavedJobs?: () => void;
}

const industries: FilterOption[] = [
  { label: 'Software', value: 'Software' },
  { label: 'FinTech', value: 'FinTech' },
  { label: 'Logistics', value: 'Logistics' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Education', value: 'Education' },
  { label: 'Other', value: 'Other' },
];

const jobTypes: FilterOption[] = [
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Part-time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Temporary', value: 'TEMPORARY' },
];

const companySizes: FilterOption[] = [
  { label: 'Seed (1-10 employees)', value: 'SEED' },
  { label: 'Startup (11-50 employees)', value: 'STARTUP' },
  { label: 'Scale-up (51-250 employees)', value: 'SCALEUP' },
  { label: 'Mid-size (251-1000 employees)', value: 'MID_SIZE' },
  { label: 'Large (1001-5000 employees)', value: 'LARGE' },
  { label: 'Enterprise (5001+ employees)', value: 'ENTERPRISE' },
];

const remoteOptions: FilterOption[] = [
  { label: 'On-site', value: 'ON_SITE' },
  { label: 'Hybrid', value: 'HYBRID' },
  { label: 'Remote', value: 'REMOTE' },
];

const salaryRanges: FilterOption[] = [
  { label: 'Any Salary', value: '0-999999' },
  { label: '$0 - $50k', value: '0-50000' },
  { label: '$50k - $100k', value: '50000-100000' },
  { label: '$100k - $150k', value: '100000-150000' },
  { label: '$150k+', value: '150000-999999' },
];

const sortOptions: FilterOption[] = [
  { label: 'AI Match Score', value: 'match' },
  { label: 'Salary (High to Low)', value: 'salary-desc' },
  { label: 'Salary (Low to High)', value: 'salary-asc' },
  { label: 'Most Recent', value: 'date' },
  { label: 'Application Deadline', value: 'deadline' },
];

export function JobFilters({ filters, onFilterChange, totalJobs = 0, savedJobsCount = 0, onShowSavedJobs = () => {} }: JobFiltersProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('industry');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleClearFilters = () => {
    onFilterChange({
      job_type: [],
      salary_min: 0,
      salary_max: 999999,
      location: '',
      skills: [],
      industry: '',
      remote: false,
      sort_by: 'recent',
      page: 1,
    });
  };

  const filterSections = [
    {
      id: 'industry',
      title: 'Industry',
      content: (
        <select
          value={filters.industry || ''}
          onChange={(e) => onFilterChange({ industry: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Industries</option>
          {industries.map((industry) => (
            <option key={industry.value} value={industry.value}>
              {industry.label}
            </option>
          ))}
        </select>
      )
    },
    {
      id: 'jobType',
      title: 'Job Type',
      content: (
        <div className="space-y-3">
          {jobTypes.map((type) => (
            <label key={type.value} className="flex items-center">
              <input
                type="checkbox"
                checked={Array.isArray(filters.job_type) && filters.job_type.includes(type.value)}
                onChange={(e) => {
                  const prevTypes = Array.isArray(filters.job_type) ? filters.job_type : [];
                  const newTypes = e.target.checked
                    ? [...prevTypes, type.value]
                    : prevTypes.filter((t: string) => t !== type.value);
                  onFilterChange({ job_type: newTypes });
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">{type.label}</span>
            </label>
          ))}
        </div>
      )
    },
    {
      id: 'companySize',
      title: 'Company Size',
      content: (
        <select
          value={filters.company_size || ''}
          onChange={(e) => onFilterChange({ company_size: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Sizes</option>
          {companySizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      )
    },
    {
      id: 'remoteOption',
      title: 'Remote Option',
      content: (
        <select
          value={filters.remote_option || ''}
          onChange={(e) => onFilterChange({ remote_option: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All</option>
          {remoteOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )
    },
    {
      id: 'salary',
      title: 'Salary Range',
      content: (
        <select
          value={`${filters.salary_min || 0}-${filters.salary_max || 999999}`}
          onChange={(e) => {
            const [min, max] = e.target.value.split('-').map(Number);
            onFilterChange({ salary_min: min, salary_max: max });
          }}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          {salaryRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      )
    },
    {
      id: 'skills',
      title: 'Required Skills',
      content: (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Add a skill..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  const skill = input.value.trim();
                  if (skill && !(filters.skills || []).includes(skill)) {
                    onFilterChange({ skills: [...(filters.skills || []), skill] });
                    input.value = '';
                  }
                }
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(filters.skills || []).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {skill}
                <button
                  onClick={() => {
                    const newSkills = (filters.skills || []).filter(s => s !== skill);
                    onFilterChange({ skills: newSkills });
                  }}
                  className="ml-1.5 text-indigo-600 hover:text-indigo-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-sm"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isCollapsed ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Sections */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {filterSections.map((section) => (
                <div key={section.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{section.title}</span>
                    {expandedSection === section.id ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4">{section.content}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}