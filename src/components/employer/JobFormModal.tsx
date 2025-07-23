import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Loader2, ArrowLeft, Briefcase, Target, Star, CheckCircle } from 'lucide-react';
import { employerService } from '../../services/employerService';
import { jobService } from '../../services/jobService'; // For fetching skills
import { Skill } from '../../types/models';
import type { ExtendedJob } from '../../types/components';
import { useToast } from '../../hooks/useToast';

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job;
  onSave: () => void;
}

const STEPS = {
  DETAILS: 1,
  REQUIREMENTS: 2,
  REVIEW: 3,
};

export function JobFormModal({ isOpen, onClose, job, onSave }: JobFormModalProps) {
  const [currentStep, setCurrentStep] = useState(STEPS.DETAILS);
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    description: '',
    location: '',
    job_type: 'FULL_TIME',
    requirements: [],
    responsibilities: [],
    salary_min: 0,
    salary_max: 0,
    currency: 'MYR',
    is_active: false,
    skills: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchSkills();
        if (job) {
        setFormData({
            ...job,
            job_type: job.job_type || 'FULL_TIME',
            is_active: job.is_active || false,
        });
            setCurrentStep(STEPS.REVIEW);
        } else {
            setFormData({
          title: '', description: '', location: '', job_type: 'FULL_TIME',
          requirements: [], responsibilities: [], salary_min: 0, salary_max: 0,
          currency: 'MYR', is_active: false, skills: []
            });
            setCurrentStep(STEPS.DETAILS);
        }
    }
  }, [isOpen, job]);

  const fetchSkills = async () => {
    try {
        const skills = await jobService.getSkills();
        setAvailableSkills(skills);
    } catch (error) {
        console.error("Failed to fetch skills", error);
        addToast({ title: "Error", description: "Could not load skills.", variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const submissionData = {
          ...formData,
          skill_ids: formData.skills?.map(s => s.id)
      };
      
      if (job) {
        await employerService.updateJob(job.id, submissionData);
      } else {
        await employerService.createJob(submissionData);
      }
      addToast({
        title: 'Success',
        description: `Job ${job ? 'updated' : 'created'} successfully.`,
        variant: 'default',
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save job:', error);
      addToast({
        title: 'Error',
        description: `Failed to ${job ? 'update' : 'create'} job. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.REVIEW) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > STEPS.DETAILS) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddSkill = (skill: Skill | undefined) => {
    if (skill && !formData.skills?.some(s => s.id === skill.id)) {
      setFormData(prev => ({
        ...prev,
            skills: [...(prev.skills || []), skill]
      }));
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter((s) => s.id !== skillId)
    }));
  };
  
  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...(prev.requirements || []), newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index)
    }));
  };

  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData(prev => ({
        ...prev,
        responsibilities: [...(prev.responsibilities || []), newResponsibility.trim()]
      }));
      setNewResponsibility('');
    }
  };

  const handleRemoveResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities?.filter((_, i) => i !== index)
    }));
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 px-6">
        <div className="flex items-center">
            <Step icon={<Briefcase />} label="Job Details" isActive={currentStep >= STEPS.DETAILS} isCompleted={currentStep > STEPS.DETAILS} />
            <div className={`flex-auto border-t-2 transition-colors duration-500 ${currentStep > STEPS.DETAILS ? 'border-indigo-600' : 'border-gray-300'}`}></div>
            <Step icon={<Target />} label="Requirements" isActive={currentStep >= STEPS.REQUIREMENTS} isCompleted={currentStep > STEPS.REQUIREMENTS} />
            <div className={`flex-auto border-t-2 transition-colors duration-500 ${currentStep > STEPS.REQUIREMENTS ? 'border-indigo-600' : 'border-gray-300'}`}></div>
            <Step icon={<Star />} label="Review" isActive={currentStep === STEPS.REVIEW} />
        </div>
    </div>
  );

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
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {job ? 'Edit Job' : 'Create New Job'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {renderStepIndicator()}

            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto px-8 pb-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStep === STEPS.DETAILS && <JobDetailsStep formData={formData} setFormData={setFormData} />}
                        {currentStep === STEPS.REQUIREMENTS && <RequirementsStep formData={formData} setFormData={setFormData} availableSkills={availableSkills} newSkill={newSkill} setNewSkill={setNewSkill} handleAddSkill={handleAddSkill} handleRemoveSkill={handleRemoveSkill} newRequirement={newRequirement} setNewRequirement={setNewRequirement} handleAddRequirement={handleAddRequirement} handleRemoveRequirement={handleRemoveRequirement} newResponsibility={newResponsibility} setNewResponsibility={setNewResponsibility} handleAddResponsibility={handleAddResponsibility} handleRemoveResponsibility={handleRemoveResponsibility} />}
                        {currentStep === STEPS.REVIEW && <ReviewStep formData={formData} />}
                    </motion.div>
                </AnimatePresence>
            </form>
            
            <div className="flex justify-between items-center p-6 bg-gray-50 border-t">
              <div>
                {currentStep > STEPS.DETAILS && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-4">
                  <select
                    value={formData.is_active ? 'active' : 'draft'}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="active">Publish Now</option>
                  </select>

                  {currentStep < STEPS.REVIEW ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all"
                    >
                        Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-all"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="inline-block h-5 w-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                         <CheckCircle className="h-5 w-5 mr-2"/>
                         {job ? 'Save Changes' : 'Create Job'}
                        </>
                      )}
                    </button>
                  )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Step Components
const Step = ({ icon, label, isActive, isCompleted }: { icon: React.ReactNode, label: string, isActive: boolean, isCompleted?: boolean }) => (
    <div className="flex items-center flex-col w-28">
        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${isActive ? 'bg-indigo-600 border-indigo-600 text-white' : isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
            {isCompleted ? <CheckCircle /> : icon}
        </div>
        <p className={`mt-2 text-center text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>{label}</p>
    </div>
);

const FormRow = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">{children}</div>
);

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
        <label className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>
        {children}
    </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none bg-white bg-chevron-down bg-no-repeat bg-right" />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
);

// Step 1 Component
const JobDetailsStep = ({ formData, setFormData }: { formData: Partial<Job>, setFormData: React.Dispatch<React.SetStateAction<Partial<Job>>> }) => (
    <div className="space-y-8">
        <FormRow>
            <FormField label="Job Title">
                <Input type="text" value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} required placeholder="e.g., Senior Frontend Developer"/>
            </FormField>
            <FormField label="Location">
                <Input type="text" value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} required placeholder="e.g., London, UK or Remote"/>
            </FormField>
        </FormRow>
        <FormField label="Job Description">
            <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={6} required placeholder="Provide a detailed job description..."/>
        </FormField>
    </div>
);

// Step 2 Component
const RequirementsStep = ({ formData, setFormData, availableSkills, newSkill, setNewSkill, handleAddSkill, handleRemoveSkill, newRequirement, setNewRequirement, handleAddRequirement, handleRemoveRequirement, newResponsibility, setNewResponsibility, handleAddResponsibility, handleRemoveResponsibility }: { formData: Partial<Job>, setFormData: React.Dispatch<React.SetStateAction<Partial<Job>>>, availableSkills: Skill[], newSkill: string, setNewSkill: React.Dispatch<React.SetStateAction<string>>, handleAddSkill: (skill: Skill | undefined) => void, handleRemoveSkill: (skillId: string) => void, newRequirement: string, setNewRequirement: React.Dispatch<React.SetStateAction<string>>, handleAddRequirement: () => void, handleRemoveRequirement: (index: number) => void, newResponsibility: string, setNewResponsibility: React.Dispatch<React.SetStateAction<string>>, handleAddResponsibility: () => void, handleRemoveResponsibility: (index: number) => void }) => (
    <div className="space-y-8">
        <FormRow>
            <FormField label="Employment Type">
                <Select value={formData.job_type} onChange={(e) => setFormData(p => ({ ...p, job_type: e.target.value }))} required>
                    <option value="FULL_TIME">Full-time</option><option value="PART_TIME">Part-time</option><option value="CONTRACT">Contract</option><option value="INTERNSHIP">Internship</option>
                </Select>
            </FormField>
        </FormRow>

        <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Minimum Salary">
                    <Input type="number" value={formData.salary_min} onChange={(e) => setFormData(p => ({...p, salary_min: Number(e.target.value) }))} placeholder="e.g., 50000"/>
                </FormField>
                <FormField label="Maximum Salary">
                    <Input type="number" value={formData.salary_max} onChange={(e) => setFormData(p => ({...p, salary_max: Number(e.target.value) }))} placeholder="e.g., 70000"/>
                </FormField>
                <FormField label="Currency">
                    <Select value={formData.currency} onChange={(e) => setFormData(p => ({...p, currency: e.target.value }))} required>
                       <option>USD</option><option>EUR</option><option>GBP</option><option>SGD</option><option>MYR</option>
                    </Select>
                </FormField>
            </div>
        </div>

        <div className="border-t pt-8">
            <label className="block text-lg font-semibold text-gray-800 mb-4">Required Skills</label>
            <div className="flex gap-2 mb-4">
                <Input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill and press Enter" onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const skillToAdd = availableSkills.find(s => s.name.toLowerCase().includes(newSkill.toLowerCase()));
                        if (skillToAdd) {
                            handleAddSkill(skillToAdd);
                        }
                    }
                }} />
                <button type="button" onClick={() => {
                    const skillToAdd = availableSkills.find(s => s.name.toLowerCase().includes(newSkill.toLowerCase()));
                    if (skillToAdd) {
                        handleAddSkill(skillToAdd);
                    }
                }} className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Plus className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-wrap gap-3">
                {formData.skills?.map((skill) => (
                    <span key={skill.id} className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                        {skill.name}
                        <button type="button" onClick={() => handleRemoveSkill(skill.id)} className="ml-2 text-indigo-600 hover:text-indigo-800"><X className="h-4 w-4" /></button>
                    </span>
                ))}
            </div>
        </div>
        
        <div className="border-t pt-8">
            <label className="block text-lg font-semibold text-gray-800 mb-4">Hard Requirements</label>
            <div className="flex gap-2 mb-4">
                <Input type="text" value={newRequirement} onChange={(e) => setNewRequirement(e.target.value)} placeholder="e.g., 5+ years of React experience" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}/>
                <button type="button" onClick={handleAddRequirement} className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Plus className="h-5 w-5" /></button>
            </div>
            <ul className="space-y-3">
                {formData.requirements?.map((req, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                        <span className="text-sm text-gray-800">{req}</span>
                        <button type="button" onClick={() => handleRemoveRequirement(index)} className="text-red-600 hover:text-red-800"><Trash2 className="h-5 w-5" /></button>
                    </li>
                ))}
            </ul>
        </div>

        <div className="border-t pt-8">
            <label className="block text-lg font-semibold text-gray-800 mb-4">Responsibilities</label>
            <div className="flex gap-2 mb-4">
                <Input type="text" value={newResponsibility} onChange={(e) => setNewResponsibility(e.target.value)} placeholder="e.g., Develop and maintain web applications" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResponsibility())}/>
                <button type="button" onClick={handleAddResponsibility} className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Plus className="h-5 w-5" /></button>
            </div>
            <ul className="space-y-3">
                {formData.responsibilities?.map((resp, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                        <span className="text-sm text-gray-800">{resp}</span>
                        <button type="button" onClick={() => handleRemoveResponsibility(index)} className="text-red-600 hover:text-red-800"><Trash2 className="h-5 w-5" /></button>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

// Step 3 Component
const ReviewStep = ({ formData }: { formData: Partial<Job> }) => (
    <div className="space-y-8">
        <div>
            <h3 className="text-2xl font-bold text-gray-900">{formData.title}</h3>
            <p className="text-md text-gray-600">{formData.location}</p>
        </div>
        <div className="prose prose-indigo max-w-none">
            <h4>Description</h4>
            <p>{formData.description}</p>
            
            <h4>Details</h4>
            <ul>
                <li><strong>Type:</strong> {formData.job_type}</li>
                <li><strong>Salary:</strong> {formData.salary_min} - {formData.salary_max} {formData.currency}</li>
            </ul>

            <h4>Skills</h4>
            <div className="flex flex-wrap gap-2">
                {formData.skills?.map(skill => <span key={skill.id} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">{skill.name}</span>)}
            </div>

            <h4>Requirements</h4>
            <ul>
                {formData.requirements?.map((req, index) => <li key={index}>{req}</li>)}
            </ul>

            <h4>Responsibilities</h4>
            <ul>
                {formData.responsibilities?.map((resp, index) => <li key={index}>{resp}</li>)}
            </ul>
        </div>
    </div>
); 