import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Building, MapPin, DollarSign, Upload, Paperclip, CheckCircle, ArrowLeft } from 'lucide-react';
import type { Job } from '../../types/job';
import { jobService } from '@/services/jobService';
import { motion } from 'framer-motion';
import { colors, componentStyles, typography, layout } from '@/lib/design-system';

export function JobApplicationPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    resume: null as File | null,
  });

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    jobService.getJobById(jobId)
      .then(setJob)
      .catch(() => setError('Failed to load job details.'))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(step + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className={`${typography.fontSize.xl} font-semibold text-gray-900 mb-2`}>Error Loading Job</h2>
          <p className="text-gray-600 mb-6">{error || 'Job not found.'}</p>
          <button 
            onClick={() => window.history.back()}
            className={`${componentStyles.button.base} ${componentStyles.button.sizes.md} ${componentStyles.button.variants.primary}`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center"
        >
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className={`${typography.fontSize['2xl']} font-bold text-gray-900 mb-3`}>Application Submitted!</h2>
          <p className="text-gray-600 mb-8">
            Your application has been successfully submitted to {job.company.name}. We'll notify you of any updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className={`${componentStyles.button.base} ${componentStyles.button.sizes.md} ${componentStyles.button.variants.secondary}`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </button>
            <button className={`${componentStyles.button.base} ${componentStyles.button.sizes.md} ${componentStyles.button.variants.primary}`}>
              View Application
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className={`${layout.container} py-8`}>
        {/* Page Header */}
        <div className="mb-6">
          <h1 className={`${typography.fontSize['3xl']} font-bold text-gray-900`}>Job Application</h1>
          <p className="text-gray-500 mt-1">Complete the form below to apply for this position</p>
        </div>
        
        {/* Job Header */}
        <div className={`${componentStyles.card.base} mb-8`}>
          <div className={componentStyles.card.body}>
            <div className="flex items-center space-x-4">
              {job.company.logo_url ? (
                <img
                  src={job.company.logo_url}
                  alt={job.company.name}
                  className="w-16 h-16 rounded-lg object-contain border border-gray-100 bg-white p-2"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Building className="w-8 h-8 text-indigo-600" />
                </div>
              )}
              <div>
                <h2 className={`${typography.fontSize.xl} font-semibold text-gray-900`}>{job.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-1.5 text-gray-400" />
                    {job.company.name}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                    {job.location}
                  </div>
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1.5 text-gray-400" />
                      {job.salary_min && job.salary_max 
                        ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}` 
                        : job.salary_min 
                          ? `From $${job.salary_min.toLocaleString()}` 
                          : `Up to $${job.salary_max?.toLocaleString()}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className={componentStyles.card.base}>
          <div className={`${componentStyles.card.header} border-b border-gray-100`}>
            <div className="flex items-center justify-between">
              <h3 className={`${typography.fontSize.lg} font-semibold text-gray-900`}>Application Form</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Step {step} of 2</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center">
              <div className="flex-1">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </div>
                  <div className={`h-1 w-full ${
                    step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-600">Personal Info</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                  <div className={`h-1 w-full ${
                    step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-600">Documents</p>
              </div>
              <div className="flex-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
                  3
                </div>
                <p className="mt-2 text-xs font-medium text-gray-600">Review</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={componentStyles.card.body}>
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <label className={componentStyles.form.label}>Full Name</label>
                  <input
                    type="text"
                    required
                    className={componentStyles.form.input}
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className={componentStyles.form.label}>Email</label>
                  <input
                    type="email"
                    required
                    className={componentStyles.form.input}
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className={componentStyles.form.label}>Phone</label>
                  <input
                    type="tel"
                    required
                    className={componentStyles.form.input}
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <label className={componentStyles.form.label}>Resume</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                          <span>Upload a file</span>
                          <input 
                            type="file" 
                            className="sr-only"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setForm({...form, resume: e.target.files[0]});
                              }
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 10MB</p>
                      {form.resume && (
                        <div className="mt-2 flex items-center justify-center text-sm text-indigo-600">
                          <Paperclip className="h-4 w-4 mr-1" />
                          {form.resume.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className={componentStyles.form.label}>Cover Letter</label>
                  <textarea
                    rows={6}
                    className={componentStyles.form.input}
                    placeholder="Why are you interested in this position?"
                    value={form.coverLetter}
                    onChange={(e) => setForm({...form, coverLetter: e.target.value})}
                  />
                </div>
              </motion.div>
            )}

            <div className="flex justify-between pt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className={`${componentStyles.button.base} ${componentStyles.button.sizes.md} ${componentStyles.button.variants.secondary}`}
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className={`${componentStyles.button.base} ${componentStyles.button.sizes.md} ${componentStyles.button.variants.primary}`}
              >
                {step === 2 ? 'Submit Application' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}