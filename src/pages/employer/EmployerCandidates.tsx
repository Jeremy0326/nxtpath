import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Loader2, User, Briefcase, GraduationCap, School, FileText, MessageSquare, Star } from 'lucide-react';
import { employerService } from '../../services/employerService';
import type { FrontendApplication, FrontendStudentProfile } from '../../types/components';
import { CandidateProfileModal } from '../../components/employer/CandidateProfileModal';
import { useToast } from '../../hooks/useToast';
import { CandidateMatchReportModal } from '../../components/jobs/CandidateMatchReportModal';
import { ViewInterviewReportModal } from '../../components/interview/ViewInterviewReportModal';

export function EmployerCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({ search: '', status: '' });
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{jobId: string, candidateId: string, resumeId: string} | null>(null);
  const [selectedInterviewReport, setSelectedInterviewReport] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchCandidates = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await employerService.getAllCandidates(searchParams);
      setCandidates(response);
    } catch (err) {
      setError('Failed to load candidates.');
      addToast({
        title: 'Error',
        description: 'Failed to load candidates. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, addToast]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates();
  };
  
  const handleViewProfile = async (candidateId: string) => {
    try {
      const profile = await employerService.getCandidateProfile(candidateId);
      setSelectedProfile(profile);
      setIsProfileModalOpen(true);
    } catch (error) {
      addToast({ title: 'Error', description: 'Failed to load profile.', variant: 'destructive' });
    }
  };

  const handleViewReport = (candidate: Candidate) => {
    if (candidate.latest_application?.job_id && candidate.user.id && candidate.latest_application?.resume_id) {
      setSelectedReport({
        jobId: candidate.latest_application.job_id,
        candidateId: candidate.user.id,
        resumeId: candidate.latest_application.resume_id,
      });
    }
  };
  const handleViewInterviewReport = (applicationId: string) => {
    setSelectedInterviewReport(applicationId);
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'interviewing': return 'bg-blue-100 text-blue-800';
      case 'applied': return 'bg-gray-100 text-gray-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-8xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
            <p className="text-md text-gray-600 mt-1">Manage all candidates who have applied to your jobs.</p>
          </header>

          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 mb-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
                    placeholder="Search by name or skills..."
                    value={searchParams.search}
                    onChange={(e) => setSearchParams(p => ({ ...p, search: e.target.value }))}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
              </div>
              <div>
                <select
                  value={searchParams.status}
                  onChange={(e) => setSearchParams(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="applied">Applied</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </form>
      </div>

          {isLoading ? (
            <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" /></div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No candidates found.</div>
          ) : (
      <div className="space-y-6">
              {candidates.map(candidate => (
          <motion.div
                  key={candidate.user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6"
          >
                  <div className="flex flex-col sm:flex-row items-start justify-between">
                    <div className="flex items-start">
                      <img className="h-16 w-16 rounded-full object-cover mr-6" src={candidate.user.profile_picture_url || `https://i.pravatar.cc/150?u=${candidate.user.id}`} alt={candidate.user.full_name} />
                <div>
                        <h3 className="text-xl font-bold text-gray-900">{candidate.user.full_name}</h3>
                        <p className="text-gray-600">Applied for: <span className="font-semibold">{candidate.latest_application?.job_title}</span></p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                           <School className="h-4 w-4 mr-2"/> {candidate.university.name} &middot; <GraduationCap className="h-4 w-4 ml-3 mr-2"/> {candidate.graduation_year}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                            {candidate.skills.slice(0, 5).map(skill => (
                                <span key={skill} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
                    <div className="flex flex-col items-end mt-4 sm:mt-0">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(candidate.latest_application?.status || '')}`}>
                        {candidate.latest_application?.status.replace(/_/g, ' ').toLowerCase()}
              </div>
                      <div className="flex items-center mt-3 text-green-600 font-bold">
                        <Star className="h-5 w-5 mr-1.5"/> {candidate.latest_application?.match_score || 'N/A'}% Match
                      </div>
                    </div>
                  </div>
                   <div className="mt-6 pt-4 border-t flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Applied on {new Date(candidate.latest_application?.applied_at || '').toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-2">
                            <button className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-50" onClick={() => handleViewReport(candidate)}><FileText className="h-4 w-4 mr-2"/>AI Report</button>
                            <button className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-50" onClick={() => handleViewInterviewReport(candidate.latest_application?.id)} disabled={!candidate.latest_application?.id}><MessageSquare className="h-4 w-4 mr-2"/>Interview Report</button>
                            <button onClick={() => handleViewProfile(candidate.user.id)} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">View Profile</button>
                  </div>
                </div>
              </motion.div>
              ))}
            </div>
            )}
        </div>
      </div>
      <CandidateProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={selectedProfile}
      />
      {selectedReport && (
        <CandidateMatchReportModal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          jobId={selectedReport.jobId}
          candidateId={selectedReport.candidateId}
          resumeId={selectedReport.resumeId}
        />
      )}
      {selectedInterviewReport && (
        <ViewInterviewReportModal
          isOpen={!!selectedInterviewReport}
          onClose={() => setSelectedInterviewReport(null)}
          applicationId={selectedInterviewReport}
        />
      )}
    </>
  );
}