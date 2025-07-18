import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud } from 'lucide-react';
import { CVUpload } from '../cv/CVUpload';
import type { CVAnalysisResult } from '../../types/cv';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (analysis: CVAnalysisResult) => void;
}

export function ResumeUploadModal({ isOpen, onClose, onUploadComplete }: ResumeUploadModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <UploadCloud className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Upload Your Resume</h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-center text-gray-600 mb-6">
                You need a resume on file to apply for jobs. Please upload your most recent resume to continue.
              </p>
              <CVUpload onAnalysisComplete={onUploadComplete} />
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 