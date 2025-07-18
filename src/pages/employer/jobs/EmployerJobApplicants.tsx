import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { employerService } from '../../../services/employerService';
import { Application } from '../../../types/job';
import { StudentProfile } from '../../../types/user';
import { Loader2, ArrowLeft, User, Star, Mail, Phone, Briefcase, BrainCircuit, FileText } from 'lucide-react';
import { CandidateProfileModal } from '../../../components/employer/candidates/CandidateProfileModal';
import { CandidateMatchReportModal } from '../../../components/jobs/CandidateMatchReportModal';
import { Button } from '../../../components/ui/button';
import { ViewInterviewReportModal } from '../../../components/interview/ViewInterviewReportModal';
import { useState as useReactState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';


export function EmployerJobApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{jobId: string, candidateId: string, resumeId: string} | null>(null);
  const [selectedInterviewReport, setSelectedInterviewReport] = useState<string | null>(null);


  useEffect(() => {
    if (jobId) {
      fetchApplicants();
    }
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      setIsLoading(true);
      const response = await employerService.getJobApplicants(jobId!);
      setApplicants(response);
      if (response.length > 0) {
        setJobTitle(response[0].job.title);
      }
    } catch (err) {
      setError('Failed to load applicants.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = async (applicantId: string) => {
    try {
      const profile = await employerService.getCandidateProfile(applicantId);
      setSelectedProfile(profile);
      setIsProfileModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch candidate profile", error);
      // You might want to show a toast notification here
    }
  };

  const handleViewReport = (application: Application) => {
    if (jobId && application.applicant.id && application.resume?.id) {
        setSelectedReport({
            jobId: jobId,
            candidateId: application.applicant.id,
            resumeId: application.resume.id,
        });
    } else {
        // Handle case where IDs are missing
        console.error("Cannot open report: Missing job, candidate, or resume ID");
    }
  };

  const handleViewInterviewReport = (applicationId: string) => {
    setSelectedInterviewReport(applicationId);
  }

  if (isLoading) {
    return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  // Even more compact ApplicantCard for Kanban
  function ApplicantCardCompact({ application, onViewDetails }: { application: Application; onViewDetails: () => void }) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200 group p-2 flex flex-col items-center gap-1 min-h-[140px]">
        <img
          className="h-10 w-10 rounded-full object-cover border border-indigo-100 group-hover:border-indigo-400 transition"
          src={application.applicant.profile_picture_url || `https://i.pravatar.cc/150?u=${application.applicant.id}`}
          alt={application.applicant.full_name}
        />
        <div className="text-center w-full">
          <div className="font-semibold text-gray-900 truncate text-sm">{application.applicant.full_name}</div>
          {application.applicant.student_profile?.major && (
            <div className="text-xs text-gray-500 truncate">{application.applicant.student_profile.major}</div>
          )}
        </div>
        <Badge variant="secondary" className="flex items-center gap-1 text-green-700 bg-green-50 border-green-200 mt-1">
          <Star className="h-3 w-3 mr-1 text-green-500" />
          {typeof application.ai_match_score === 'number' ? `${application.ai_match_score}%` : '—'}
        </Badge>
        <Button size="sm" className="mt-1 w-full" onClick={onViewDetails}>View</Button>
      </Card>
    );
  }

  // Modal with tabs for Profile, CV, AI Match Report, Interview Report, Actions
  function ApplicantDetailsModal({ open, onClose, application, onViewReport, onViewInterviewReport, onOffer, onReject }: {
    open: boolean;
    onClose: () => void;
    application: Application | null;
    onViewReport: (application: Application) => void;
    onViewInterviewReport: (applicationId: string) => void;
    onOffer: () => void;
    onReject: () => void;
  }) {
    const [tab, setTab] = useReactState<'profile' | 'cv' | 'ai' | 'interview'>('profile');
    const [showPdf, setShowPdf] = useReactState(false);
    const [numPages, setNumPages] = useReactState<number | null>(null);
    const [pdfError, setPdfError] = useReactState(false);
    const [aiReportLoading, setAiReportLoading] = useReactState(false);
    const [aiReport, setAiReport] = useReactState<any>(null);
    const [aiReportError, setAiReportError] = useReactState<string | null>(null);

    if (!application) return null;
    const canOffer = application.status === 'interviewed';
    const canReject = application.status === 'interviewed';
    const resume = application.resume;
    const hasCV = !!resume?.file_url;

    // Fetch AI Match Report
    const fetchAIReport = async () => {
      if (!application.job.id || !resume?.id) return;
      setAiReportLoading(true);
      setAiReportError(null);
      try {
        const data = await import('../../../services/jobService').then(m => m.jobService.getAnalysisReportForCandidate(application.job.id, resume.id));
        if (data && !data.processing) {
          setAiReport(data);
        } else {
          setAiReport(null);
          setAiReportError('AI Match Report is being generated. Please check back soon.');
        }
      } catch (err: any) {
        setAiReport(null);
        setAiReportError('Failed to fetch AI Match Report.');
      } finally {
        setAiReportLoading(false);
      }
    };

    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${open ? '' : 'hidden'}`}> {/* Modal overlay */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-0 relative">
          <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full border-b">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="cv">CV</TabsTrigger>
              <TabsTrigger value="ai">AI Match</TabsTrigger>
              <TabsTrigger value="interview">Interview</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img className="h-16 w-16 rounded-full object-cover border-2 border-indigo-100" src={application.applicant.profile_picture_url || `https://i.pravatar.cc/150?u=${application.applicant.id}`} alt={application.applicant.full_name} />
                <div>
                  <div className="text-xl font-bold text-gray-900">{application.applicant.full_name}</div>
                  <div className="text-gray-600 text-sm">Major: <span className="font-semibold">{application.applicant.student_profile?.major || '—'}</span></div>
                  <div className="text-xs text-gray-500 mt-1">Applied on {application.created_at ? new Date(application.created_at).toLocaleDateString() : '—'}</div>
                  {application.applicant.email && <div className="text-xs text-gray-500">Email: {application.applicant.email}</div>}
                </div>
              </div>
              {/* Add more student details as needed */}
              <Button size="sm" variant="outline" className="mt-2" onClick={() => setTab('cv')}>View CV</Button>
            </TabsContent>
            <TabsContent value="cv" className="p-6">
              {hasCV ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">{resume.file_name}</span>
                    <Button size="sm" variant="outline" onClick={() => setShowPdf(v => !v)}>{showPdf ? 'Hide' : 'Show'} PDF</Button>
                  </div>
                  {showPdf && (
                    <div className="border rounded bg-gray-50 p-2 max-h-[400px] overflow-auto">
                      <Document
                        file={resume.file_url}
                        loading={<p className="text-center py-6 text-lg">Loading preview…</p>}
                        onLoadError={() => setPdfError(true)}
                        onSourceError={() => setPdfError(true)}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                      >
                        {numPages && Array.from({ length: numPages }, (_, i) => (
                          <Page key={i + 1} pageNumber={i + 1} width={500} className="mx-auto mb-2 border rounded" />
                        ))}
                      </Document>
                      {pdfError && <div className="mt-6 text-center text-red-500">Unable to display preview. File may be corrupted.</div>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No CV uploaded.</div>
              )}
              <Button size="sm" variant="outline" className="mt-2" onClick={() => setTab('profile')}>Back to Profile</Button>
            </TabsContent>
            <TabsContent value="ai" className="p-6">
              <Button size="sm" variant="outline" onClick={fetchAIReport} disabled={aiReportLoading} className="mb-2">{aiReportLoading ? 'Loading...' : 'Generate/Refresh AI Match Report'}</Button>
              {aiReportError && <div className="text-red-500 text-sm mb-2">{aiReportError}</div>}
              {aiReport ? (
                <div className="border rounded bg-gray-50 p-3">
                  <div className="font-semibold text-lg text-indigo-700 mb-2">AI Match Score: {aiReport.shared?.overall_score ?? '—'}%</div>
                  {/* Show more summary fields as needed */}
                  <div className="text-sm text-gray-700">{aiReport.shared?.skills_analysis?.summary || 'No summary available.'}</div>
                </div>
              ) : !aiReportLoading && !aiReportError ? (
                <div className="text-gray-500">No AI Match Report available.</div>
              ) : null}
            </TabsContent>
            <TabsContent value="interview" className="p-6">
              <Button size="sm" variant="outline" onClick={() => onViewInterviewReport(application.id)} disabled={application.status !== 'interviewed'}>View Interview Report</Button>
            </TabsContent>
          </Tabs>
          <div className="flex gap-2 p-6 border-t mt-2">
            <Button variant="success" disabled={!canOffer} onClick={onOffer}>Make Offer</Button>
            <Button variant="destructive" disabled={!canReject} onClick={onReject}>Reject</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link to="/employer/jobs" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Jobs
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Applicants for {jobTitle}</h1>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm">
            <ul className="divide-y divide-gray-200">
              {applicants.map(app => (
                <li key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img className="h-12 w-12 rounded-full object-cover mr-4" src={app.applicant.profile_picture_url || `https://i.pravatar.cc/150?u=${app.applicant.id}`} alt={app.applicant.full_name} />
                      <div>
                        <p className="text-lg font-semibold text-indigo-600">{app.applicant.full_name}</p>
                        <p className="text-sm text-gray-600">{app.applicant.student_profile?.major}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-xl font-bold text-green-600">{app.ai_match_score || '—'}</p>
                        <p className="text-xs text-gray-500">Match Score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold capitalize">{app.status.replace(/_/g, ' ').toLowerCase()}</p>
                        <p className="text-xs text-gray-500">Status</p>
                      </div>
                      <Button variant="outline" onClick={() => handleViewReport(app)} disabled={!app.resume?.id}>
                        <BrainCircuit className="h-4 w-4 mr-2" />
                        AI Report
                      </Button>
                      <Button variant="outline" onClick={() => handleViewInterviewReport(app.id)} disabled={app.status !== 'interview'}>
                        <FileText className="h-4 w-4 mr-2" />
                        Interview Report
                      </Button>
                      <button onClick={() => handleViewProfile(app.applicant.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        View Profile
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
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