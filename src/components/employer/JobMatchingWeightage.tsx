import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { employerService } from '../../services/employerService';
import type { ExtendedJob } from '../../types/components';
import { useToast } from '../../hooks/useToast';

interface JobMatchingWeightageProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onSave: () => void;
}

export function JobMatchingWeightage({ isOpen, onClose, job, onSave }: JobMatchingWeightageProps) {
  const [weights, setWeights] = useState({
    skills: job.matching_weights?.skills || 40,
    experience: job.matching_weights?.experience || 30,
    education: job.matching_weights?.education || 30,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (job.matching_weights) {
      setWeights(job.matching_weights);
    }
  }, [job]);

  const handleWeightChange = (field: keyof typeof weights, value: number) => {
    setWeights(prev => {
      const newWeights = { ...prev, [field]: value };
      const total = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0);
      
      if (total !== 100) {
        setError('Weights must sum to 100%');
      } else {
        setError(null);
      }
      
      return newWeights;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (Math.round(total) !== 100) {
      setError('Weights must sum to 100%');
      return;
    }

    try {
      setIsSaving(true);
      await employerService.updateJobWeightage(job.id, weights);
      addToast({
        title: 'Success',
        description: 'Job matching weights updated successfully.',
        variant: 'default',
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to update weights:', error);
      addToast({
        title: 'Error',
        description: 'Failed to update weights. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Job Matching Weights</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Adjust the importance of each factor in the job matching algorithm
                </label>

                {/* Skills Weight */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-700">Skills</label>
                    <span className="text-sm text-gray-500">{weights.skills}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.skills}
                    onChange={(e) => handleWeightChange('skills', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Experience Weight */}
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-700">Experience</label>
                    <span className="text-sm text-gray-500">{weights.experience}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.experience}
                    onChange={(e) => handleWeightChange('experience', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Education Weight */}
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-700">Education</label>
                    <span className="text-sm text-gray-500">{weights.education}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.education}
                    onChange={(e) => handleWeightChange('education', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !!error}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="inline-block h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 