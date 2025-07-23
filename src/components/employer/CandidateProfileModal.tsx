import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Linkedin, Github, Globe, Star, Briefcase, GraduationCap, FileText, Check, XCircle, Eye, Brain, User, Clock, CheckCircle } from 'lucide-react';
import type { FrontendStudentProfile, FrontendApplication } from '../../types/components';
import { Button } from '../ui/button';
import { employerService } from '../../services/employerService';
import { useToast } from '../../hooks/useToast';
import { Document, Page, pdfjs } from 'react-pdf';
import { CandidateMatchReportModal } from '../jobs/CandidateMatchReportModal';
import { ViewInterviewReportModal } from '../interview/ViewInterviewReportModal';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface CandidateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Candidate | null;
  onStatusUpdate?: () => void;
  context?: 'resume-bank' | 'applicant';
}

export function CandidateProfileModal({ isOpen, onClose, profile, onStatusUpdate, context = 'applicant' }: CandidateProfileModalProps) {
  const { addToast } = useToast();
  const [showCVPreview, setShowCVPreview] = useState(false);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfError, setPdfError] = useState(false);
  const [showMatchReport, setShowMatchReport] = useState<{jobId: string, resumeId: string} | null>(null);
  const [showInterviewReport, setShowInterviewReport] = useState<string | null>(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [isLoadingConnection, setIsLoadingConnection] = useState(false);

  if (!profile) return null;

  // Fetch connection status when modal opens
  useEffect(() => {
    const fetchConnectionStatus = async () => {
      if (!profile?.user?.id || context !== 'resume-bank') return;
      setIsLoadingConnection(true);
      try {
        const connections = await employerService.getConnections();
        const connection = connections.find(c => c.student === profile.user.id);
        setConnectionStatus(connection?.status || null);
      } catch (err) {
        console.error('Failed to fetch connection status:', err);
      } finally {
        setIsLoadingConnection(false);
      }
    };

    if (isOpen && context === 'resume-bank') {
      fetchConnectionStatus();
    }
  }, [isOpen, profile?.user?.id, context]);

  const handleStatusUpdate = async (status: 'offer' | 'rejected') => {
    if (!profile.latest_application) {
        addToast({ title: 'Error', description: 'No application found for this candidate.', variant: 'destructive' });
        return;
    }
    try {
      await employerService.updateCandidateStatus(profile.user.id, status);
      addToast({ title: 'Success', description: `Candidate status updated to ${status}.` });
      onStatusUpdate?.();
      onClose();
    } catch (error) {
      addToast({ title: 'Error', description: 'Failed to update candidate status.', variant: 'destructive' });
    }
  };

  const handleViewCV = (fileUrl: string) => {
    // Ensure the URL is properly formatted
    let absoluteUrl = fileUrl;
    if (!fileUrl.startsWith('http')) {
      // Use VITE_API_URL or fallback to localhost:8000
      const backendHost = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      absoluteUrl = `${backendHost.replace(/\/$/, '')}${fileUrl}`;
    }
    setCvUrl(absoluteUrl);
    setShowCVPreview(true);
    setPdfError(false);
    setNumPages(null);
  };

  const handlePdfError = () => {
    setPdfError(true);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Skill parsing: support string or object
  const parsedSkills = (profile?.skills || []).map(skill => typeof skill === 'string' ? skill : skill.name);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* PDF Preview Modal */}
            {showCVPreview && cvUrl && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowCVPreview(false)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-[95vw] p-4 relative overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                  <button className="absolute top-2 right-2 p-1 text-gray-400 hover:text-indigo-600" onClick={() => setShowCVPreview(false)}>
                    <X className="h-6 w-6" />
                  </button>
                  <Document
                    file={cvUrl}
                    loading={<p className="text-center py-6 text-lg">Loading preview…</p>}
                    onLoadError={handlePdfError}
                    onSourceError={handlePdfError}
                    onLoadSuccess={onDocumentLoadSuccess}
                  >
                    {numPages && Array.from({ length: numPages }, (_, i) => (
                      <Page key={i + 1} pageNumber={i + 1} width={700} className="mx-auto mb-5 border rounded" />
                    ))}
                  </Document>
                  {pdfError && (
                    <div className="mt-6 text-center text-red-500">
                      <XCircle className="inline-block mr-1" />
                      Unable to display preview. File may be corrupted.
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(cvUrl, '_blank')}
                        >
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* AI Match Report Modal */}
            {showMatchReport && (
              <CandidateMatchReportModal
                isOpen={!!showMatchReport}
                onClose={() => setShowMatchReport(null)}
                jobId={showMatchReport.jobId}
                resumeId={showMatchReport.resumeId}
                candidateId={profile.user.id}
              />
            )}
            {/* AI Interview Report Modal */}
            {showInterviewReport && (
              <ViewInterviewReportModal
                isOpen={!!showInterviewReport}
                onClose={() => setShowInterviewReport(null)}
                applicationId={showInterviewReport}
              />
            )}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center">
                <img className="h-16 w-16 rounded-full object-cover mr-4" src={profile.user.profile_picture_url || `https://i.pravatar.cc/150?u=${profile.user.id}`} alt={profile.user.full_name} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profile.user.full_name}</h2>
                  <p className="text-gray-600">{profile.major}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
                    <p className="text-gray-600">{profile.bio || 'No bio provided.'}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {parsedSkills.length > 0 ? parsedSkills.map(skill => (
                        <span key={skill} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">{skill}</span>
                      )) : <span className="text-gray-400">No skills listed.</span>}
                    </div>
                  </div>
                   <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {(profile.interests || []).map(interest => (
                        <span key={interest} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">{interest}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Resumes</h3>
                    <div className="space-y-2">
                      {(profile.resumes || []).map(resume => (
                        <div key={resume.id} className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                          <FileText className="h-5 w-5 text-gray-500 mr-2"/>
                          <span className="text-sm text-gray-800">{resume.file_name}</span>
                          {resume.is_primary && <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Primary</span>}
                          <Button size="sm" variant="outline" className="ml-2" onClick={() => handleViewCV(resume.file_url)}>
                            <Eye className="h-4 w-4 mr-1" /> View Resume
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="ml-1" 
                            onClick={() => {
                              let absoluteUrl = resume.file_url;
                              if (!resume.file_url.startsWith('http')) {
                                const backendHost = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                                absoluteUrl = `${backendHost.replace(/\/$/, '')}${resume.file_url}`;
                              }
                              window.open(absoluteUrl, '_blank');
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {profile.latest_application?.job_id && resume.id && (
                            <Button size="sm" variant="secondary" className="ml-2" onClick={() => setShowMatchReport({jobId: profile.latest_application.job_id, resumeId: resume.id})}>
                              <Star className="h-4 w-4 mr-1" /> AI Match Report
                            </Button>
                          )}
                          {profile.latest_application?.status === 'interview' && profile.latest_application?.application_id && (
                            <Button size="sm" variant="secondary" className="ml-2" onClick={() => setShowInterviewReport(profile.latest_application.application_id)}>
                              <Brain className="h-4 w-4 mr-1" /> Interview Report
                            </Button>
                          )}
                        </div>
                      ))}
                      {(!profile.resumes || profile.resumes.length === 0) && (
                        <p className="text-sm text-gray-500">No resumes uploaded.</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact & Links</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600"><Mail className="h-4 w-4 mr-3" /> {profile.user.email}</div>
                      {profile.social_links?.linkedin && <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:underline"><Linkedin className="h-4 w-4 mr-3" /> LinkedIn</a>}
                      {profile.social_links?.github && <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:underline"><Github className="h-4 w-4 mr-3" /> GitHub</a>}
                      {profile.social_links?.portfolio && <a href={profile.social_links.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:underline"><Globe className="h-4 w-4 mr-3" /> Portfolio</a>}
                    </div>
                  </div>
                   <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Education</h3>
                     <div className="flex items-start">
                        <GraduationCap className="h-5 w-5 text-gray-500 mr-4 mt-1"/>
                        <div>
                            <p className="font-semibold text-gray-700">{
                              typeof profile.university === 'object' && profile.university !== null
                                ? profile.university.name
                                : profile.university || 'N/A'
                            }</p>
                            <p className="text-sm text-gray-500">{profile.major}</p>
                            <p className="text-sm text-gray-500">Graduating {profile.graduation_year}</p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer actions: context-aware */}
            {context === 'applicant' ? (
              <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
                <div></div>
                <div className="flex space-x-4">
                  <Button variant="destructive" onClick={() => handleStatusUpdate('rejected')}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button variant="success" onClick={() => handleStatusUpdate('offer')}>
                    <Check className="mr-2 h-4 w-4" />
                    Make Offer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border-t flex justify-end items-center">
                {(() => {
                  if (isLoadingConnection) {
                    return (
                      <Button disabled variant="outline">
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </Button>
                    );
                  }
                  
                  if (!connectionStatus) {
                    return (
                      <Button variant="primary" onClick={() => setShowConnectDialog(true)}>
                        <User className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                    );
                  }
                  
                  switch (connectionStatus) {
                    case 'PENDING':
                      return (
                        <Button disabled variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-600">
                          <Clock className="mr-2 h-4 w-4" />
                          Pending
                        </Button>
                      );
                    case 'ACCEPTED':
                      return (
                        <Button disabled variant="outline" className="bg-green-50 border-green-200 text-green-600">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Connected
                        </Button>
                      );
                    case 'REJECTED':
                      return (
                        <Button disabled variant="outline" className="bg-red-50 border-red-200 text-red-600">
                          <XCircle className="mr-2 h-4 w-4" />
                          Rejected
                        </Button>
                      );
                    default:
                      return (
                        <Button variant="primary" onClick={() => setShowConnectDialog(true)}>
                          <User className="mr-2 h-4 w-4" />
                          Connect
                        </Button>
                      );
                  }
                })()}
              </div>
            )}
            {/* Connect dialog/modal for resume bank context */}
            {context === 'resume-bank' && showConnectDialog && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowConnectDialog(false)}>
                <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-indigo-600" onClick={() => setShowConnectDialog(false)}>
                    <X className="h-5 w-5" />
                  </button>
                  <h2 className="text-xl font-bold mb-4">Connect with {profile.user.full_name}</h2>
                  <p className="mb-4 text-gray-700">Send a message or connection request to this candidate.</p>
                  <textarea className="w-full border rounded p-2 mb-4" rows={4} placeholder="Write a message (optional)..." />
                  <Button 
                    variant="primary" 
                    className="w-full" 
                    onClick={async () => { 
                      try {
                        await employerService.sendConnection(profile.user.id, '');
                        setShowConnectDialog(false);
                        setConnectionStatus('PENDING');
                        addToast({ title: 'Connection sent', description: 'Your connection request has been sent.' });
                      } catch (err) {
                        addToast({ title: 'Error', description: 'Failed to send connection request.', variant: 'destructive' });
                      }
                    }}
                  >
                    Send Connection Request
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 