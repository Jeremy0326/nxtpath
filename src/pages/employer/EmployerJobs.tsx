import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Settings, MoreVertical, Users, MapPin, Briefcase, Calendar, Edit, Trash2, Eye, List, LayoutGrid, BarChart3, ChevronRight
} from 'lucide-react';
import { employerService } from '../../services/employerService';
import { JobFormModal } from '../../components/employer/jobs/JobFormModal';
import { JobMatchingWeightage } from '../../components/employer/jobs/JobMatchingWeightage';
import { useToast } from '../../hooks/useToast';
import type { Job } from '../../types/job';
import { Link } from 'react-router-dom';

type ViewMode = 'list' | 'grid';

export function EmployerJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | undefined>();
  const [isWeightageModalOpen, setIsWeightageModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { addToast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const params: { status?: string, search?: string } = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await employerService.getEmployerJobs(params);
      setJobs(response.results);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      addToast({
        title: 'Error',
        description: 'Failed to fetch jobs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchJobs();
  }

  const handleCreateJob = () => {
    setSelectedJob(undefined);
    setIsJobFormOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setIsJobFormOpen(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;

    try {
      await employerService.deleteJob(jobId);
      addToast({
        title: 'Success',
        description: 'Job deleted successfully.',
        variant: 'default',
      });
      fetchJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete job. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleWeightageEdit = (job: Job) => {
    setSelectedJob(job);
    setIsWeightageModalOpen(true);
  };

  const filteredJobs = jobs; // Filtering is now handled by the backend

  return (
    <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-8xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
            <p className="text-md text-gray-600 mt-1">Manage your company's job listings and applicants.</p>
          </div>
          <button
            onClick={handleCreateJob}
            className="flex items-center mt-4 sm:mt-0 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Job
          </button>
        </header>

        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <form onSubmit={handleSearch} className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by title, department, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </form>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-auto">
                <Filter className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-11 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none bg-white transition-all"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}><List/></button>
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}><LayoutGrid/></button>
              </div>
            </div>
          </div>
        </div>
        
        <AnimatePresence>
            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading jobs...</div>
            ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No jobs found.</div>
            ) : (
                <motion.div 
                    initial={{opacity: 0}} animate={{opacity: 1}}
                    className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}
                >
                    {filteredJobs.map(job => viewMode === 'grid' ? 
                        <JobCard key={job.id} job={job} onEdit={handleEditJob} onDelete={handleDeleteJob} onWeightage={handleWeightageEdit} /> :
                        <JobListItem key={job.id} job={job} onEdit={handleEditJob} onDelete={handleDeleteJob} onWeightage={handleWeightageEdit} />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {isJobFormOpen && (
        <JobFormModal
          isOpen={isJobFormOpen}
          onClose={() => setIsJobFormOpen(false)}
          job={selectedJob}
          onSave={() => { fetchJobs(); setIsJobFormOpen(false); }}
        />
      )}

      {isWeightageModalOpen && selectedJob && (
        <JobMatchingWeightage
          isOpen={isWeightageModalOpen}
          onClose={() => setIsWeightageModalOpen(false)}
          job={selectedJob}
          onSave={() => { fetchJobs(); setIsWeightageModalOpen(false); }}
        />
      )}
    </div>
  );
}

const JobCard = ({ job, onEdit, onDelete, onWeightage }) => {
    const getStatusStyles = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'closed': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }
    const applicantProgress = Math.min(((job.applicants_count || 0) / 50) * 100, 100); // Assuming a target of 50 applicants

    return (
        <motion.div layout initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.9}}
            className="bg-white rounded-xl border border-gray-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
        >
            <div className="p-6 flex-grow">
                <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    <DropdownMenu onEdit={() => onEdit(job)} onDelete={() => onDelete(job.id)} onWeightage={() => onWeightage(job)} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-4">{job.title}</h3>
                <div className="mt-4 flex flex-col space-y-3 text-sm text-gray-600">
                    <div className="flex items-center"><MapPin className="h-4 w-4 mr-2.5 text-gray-400"/> {job.location}</div>
                    <div className="flex items-center"><Briefcase className="h-4 w-4 mr-2.5 text-gray-400"/> {job.job_type}</div>
                    <div className="flex items-center"><Calendar className="h-4 w-4 mr-2.5 text-gray-400"/> Closes on {new Date(job.application_deadline).toLocaleDateString()}</div>
                </div>
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Applicants</span>
                        <span className="text-sm font-semibold text-indigo-600">{job.applicants_count || 0} / 50</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${applicantProgress}%` }}></div>
            </div>
                </div>
            </div>
            <div className="bg-gray-50/70 p-4 border-t flex justify-end">
                <Link to={`/employer/jobs/${job.id}/applicants`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
                    View Applicants <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </div>
        </motion.div>
    );
};

const JobListItem = ({ job, onEdit, onDelete, onWeightage }) => {
    const getStatusStyles = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'closed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    return (
        <motion.div layout initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}}
            className="bg-white rounded-lg border border-gray-200/80 shadow-sm p-4 flex items-center justify-between"
        >
            <div className="flex items-center flex-1 min-w-0">
                <div className="flex-shrink-0 mr-4">
                     <div className="w-12 h-12 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-lg"><Briefcase/></div>
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-lg text-gray-900 truncate">{job.title}</h4>
                    <p className="text-gray-500 text-sm truncate">{job.location}</p>
                </div>
            </div>
            <div className="flex items-center space-x-6 ml-6">
                <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-5 w-5 mr-2 text-gray-400"/>
                    <span className="font-semibold">{job.applicants_count || 0}</span>
                </div>
                <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                </div>
                <div className="text-sm text-gray-500">{new Date(job.application_deadline).toLocaleDateString()}</div>
                <DropdownMenu onEdit={() => onEdit(job)} onDelete={() => onDelete(job.id)} onWeightage={() => onWeightage(job)} />
            </div>
        </motion.div>
    );
};

const DropdownMenu = ({ onEdit, onDelete, onWeightage }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-100">
                <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
            <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.95}}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <button onClick={onEdit} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Edit className="h-4 w-4 mr-3"/>Edit</button>
                    <button onClick={onWeightage} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><BarChart3 className="h-4 w-4 mr-3"/>Weightage</button>
                    <button onClick={onDelete} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4 mr-3"/>Delete</button>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};