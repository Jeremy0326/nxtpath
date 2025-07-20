import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Gift, XCircle, Inbox, CalendarClock } from 'lucide-react';
import { employerService } from '../../services/employerService';
import type { FrontendApplication } from '../../types/components';
import { CandidateProfileModal } from '../../components/employer/CandidateProfileModal';
import { useToast } from '../../hooks/useToast';
import { Job } from '../../types/models';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const statusConfig = {
  applied: { title: 'Applied', color: 'bg-blue-50', icon: <Inbox className="h-7 w-7 text-blue-400" /> },
  interviewed: { title: 'Interviewed', color: 'bg-purple-50', icon: <CalendarClock className="h-7 w-7 text-purple-400" /> },
  offered: { title: 'Offered', color: 'bg-green-50', icon: <Gift className="h-7 w-7 text-green-400" /> },
  rejected: { title: 'Rejected', color: 'bg-red-50', icon: <XCircle className="h-7 w-7 text-red-400" /> },
};

const columns = ['applied', 'interviewed', 'offered', 'rejected'];

type Status = keyof typeof statusConfig;

const KanbanCard = ({ candidate, setSelectedProfile }: { candidate: Candidate; setSelectedProfile: (candidate: Candidate) => void; }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-white/80 backdrop-blur-md shadow-xl hover:shadow-2xl border border-gray-100 p-6 flex flex-col items-center gap-2 transition-all duration-200 min-w-0 w-full max-w-xs mx-auto"
      style={{ minHeight: 180 }}
    >
      <img
        className="h-14 w-14 rounded-full object-cover border-2 border-gray-200 mb-2"
        src={candidate.user.profile_picture_url || `https://avatar.vercel.sh/${candidate.user.id}.png`}
        alt={candidate.user.full_name}
      />
      <div className="text-center w-full">
        <p className="font-semibold text-gray-900 truncate">{candidate.user.full_name}</p>
        <p className="text-xs text-gray-500 truncate">{candidate.major}</p>
        <p className="text-xs text-gray-400 mt-1 truncate">{candidate.latest_application?.job_title}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-6 w-full font-medium"
        onClick={() => setSelectedProfile(candidate)}
      >
        <Eye className="mr-2 h-4 w-4" /> View
      </Button>
    </motion.div>
  );
};

const pastelColumnBg = {
  applied: 'bg-blue-50',
  interviewed: 'bg-purple-50',
  offered: 'bg-green-50',
  rejected: 'bg-red-50',
};

const KanbanColumn = ({ status, candidates, setSelectedProfile }: { status: Status; candidates?: Candidate[]; setSelectedProfile: (candidate: Candidate) => void; }) => {
  return (
    <div className={`rounded-2xl shadow-md min-h-[400px] flex flex-col ${pastelColumnBg[status]} border border-gray-100 p-0`}
      style={{ minWidth: 260, maxWidth: 300 }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white/80 rounded-t-2xl sticky top-0 z-10 shadow-sm">
        {statusConfig[status].icon}
        <span className="text-base font-bold text-gray-800">{statusConfig[status].title}</span>
        <Badge variant="secondary" className="ml-auto">{candidates?.length || 0}</Badge>
      </div>
      <div className="flex-1 p-3 flex flex-col gap-4">
        {candidates && candidates.length > 0 ? (
          candidates.map(candidate => (
            <KanbanCard key={candidate.user.id} candidate={candidate} setSelectedProfile={setSelectedProfile} />
          ))
        ) : (
          <div className="text-xs text-gray-400 text-center mt-8">No candidates</div>
        )}
      </div>
    </div>
  );
};

export function CandidatesKanbanPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Candidate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const { addToast } = useToast();

  const fetchCandidates = useCallback(async () => {
    try {
      setIsLoading(true);
      const [candidatesResponse, jobsResponse] = await Promise.all([
        employerService.getAllCandidates({ search: searchQuery, job_id: selectedJob === 'all' ? undefined : selectedJob }),
        employerService.getEmployerJobs({}),
      ]);
      setCandidates(candidatesResponse);
      setJobs(jobsResponse.results);
    } catch (err) {
      setError('Failed to load candidates.');
      addToast({ title: 'Error', description: 'Failed to load candidates.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedJob, addToast]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const filteredCandidates = candidates.filter(c => {
    const jobMatch = selectedJob === 'all' || c.latest_application?.job_id === selectedJob;
    const searchMatch = (
      c.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.skills && c.skills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())))
    );
    return jobMatch && searchMatch;
  });

  const candidatesByStatus: Record<Status, Candidate[]> = columns.reduce((acc, status) => {
    acc[status as Status] = filteredCandidates.filter(c => c.latest_application?.status === status);
    return acc;
  }, {} as Record<Status, Candidate[]>);

  return (
    <>
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Candidate Pipeline</h1>
            <p className="text-md text-gray-600 mt-1">All candidates who have applied to your jobs, grouped by status.</p>
          </header>

          <Card className="mb-6 shadow-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-grow w-full sm:w-auto">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, major..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div className="relative w-full sm:w-64">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full pl-11 pr-8 py-2.5 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                >
                  <option value="all">All Job Applications</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center py-12"><span className="text-gray-400">Loading...</span></div>
          ) : error ? (
            <div className="text-center py-12 text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
          ) : (
            <div className="flex gap-4 justify-center w-full">
              {columns.map(status => (
                <KanbanColumn key={status} status={status as Status} candidates={candidatesByStatus[status as Status]} setSelectedProfile={setSelectedProfile} />
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedProfile && (
        <CandidateProfileModal
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          profile={selectedProfile}
          onStatusUpdate={fetchCandidates}
        />
      )}
    </>
  );
} 