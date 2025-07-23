import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Save, Plus, Trash2, AlertCircle, Info, Building, MapPin, Calendar, Users, CheckCircle, Settings } from 'lucide-react';
import { careerFairService } from '../../services/careerFairService';
import { employerService } from '../../services/employerService';
import type { ExtendedJob, FrontendBooth } from '../../types/components';
import { useToast } from '../../hooks/useToast';

export function BoothSetupPage() {
  const { fairId, boothId } = useParams<{ fairId: string, boothId: string }>();
  const navigate = useNavigate();
  const [booth, setBooth] = useState<FrontendBooth | null>(null);
  const [companyJobs, setCompanyJobs] = useState<ExtendedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchBoothAndJobs = useCallback(async () => {
    if (!boothId) {
      setError("Booth ID is missing or invalid. Please access this page from Fair Management.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const boothDetailsPromise = careerFairService.getBoothDetails(boothId);
      const jobsPromise = employerService.getEmployerJobs({});
      const [boothDetails, jobs] = await Promise.all([boothDetailsPromise, jobsPromise]);
      if (!boothDetails) {
        setError('Booth not found. Please check your registration for this fair.');
        setIsLoading(false);
        return;
      }
      setBooth(boothDetails);
      setCompanyJobs(jobs.results);
    } catch (err: any) {
      console.error('Booth fetch error:', err);
      let msg = 'Failed to load booth details and jobs.';
      if (err?.response?.status === 403 || err?.response?.status === 401) {
        msg = 'You are not authorized to manage this booth.';
      } else if (err?.response?.status === 404) {
        msg = 'Booth not found. Please check your registration for this fair.';
      } else if (err?.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      addToast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [boothId, addToast]);

  useEffect(() => {
    // If boothId is 'new', create a booth and redirect
    if (boothId === 'new' && fairId) {
      (async () => {
        try {
          setIsLoading(true);
          setError(null);
          // Use the new create_booth endpoint
          const response = await careerFairService.createBooth(fairId);
          navigate(`/employer/fairs/${fairId}/booth/${response.id}`);
        } catch (err: any) {
          console.error('Booth creation error:', err);
          let errorMessage = 'Failed to create booth. Please check your registration or contact support.';
          if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
          } else if (err.message) {
            errorMessage = err.message;
          }
          setError(errorMessage);
          addToast({ 
            title: 'Booth Creation Failed', 
            description: errorMessage, 
            variant: 'destructive' 
          });
          setIsLoading(false);
        }
      })();
      return;
    }
    fetchBoothAndJobs();
  }, [boothId, fairId, fetchBoothAndJobs, addToast]);

  const handleToggleJobInBooth = (job: ExtendedJob) => {
    if (!booth) return;
    const isJobInBooth = booth.jobs.some(j => j.id === job.id);
    const updatedJobs = isJobInBooth
      ? booth.jobs.filter(j => j.id !== job.id)
      : [...booth.jobs, job];
    setBooth({ ...booth, jobs: updatedJobs });
  };

  const handleSaveChanges = async () => {
    if (!booth) return;
    try {
      setIsSaving(true);
      const job_ids = booth.jobs.map(j => j.id);
      await careerFairService.updateBooth(booth.id, { label: booth.label, job_ids });
      
      // Show success message and visual feedback
      addToast({ 
        title: 'Changes Saved!', 
        description: 'Your booth has been updated successfully. The changes are now live.', 
        variant: 'success' 
      });
      
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000); // Reset after 3 seconds
      
      // Optionally refresh the booth data to ensure we have the latest
      setTimeout(() => {
        fetchBoothAndJobs();
      }, 1000);
    } catch (error: any) {
      let msg = 'Failed to update booth.';
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        msg = 'You are not authorized to update this booth.';
      } else if (error?.response?.status === 404) {
        msg = 'Booth not found. Please check your registration for this fair.';
      } else if (error?.response?.data?.error) {
        msg = error.response.data.error;
      } else if (error.message) {
        msg = error.message;
      }
      addToast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
          <p className="text-lg text-gray-600 font-medium">Loading booth details...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">An Error Occurred</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={fetchBoothAndJobs} 
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              Try Again
            </button>
            <Link 
              to="/employer/fairs"
              className="block w-full px-6 py-3 text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Back to Fair Management
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            to="/employer/fairs" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Fair Management
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Booth Setup
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Customize your company's booth for {booth?.fair?.title || 'the career fair'}.
              </p>
            </div>
            
            <button 
              onClick={handleSaveChanges} 
              disabled={isSaving} 
              className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 ${
                justSaved 
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin"/>
              ) : justSaved ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              {isSaving ? 'Saving...' : justSaved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </motion.div>

        {/* Enhanced Booth Info Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Building className="h-6 w-6 mr-3 text-indigo-600" />
            Booth Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <InfoCard
              icon={MapPin}
              title="Booth Number"
              value={booth?.booth_number || 'Not yet assigned'}
              description="Assigned by host university"
              isAssigned={!!booth?.booth_number}
            />
            <InfoCard
              icon={Building}
              title="Floor Plan"
              value={booth?.fair?.floor_plan_url ? 'Available' : 'Not yet provided'}
              description="Provided by host university"
              isAssigned={!!booth?.fair?.floor_plan_url}
              link={booth?.fair?.floor_plan_url}
            />
            <InfoCard
              icon={MapPin}
              title="Booth Location"
              value={(booth?.x !== undefined && booth?.y !== undefined && (booth.x !== 0 || booth.y !== 0)) 
                ? `(${booth.x}, ${booth.y})` 
                : 'Not yet assigned'}
              description="Assigned by host university"
              isAssigned={(booth?.x !== undefined && booth?.y !== undefined && (booth.x !== 0 || booth.y !== 0))}
            />
          </div>
          
          {/* Enhanced Setup Requirements Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2" />
              What You Need to Set Up
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-blue-900">Booth Label:</strong>
                  <p className="text-blue-800 mt-1">Customize your booth name (currently set to "{booth?.label || 'Company Name'}")</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-blue-900">Featured Jobs:</strong>
                  <p className="text-blue-800 mt-1">Add jobs from your company to showcase at the booth</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-gray-700">Booth Number & Location:</strong>
                  <p className="text-gray-600 mt-1">Will be assigned by the host university</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                <div>
                  <strong className="text-gray-700">Floor Plan:</strong>
                  <p className="text-gray-600 mt-1">Will be provided by the host university</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Configuration Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Settings className="h-6 w-6 mr-3 text-indigo-600" />
            Booth Configuration
          </h2>
          
          {/* Booth Label Section */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Booth Label</label>
            <input 
              type="text" 
              value={booth?.label || ''} 
              onChange={e => setBooth(b => b ? {...b, label: e.target.value} : null)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Enter your booth name..."
            />
            <p className="text-sm text-gray-500 mt-2">This will be displayed to students visiting your booth</p>
          </div>
          
          {/* Featured Jobs Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="h-5 w-5 mr-2 text-indigo-600" />
              Featured Jobs
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Available Jobs */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-green-600" />
                  Your Company's Jobs
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {companyJobs.length > 0 ? (
                    companyJobs
                      .filter(job => job && job.title) // Filter out invalid jobs
                      .map(job => {
                        const isJobInBooth = booth?.jobs.some(j => j.id === job.id);
                        return (
                          <motion.div 
                            key={job.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
                          >
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 truncate">{job.title}</h5>
                              <p className="text-sm text-gray-500 truncate">{job.company?.name || 'Unknown Company'}</p>
                            </div>
                            <button 
                              onClick={() => !isJobInBooth && handleToggleJobInBooth(job)}
                              disabled={isJobInBooth}
                              className={`ml-3 p-2 text-white rounded-full transition-all duration-200 ${
                                isJobInBooth 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-green-500 hover:bg-green-600 hover:scale-105'
                              }`}
                            >
                              <Plus className="h-4 w-4"/>
                            </button>
                          </motion.div>
                        );
                      })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No jobs available</p>
                      <p className="text-sm">Create jobs in your company profile first</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Jobs in Booth */}
              <div className="bg-indigo-50 rounded-xl p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-indigo-600" />
                  Jobs in Booth
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {booth?.jobs && booth.jobs.length > 0 ? (
                    booth.jobs
                      .filter(job => job && job.title) // Filter out invalid jobs
                      .map(job => (
                        <motion.div 
                          key={job.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border border-indigo-200 hover:border-indigo-300 transition-all duration-200"
                        >
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 truncate">{job.title}</h5>
                            <p className="text-sm text-gray-500 truncate">{job.company?.name || 'Unknown Company'}</p>
                          </div>
                          <button 
                            onClick={() => handleToggleJobInBooth(job)} 
                            className="ml-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-105 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4"/>
                          </button>
                        </motion.div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No jobs added to the booth yet</p>
                      <p className="text-sm">Add jobs from the left panel to showcase them</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Enhanced InfoCard component
interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  isAssigned: boolean;
  link?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, value, description, isAssigned, link }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center mb-3">
        <Icon className={`h-5 w-5 mr-2 ${isAssigned ? 'text-green-600' : 'text-gray-400'}`} />
        <span className="font-semibold text-gray-700">{title}</span>
        <div className="relative group ml-2">
          <Info className="h-4 w-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {description}
          </div>
        </div>
      </div>
      <div className={`text-lg font-medium ${isAssigned ? 'text-gray-900' : 'text-gray-400'}`}>
        {link ? (
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-indigo-600 hover:text-indigo-700 underline transition-colors"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </div>
    </div>
  );
}; 
 
 
 
 
 
 
 
 
 
 
 