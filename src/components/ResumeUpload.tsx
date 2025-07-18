import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, Check, AlertCircle, Paperclip, Loader2, X, Building, Clock } from 'lucide-react';
import api from '../lib/axios';
import { colors, componentStyles, typography } from '../lib/design-system';

interface ResumeUploadProps {
  onUploadComplete: (parsedData: any) => void;
}

export function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check file type
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await api.post('resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setParsedData(response.data);
      onUploadComplete(response.data);
    } catch (err) {
      setError('Failed to upload and parse resume');
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="flex justify-center">
            {isDragActive ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center"
              >
                <Upload className="h-8 w-8 text-indigo-600" />
              </motion.div>
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-500" />
              </div>
            )}
          </div>
          <div className="text-gray-600">
            {isDragActive ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${typography.fontSize.lg} font-medium text-indigo-600`}
              >
                Drop your resume here...
              </motion.p>
            ) : (
              <div>
                <p className={`${typography.fontSize.base} text-gray-700`}>
                  Drag and drop your resume here, or{' '}
                  <span className="text-indigo-600 font-medium hover:text-indigo-700">browse</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {uploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full">
            <Loader2 className="animate-spin h-5 w-5 mr-3 text-indigo-600" />
            Processing your resume...
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start"
        >
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {parsedData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-8 ${componentStyles.card.base}`}
        >
          <div className={`${componentStyles.card.header} flex items-center justify-between`}>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <h3 className={`${typography.fontSize.lg} font-semibold text-gray-900`}>Resume Parsed Successfully</h3>
            </div>
          </div>
          
          <div className={componentStyles.card.body}>
            <div className="space-y-6">
              {parsedData.skills && parsedData.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {parsedData.experience && parsedData.experience.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Experience</h4>
                  <div className="space-y-3">
                    {parsedData.experience.map((exp: any, index: number) => (
                      <div key={index} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                        <p className="font-medium text-gray-900">{exp.title}</p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Building className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          {exp.company}
                          {exp.duration && (
                            <>
                              <span className="mx-2 text-gray-300">•</span>
                              <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                              {exp.duration}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {parsedData.education && parsedData.education.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Education</h4>
                  <div className="space-y-3">
                    {parsedData.education.map((edu: any, index: number) => (
                      <div key={index} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                        <p className="font-medium text-gray-900">{edu.degree}</p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <FileText className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          {edu.institution}
                          {edu.year && (
                            <>
                              <span className="mx-2 text-gray-300">•</span>
                              <span>{edu.year}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 