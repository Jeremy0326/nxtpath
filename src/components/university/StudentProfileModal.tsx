import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Linkedin, Github, Globe, Star, Briefcase, GraduationCap, FileText, Check, XCircle, Eye, Brain, User, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/useToast';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// 1. Add new props and types for expanded student data (profile_picture_url, resumes, preferences, social_links)
type Resume = {
  id: string;
  file_url: string;
  file_name?: string;
  is_primary: boolean;
};

interface CareerPreferences {
  desired_roles?: string[];
  industries?: string[];
  locations?: string[];
  work_types?: string[];
  [key: string]: any;
}

interface Student {
  id: string;
  name: string;
  email: string;
  major: string;
  graduationYear: string;
  aiMatchScore: number;
  lastActive: string;
  skills?: string[];
  bio?: string;
  interests?: string[];
  resumes?: Resume[];
  profile_picture_url?: string;
  career_preferences?: CareerPreferences;
  university?: string;
  graduation_year?: string;
}

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export function StudentProfileModal({ isOpen, onClose, student }: StudentProfileModalProps) {
  const { addToast } = useToast();
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfError, setPdfError] = useState(false);

  if (!student) return null;

  const handleViewResume = (fileUrl: string) => {
    let absoluteUrl = fileUrl;
    if (!fileUrl.startsWith('http')) {
      const backendHost = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      absoluteUrl = `${backendHost.replace(/\/$/, '')}${fileUrl}`;
    }
    setResumeUrl(absoluteUrl);
    setShowResumePreview(true);
    setPdfError(false);
    setNumPages(null);
  };

  const handlePdfError = () => {
    setPdfError(true);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

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
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-indigo-100"
          >
            {/* Resume Preview Modal */}
            {showResumePreview && resumeUrl && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowResumePreview(false)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-[95vw] p-4 relative overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                  <button className="absolute top-2 right-2 p-1 text-gray-400 hover:text-indigo-600" onClick={() => setShowResumePreview(false)}>
                    <X className="h-6 w-6" />
                  </button>
                  <Document
                    file={resumeUrl}
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
                          onClick={() => window.open(resumeUrl, '_blank')}
                        >
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center">
                <img
                  className="h-16 w-16 rounded-full object-cover border-2 border-indigo-200 shadow mr-4"
                  src={student.profile_picture_url || `https://i.pravatar.cc/150?u=${student.id}`}
                  alt={student.name}
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                  <p className="text-gray-600">{student.major}</p>
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
                    <p className="text-gray-600 whitespace-pre-line">{student.bio || 'No bio provided.'}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {student.skills && student.skills.length > 0 ? student.skills.map(skill => (
                        <span key={skill} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">{skill}</span>
                      )) : <span className="text-gray-400">No skills listed.</span>}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {student.interests && student.interests.length > 0 ? student.interests.map(interest => (
                        <span key={interest} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">{interest}</span>
                      )) : <span className="text-gray-400">No interests listed.</span>}
                    </div>
                  </div>
                  {student.career_preferences && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Career Preferences</h3>
                      <div className="flex flex-wrap gap-2">
                        {student.career_preferences.locations && student.career_preferences.locations.length > 0 && (
                          <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">Locations: {student.career_preferences.locations.join(', ')}</span>
                        )}
                        {student.career_preferences.industries && student.career_preferences.industries.length > 0 && (
                          <span className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">Industries: {student.career_preferences.industries.join(', ')}</span>
                        )}
                        {student.career_preferences.work_types && student.career_preferences.work_types.length > 0 && (
                          <span className="bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">Work Types: {student.career_preferences.work_types.join(', ')}</span>
                        )}
                        {student.career_preferences.preferred_roles && student.career_preferences.preferred_roles.length > 0 && (
                          <span className="bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">Preferred Roles: {student.career_preferences.preferred_roles.join(', ')}</span>
                        )}
                        {(!student.career_preferences.locations?.length && !student.career_preferences.industries?.length && !student.career_preferences.work_types?.length && !student.career_preferences.preferred_roles?.length) && (
                          <span className="text-gray-400">No preferences listed.</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Resumes</h3>
                    <div className="space-y-2">
                      {student.resumes && student.resumes.length > 0 ? student.resumes.map(resume => (
                        <div key={resume.id} className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                          <FileText className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-800">{resume.file_name || 'Unnamed Resume'}</span>
                          {resume.is_primary && <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Primary</span>}
                          <Button size="sm" variant="outline" className="ml-2" onClick={() => handleViewResume(resume.file_url)}>
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
                        </div>
                      )) : <p className="text-sm text-gray-500">No resumes uploaded.</p>}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Education</h3>
                    <div className="flex items-start">
                      <GraduationCap className="h-5 w-5 text-gray-500 mr-4 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-700">{student.university || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{student.major}</p>
                        <p className="text-sm text-gray-500">Graduating {student.graduation_year || student.graduationYear}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 