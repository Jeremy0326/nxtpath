import React from 'react';
import { JobFiltersProps } from './JobFilters';
import { JobFilters } from './JobFilters';

interface JobFiltersPanelProps extends JobFiltersProps {
  className?: string;
}

export function JobFiltersPanel({ className, ...filtersProps }: JobFiltersPanelProps) {
  return (
    <div className={className}>
      <JobFilters {...filtersProps} />
    </div>
  );
}

export default JobFiltersPanel; 
 
 