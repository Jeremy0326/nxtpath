import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import type { CVAnalysisResult } from '../../types/cv';
import { useToast } from '../../hooks/useToast';
import api from '../../lib/axios';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Upload, FileText, Download, RefreshCw, Eye, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CVUploadProps {
  onAnalysisComplete: (analysis: CVAnalysisResult) => void;
  redirectOnComplete?: boolean;
}

interface CurrentCV {
  id: string;
  original_filename: string;
  uploaded_at: string;
  is_parsed: boolean;
}

// A simple date formatting utility
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export function CVUpload({ onAnalysisComplete = () => {}, redirectOnComplete = false }: CVUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentCV, setCurrentCV] = useState<CurrentCV | null>(null);
  const [isLoadingCV, setIsLoadingCV] = useState(true);
  const { addToast } = useToast();
  const progressIntervalRef = useRef<number | null>(null);

  const loadCurrentCV = useCallback(async () => {
    try {
      setIsLoadingCV(true);
      const response = await api.get('cv/active/');
      setCurrentCV(response.data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        addToast({
          title: 'Error Loading CV',
          description: 'Failed to load your current CV information.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoadingCV(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadCurrentCV();
  }, [loadCurrentCV]);

  const handleRefreshCV = async () => {
    await loadCurrentCV();
  };

  const handleDownload = () => {
    if (currentCV?.id) {
      window.open(`/api/cv/${currentCV.id}/download/`, '_blank');
    }
  };

  const handleView = () => {
    if (currentCV?.id) {
      window.open(`/api/cv/${currentCV.id}/download/`, '_blank');
    }
  };

  const handleUpload = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('is_active', 'true');

      const response = await api.post('cv/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setCurrentCV(response.data);
      addToast({
        title: 'CV Uploaded Successfully',
        description: 'Your CV has been uploaded and is now active.',
        variant: 'default',
      });

      // Trigger job list refresh
      window.dispatchEvent(new Event('cv:refresh-matches'));

      // Clear AI job matching cache to force refresh
      localStorage.removeItem('aiJobMatches');
      localStorage.removeItem('aiJobMatchesTimestamp');
      // Only reload CV, do not reload the whole page
      await loadCurrentCV();
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      let errorMessage = 'Failed to upload your CV. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Invalid request. Please check your file and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'You need to be logged in to upload a CV.';
      } else if (error.response?.status === 404) {
        errorMessage = 'CV upload endpoint not found. Please contact support.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large. Please upload a smaller file.';
      } else if (error.response?.status === 415) {
        errorMessage = 'Unsupported file format. Please upload a PDF or Word document.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      addToast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      await loadCurrentCV();
    }
  }, [addToast, loadCurrentCV]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Reset error state
    setError(null);

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a PDF or Word document.');
      addToast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF or Word document.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Please upload a file smaller than 5MB.');
      addToast({
        title: 'File Too Large',
        description: 'Please upload a file smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      progressIntervalRef.current = window.setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      // Log the file being uploaded for debugging
      console.log('Uploading file:', file.name, file.type, file.size);

      // Use the new handleUpload function
      await handleUpload(file);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      setUploadProgress(100);

      // Wait a bit to show 100% progress
      setTimeout(() => {
        // Create a mock analysis result for compatibility
        const mockAnalysis: CVAnalysisResult = {
          id: currentCV?.id || '',
          skills: [],
          experience: [],
          education: [],
          overall_score: 85,
          suggestions: []
        };
        onAnalysisComplete(mockAnalysis);
        
        if (redirectOnComplete) {
          // Redirect logic
        }
      }, 500);
      
    } catch (err: any) {
      console.error('CV upload error:', err);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      setUploadProgress(0);
      setError('Failed to upload your CV. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [addToast, currentCV?.id, onAnalysisComplete, redirectOnComplete, handleUpload]);

  // Clean up interval on unmount
  const cleanup = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Add cleanup on unmount
  useCallback(() => {
    return () => cleanup();
  }, [cleanup]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: isUploading,
    noClick: isUploading,
    noDrag: isUploading,
  });

  if (isLoadingCV) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Active CV</CardTitle>
          <CardDescription>Loading your resume information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-gray-100 rounded-md animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (currentCV) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Active CV</CardTitle>
          <CardDescription>
            This is the CV that will be used for AI job matching.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="font-semibold text-gray-800">{currentCV.original_filename}</p>
                <p className="text-sm text-gray-500">
                  Uploaded: {formatDate(currentCV.uploaded_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleView} variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button onClick={handleRefreshCV} variant="ghost" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {currentCV.is_parsed === false && (
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">
                Your CV is still being processed. Some features may not be available yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : error 
              ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <AnimatePresence>
          {!isUploading ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                {error ? (
                  <AlertCircle className="h-12 w-12 text-red-500" />
                ) : (
                <Upload className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop your CV here' : error ? 'Upload Failed' : currentCV ? 'Upload New CV' : 'Upload your CV'}
                </p>
                {error ? (
                  <p className="text-sm text-red-600">{error}</p>
                ) : (
                <p className="text-sm text-gray-500">
                  {currentCV ? 'Drag and drop a new CV, or click to select a file' : 'Drag and drop your CV, or click to select a file'}
                </p>
                )}
                <p className="text-xs text-gray-400">
                  Supported formats: PDF, DOC, DOCX (max 5MB)
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                <FileText className="h-12 w-12 text-blue-500" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">Uploading CV...</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 