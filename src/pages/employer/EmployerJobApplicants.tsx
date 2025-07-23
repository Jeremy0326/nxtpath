import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { employerService } from '../../services/employerService';
import { StudentProfile } from '../../types/models';
import type { FrontendApplication } from '../../types/components';
import { Loader2, ArrowLeft, Star, Mail, Phone, FileText, Inbox, CalendarClock, Gift, XCircle, BrainCircuit } from 'lucide-react';
import { CandidateProfileModal } from '../../components/employer/CandidateProfileModal';
import { CandidateMatchReportModal } from '../../components/jobs/CandidateMatchReportModal';
import { Button } from '../../components/ui/button';
import { ViewInterviewReportModal } from '../../components/interview/ViewInterviewReportModal';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { X } from 'lucide-react';
// useState from React is sufficient


export function EmployerJobApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const [applicants, setApplicants] = useState<FrontendApplication[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{jobId: string, resumeId: string} | null>(null);
  const [selectedInterviewReport, setSelectedInterviewReport] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban'); // Default to Kanban
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; application: FrontendApplication | null }>({ open: false, application: null });


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

  const handleViewReport = (application: FrontendApplication) => {
    if (jobId && application.resume?.id) {
        setSelectedReport({
            jobId: jobId,
            resumeId: application.resume.id,
        });
    } else {
        // Handle case where IDs are missing
        console.error("Cannot open report: Missing job or resume ID");
    }
  };

  const handleViewInterviewReport = (applicationId: string) => {
    setSelectedInterviewReport(applicationId);
  }

  const handlePipelineAction = async (application: FrontendApplication, action: 'offered' | 'rejected') => {
    try {
      await employerService.updateCandidateStatus(
        application.applicant.id,
        action,
        jobId
      );
      fetchApplicants(); // Refresh applicants to show updated status
    } catch (error) {
      console.error(`Failed to ${action} application`, error);
      // You might want to show a toast notification here
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  // Kanban status config (from CandidatesKanbanPage)
  const statusConfig = {
    applied: { title: 'Applied', color: 'bg-blue-50', icon: <Inbox className="h-7 w-7 text-blue-400" /> },
    interviewed: { title: 'Interviewed', color: 'bg-purple-50', icon: <CalendarClock className="h-7 w-7 text-purple-400" /> },
    offered: { title: 'Offered', color: 'bg-green-50', icon: <Gift className="h-7 w-7 text-green-400" /> },
    rejected: { title: 'Rejected', color: 'bg-red-50', icon: <XCircle className="h-7 w-7 text-red-400" /> },
  };
  const columns = ['applied', 'interviewed', 'offered', 'rejected'];

  // KanbanColumn for applicants
  function KanbanColumn({ status, applicants, onViewDetails }: { status: keyof typeof statusConfig; applicants: FrontendApplication[]; onViewDetails: (app: FrontendApplication) => void }) {
    return (
      <div className={`rounded-2xl shadow-md min-h-[340px] flex flex-col w-full max-w-xs ${statusConfig[status].color} border border-gray-100 p-0`} style={{ minWidth: 240, maxWidth: 280 }}>
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-white/80 rounded-t-2xl sticky top-0 z-10 shadow-sm">
          {statusConfig[status].icon}
          <span className="text-base font-bold text-gray-800">{statusConfig[status].title}</span>
          <Badge variant="secondary" className="ml-auto">{applicants.length}</Badge>
        </div>
        <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto">
          {applicants.length > 0 ? (
            applicants.map(app => (
              <ApplicantCardCompact key={app.id} application={app} onViewDetails={() => onViewDetails(app)} />
            ))
          ) : (
            <div className="text-xs text-gray-400 text-center mt-8">No candidates</div>
          )}
        </div>
      </div>
    );
  }

  function ApplicantTable({ applicants, onViewDetails, handleViewProfile, handleViewReport, handleViewInterviewReport }: {
    applicants: FrontendApplication[];
    onViewDetails: (app: FrontendApplication) => void;
    handleViewProfile: (applicantId: string) => void;
    handleViewReport: (application: FrontendApplication) => void;
    handleViewInterviewReport: (applicationId: string) => void;
  }) {
    return (
      <div className="overflow-x-auto rounded-2xl shadow-md bg-white border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Major</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {applicants.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">No candidates</td>
              </tr>
            ) : (
              applicants.map(app => (
                <tr key={app.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      className="h-9 w-9 rounded-full object-cover border border-indigo-100"
                      src={app.applicant.profile_picture_url || `https://i.pravatar.cc/150?u=${app.applicant.id}`}
                      alt={app.applicant.full_name}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{app.applicant.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{app.major || 'No major'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {app.ai_match_score != null ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        <Star className="h-3 w-3 mr-1 text-green-500" />
                        {app.ai_match_score}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      app.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'interviewed' ? 'bg-purple-100 text-purple-800' :
                      app.status === 'offered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" aria-label="View Details" onClick={() => onViewDetails(app)}>
                        <span className="sr-only">View Details</span>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

          {/* Add Table/Kanban toggle UI (table rendering to be implemented next) */}
          <div className="flex justify-end mb-4">
            <Button size="sm" variant={viewMode === 'kanban' ? 'default' : 'outline'} onClick={() => setViewMode('kanban')}>Kanban</Button>
            <Button size="sm" variant={viewMode === 'table' ? 'default' : 'outline'} onClick={() => setViewMode('table')}>Table</Button>
          </div>

          {viewMode === 'kanban' ? (
            <div className="flex flex-wrap md:flex-nowrap gap-4 justify-center w-full overflow-x-auto">
              {columns.map(status => (
                <KanbanColumn
                  key={status}
                  status={status as keyof typeof statusConfig}
                  applicants={applicants.filter(app => (app.status || '').toLowerCase() === status.toLowerCase())}
                  onViewDetails={app => setDetailsModal({ open: true, application: app })}
                />
              ))}
            </div>
          ) : (
            <ApplicantTable 
              applicants={applicants} 
              onViewDetails={app => setDetailsModal({ open: true, application: app })}
              handleViewProfile={handleViewProfile}
              handleViewReport={handleViewReport}
              handleViewInterviewReport={handleViewInterviewReport}
            />
          )}
          <ApplicantDetailsModal
            open={detailsModal.open}
            onClose={() => setDetailsModal({ ...detailsModal, open: false })}
            application={detailsModal.application}
            onViewReport={handleViewReport}
            onViewInterviewReport={handleViewInterviewReport}
            onOffer={() => handlePipelineAction(detailsModal.application!, 'offered')}
            onReject={() => handlePipelineAction(detailsModal.application!, 'rejected')}
            jobId={jobId!}
          />
        </div>
      </div>
      <CandidateProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={selectedProfile}
        onStatusUpdate={() => {}}
      />
      {selectedReport && (
        <CandidateMatchReportModal
            isOpen={!!selectedReport}
            onClose={() => setSelectedReport(null)}
            jobId={selectedReport.jobId}
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

// Helper to get absolute file URL for resume
const getAbsoluteFileUrl = (fileUrl: string | undefined): string => {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl;
  // Use VITE_API_URL or fallback to localhost:8000
  const backendHost = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${backendHost.replace(/\/$/, '')}${fileUrl}`;
};

function ApplicantDetailsModal({ open, onClose, application, onViewReport, onViewInterviewReport, onOffer, onReject, jobId }: {
  open: boolean;
  onClose: () => void;
  application: FrontendApplication | null;
  onViewReport: (application: FrontendApplication) => void;
  onViewInterviewReport: (applicationId: string) => void;
  onOffer: () => void;
  onReject: () => void;
  jobId: string;
}) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfError, setPdfError] = useState(false);
  const [showMatchReport, setShowMatchReport] = useState(false);
  const [showInterviewReport, setShowInterviewReport] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  
  useEffect(() => {
    if (application?.applicant?.id && open) {
      fetchStudentProfile(application.applicant.id);
    }
    // Reset PDF error state when modal opens/closes or application changes
    setPdfError(false);
    setNumPages(null);
  }, [application, open]);
  
  const fetchStudentProfile = async (applicantId: string) => {
    try {
      setIsLoadingProfile(true);
      setProfileError('');
      const profile = await employerService.getCandidateProfile(applicantId);
      setStudentProfile(profile);
    } catch (error) {
      console.error("Failed to fetch candidate profile", error);
      setProfileError('Failed to load candidate profile details.');
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  if (!application) return null;
  
  // Debug logging
  console.log('Application status:', application.status);
  console.log('Application:', application);
  
  const canOffer = application.status?.toLowerCase() === 'interviewed';
  const canReject = application.status?.toLowerCase() === 'interviewed' || application.status?.toLowerCase() === 'applied';
  
  console.log('Can offer:', canOffer);
  console.log('Can reject:', canReject);
  // Always use absolute URL for PDF (handles CORS/dev/prod)
  const resumeUrl = getAbsoluteFileUrl(application.resume?.file_url);
  const resumeName = application.resume?.file_name || 'Resume.pdf';
  const resumeId = application.resume?.id;
  const uploadDate = application.resume?.uploaded_at 
    ? new Date(application.resume.uploaded_at).toLocaleDateString() 
    : 'Not available';
  
  // Professional placeholder for missing data
  const safe = (v: any, fallback = 'Not available') => (v ? v : fallback);
  
  // Function to handle PDF errors
  const handlePdfError = () => {
    console.error("Error loading PDF");
    setPdfError(true);
  };
  
  // Function to open PDF in new tab as fallback
  const openPdfInNewTab = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    }
  };
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 ${open ? '' : 'hidden'}`}> 
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-0 relative max-h-[90vh] overflow-hidden flex flex-col">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        
        {/* Header */}
        <div className="flex items-center gap-5 px-8 pt-8 pb-4 border-b bg-white">
          <img className="h-16 w-16 rounded-full object-cover border-2 border-indigo-100" 
               src={application.applicant.profile_picture_url || `https://i.pravatar.cc/150?u=${application.applicant.id}`} 
               alt={application.applicant.full_name} />
          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold text-gray-900 truncate">{safe(application.applicant.full_name)}</div>
            <div className="text-gray-600 text-sm">Major: <span className="font-semibold">{safe(application.major)}</span></div>
            <div className="text-xs text-gray-500 mt-1">Applied on {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'Not available'}</div>
          </div>
          {application.ai_match_score != null && (
            <Badge variant="secondary" className="flex items-center gap-1 text-green-700 bg-green-50 border-green-200 text-base px-3 py-1">
              <Star className="h-5 w-5 mr-1 text-green-500" />
              {application.ai_match_score}% Match
            </Badge>
          )}
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto flex-1 p-8 bg-gray-50">
          {isLoadingProfile ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : profileError ? (
            <div className="text-center text-red-500 py-4">{profileError}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Candidate Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Candidate Information</h3>
                <div className="space-y-4">
                  {/* Contact Information */}
                  <div className="bg-white rounded-lg border p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Contact</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-800">{safe(application.applicant.email)}</span>
                      </div>
                      {studentProfile?.user?.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-800">{studentProfile.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="bg-white rounded-lg border p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Education</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-24">University:</span>
                        <span className="text-sm text-gray-800">{safe(studentProfile?.university?.name)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-24">Major:</span>
                        <span className="text-sm text-gray-800">{safe(application.major || studentProfile?.major)}</span>
                      </div>
                      {studentProfile?.graduation_year && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 w-24">Graduating:</span>
                          <span className="text-sm text-gray-800">{studentProfile.graduation_year}</span>
                        </div>
                      )}
                      {studentProfile?.gpa && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 w-24">GPA:</span>
                          <span className="text-sm text-gray-800">{studentProfile.gpa}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {studentProfile?.skills && studentProfile.skills.length > 0 && (
                    <div className="bg-white rounded-lg border p-4 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {studentProfile.skills.map((skill: any, index: number) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {typeof skill === 'string' ? skill : skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  {studentProfile?.interests && studentProfile.interests.length > 0 && (
                    <div className="bg-white rounded-lg border p-4 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {studentProfile.interests.map((interest: any, index: number) => (
                          <Badge key={index} variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            {typeof interest === 'string' ? interest : interest.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Application Status */}
                  <div className="bg-white rounded-lg border p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Application Status</h4>
                    <div className="flex items-center">
                      <Badge className="bg-indigo-100 text-indigo-700">
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Resume and Reports */}
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Resume</h3>
                
                {/* Resume Preview - Center it */}
                <div className="bg-white rounded-lg p-4 border mb-4 shadow-sm flex flex-col items-center justify-center min-h-[120px]">
                  {resumeUrl ? (
                    <div className="text-center">
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(resumeUrl, '_blank')} 
                        className="w-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />View Resume
                      </Button>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-4">No CV uploaded.</div>
                  )}
                </div>

                {/* Resume Details - Move below preview */}
                {application.resume && (
                  <div className="bg-white rounded-lg border p-4 shadow-sm mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Resume Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-24">Filename:</span>
                        <span className="text-sm text-gray-800">{safe(application.resume.file_name)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-24">Uploaded:</span>
                        <span className="text-sm text-gray-800">{uploadDate}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowMatchReport(true)} 
                    disabled={!jobId || !resumeId}
                    className="w-full flex items-center justify-center bg-white"
                  >
                    <BrainCircuit className="h-4 w-4 mr-2" />AI Match Report
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowInterviewReport(true)} 
                    disabled={application.status?.toLowerCase() !== 'interviewed'}
                    className={`w-full flex items-center justify-center ${
                      application.status?.toLowerCase() === 'interviewed' 
                        ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' 
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    AI Interview Report
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer with Offer/Reject buttons */}
        <div className="border-t px-8 py-4 flex justify-between bg-white">
          <Button 
            variant="destructive" 
            disabled={!canReject} 
            onClick={onReject} 
            className="px-8 py-2 bg-red-600 hover:bg-red-700 text-white"
          >
            Reject
          </Button>
          <Button 
            variant="default" 
            disabled={!canOffer} 
            onClick={onOffer} 
            className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white"
          >
            Make Offer
          </Button>
        </div>
        
        {/* AI Match Report Modal */}
        {showMatchReport && jobId && resumeId && (
          <CandidateMatchReportModal
            isOpen={showMatchReport}
            onClose={() => setShowMatchReport(false)}
            jobId={jobId}
            resumeId={resumeId}
          />
        )}
        {/* Interview Report Modal */}
        {showInterviewReport && (
          <ViewInterviewReportModal
            isOpen={showInterviewReport}
            onClose={() => setShowInterviewReport(false)}
            applicationId={application.id}
          />
        )}
        
      </div>
    </div>
  );
}

function ApplicantCardCompact({ application, onViewDetails }: { application: FrontendApplication; onViewDetails: () => void }) {
  // Professional placeholder for missing data
  const safe = (v: any, fallback = 'Not specified') => (v ? v : fallback);
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow duration-200 cursor-pointer relative bg-white"
      onClick={onViewDetails}
    >
      <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
        <img
          className="h-8 w-8 rounded-full object-cover border border-indigo-100"
          src={application.applicant.profile_picture_url || `https://i.pravatar.cc/150?u=${application.applicant.id}`}
          alt={application.applicant.full_name || 'Applicant'}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate text-sm">{safe(application.applicant.full_name)}</div>
          <div className="text-xs text-gray-500 truncate">{safe(application.major, 'No major')}</div>
          <div className="text-xs text-gray-400">
            {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'Date unavailable'}
          </div>
        </div>
        {application.ai_match_score != null && (
          <div className="absolute top-1 right-1">
            <Badge variant="secondary" className="flex items-center text-xs text-green-700 bg-green-50 border-green-200">
              <Star className="h-3 w-3 mr-0.5 text-green-500" />
              {application.ai_match_score}%
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
} 