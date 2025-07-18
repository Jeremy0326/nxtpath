import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cvAnalysisService } from '../../services/cvAnalysisService';
import type { CV, CVAnalysisResult } from '../../types/cv';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import api from '../../lib/axios';

// State machine for the page
type PageState =
  | { status: 'loading' }
  | { status: 'no_resume' }
  | { status: 'analyzing'; progress: number; fileName: string }
  | { status: 'display_results'; analysis: CVAnalysisResult; resume: CV }
  | { status: 'error'; error: string };

const ResumeUpload = ({ onUpload, setAnalyzing, setError }: { onUpload: (file: File) => void; setAnalyzing: () => void; setError: (msg: string) => void}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are accepted.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must not exceed 10MB.');
        return;
      }
      setAnalyzing();
      onUpload(file);
    }
  }, [onUpload, setAnalyzing, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'application/pdf': ['.pdf'] } });

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div {...getRootProps()} className={`w-full max-w-lg p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Drag & Drop Your Resume</h2>
          <p className="text-gray-500">or</p>
          <Button variant="outline" className="mt-4">Select File</Button>
          <p className="text-xs text-gray-500 mt-6">PDF only, max 10MB.</p>
        </div>
      </div>
    </div>
  );
};

const AnalyzingResume = ({ progress, fileName }: { progress: number; fileName: string }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="relative w-24 h-24 mb-6">
        <Loader2 className="w-24 h-24 text-indigo-200 animate-spin"/>
        <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-indigo-500" />
    </div>
    <h2 className="text-xl font-semibold text-gray-800">Analyzing Your Resume...</h2>
    <p className="text-gray-600 mt-2 mb-4 max-w-md">{fileName}</p>
    <div className="w-full max-w-sm">
      <Progress value={progress} className="w-full" />
      <p className="text-sm font-medium text-indigo-600 mt-2">{Math.round(progress)}%</p>
    </div>
  </div>
);

const ResumeDisplay = ({ analysis, resume, onReAnalyze }: { analysis: CVAnalysisResult; resume: CV; onReAnalyze: () => void; }) => (
    <div className="p-2 sm:p-6">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Resume Analysis</h2>
          <Button onClick={onReAnalyze} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2"/>
              Re-Analyze
          </Button>
      </div>
      <div className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">{analysis.name}</h2>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-gray-600">
                  <span>{analysis.email}</span>
                  <span>{analysis.phone}</span>
                  <span>{analysis.location}</span>
              </div>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Summary</h3>
              <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Skills</h3>
              <div className="flex flex-wrap gap-3">
                  {analysis.skills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-800 rounded-lg font-medium">{skill}</span>
                  ))}
              </div>
          </div>
      </div>
    </div>
);

export function CVUploadPage() {
  const [pageState, setPageState] = useState<PageState>({ status: 'loading' });
  const { withErrorHandling, error, clearError } = useErrorHandler();

  const fetchCVData = useCallback(withErrorHandling(async () => {
    try {
      const response = await api.get('/cv/active/');
      if (response.data) {
        const { cv, analysis } = response.data;
        setPageState({ status: 'display_results', analysis, resume: cv });
      } else {
        setPageState({ status: 'no_resume' });
      }
    } catch (e) {
      // If error is 404, it means no active CV, which is not an application error
      if ((e as any).response?.status === 404) {
        setPageState({ status: 'no_resume' });
      } else {
        setPageState({ status: 'error', error: 'Failed to load your resume data.' });
      }
    }
  }), []);

  useEffect(() => {
    fetchCVData();
  }, [fetchCVData]);
  
  const handleUpload = useCallback(withErrorHandling(async (file: File | null) => {
    if (!file && pageState.status === 'display_results') {
      // This is a re-analysis request
      setPageState({ status: 'analyzing', progress: 0, fileName: pageState.resume.file_name });
    } else if (!file) {
      return; // Or handle error
    }

    const fileName = file ? file.name : (pageState.status === 'display_results' ? pageState.resume.file_name : 'resume.pdf');
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setPageState({ status: 'analyzing', progress, fileName: fileName });
      if (progress >= 90) clearInterval(interval);
    }, 200);

    try {
      const analysisResult = file 
        ? await cvAnalysisService.uploadAndAnalyze(file)
        : await cvAnalysisService.analyzeCV((pageState as { status: 'display_results', resume: CV }).resume.id);

      clearInterval(interval);
      setPageState({ status: 'analyzing', progress: 100, fileName: fileName });
      
      setTimeout(() => {
        const resume: CV = pageState.status === 'display_results' 
          ? pageState.resume 
          : { id: analysisResult.cv_id, file_name: fileName, created_at: new Date().toISOString() };
        setPageState({ status: 'display_results', analysis: analysisResult, resume });
      }, 500);
    } catch (e) {
      clearInterval(interval);
      setPageState({ status: 'error', error: 'Failed to analyze your resume. Please try again.' });
    }
  }), [pageState.status]);

  const renderContent = () => {
    switch (pageState.status) {
      case 'loading':
        return <div className="flex justify-center items-center p-10"><Loader2 className="w-10 h-10 animate-spin text-indigo-600"/></div>;
      case 'no_resume':
        return <ResumeUpload onUpload={handleUpload} setAnalyzing={() => setPageState({ status: 'analyzing', progress: 0, fileName: '' })} setError={(msg: string) => setPageState({status: 'error', error: msg})} />;
      case 'analyzing':
        return <AnalyzingResume progress={pageState.progress} fileName={pageState.fileName} />;
      case 'display_results':
        return <ResumeDisplay analysis={pageState.analysis} resume={pageState.resume} onReAnalyze={() => handleUpload(null)} />;
      case 'error':
        return (
          <div className="flex flex-col items-center text-center p-8 bg-red-50 rounded-lg">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4"/>
            <h3 className="text-xl font-semibold text-red-800">An Error Occurred</h3>
            <p className="text-red-700 mt-2 mb-6">{pageState.error}</p>
            <Button onClick={() => setPageState({ status: 'no_resume' })}>
              <RefreshCw className="w-4 h-4 mr-2"/>
              Try Again
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Resume</h1>
        {pageState.status === 'display_results' && (
          <Button variant="outline" onClick={() => setPageState({ status: 'no_resume' })}>Upload New Resume</Button>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-md min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait">
            <motion.div
                key={pageState.status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
            >
                {renderContent()}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 