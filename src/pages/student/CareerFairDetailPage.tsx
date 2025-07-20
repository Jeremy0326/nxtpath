import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Search, Map, X, ExternalLink, Calendar, Users, Briefcase, MapPin, DollarSign, ChevronRight } from 'lucide-react';
import { careerFairService } from '../../services/careerFairService';
import type { FrontendCareerFair, ExtendedJob } from '../../types/components';
import { Booth } from '../../types/models';
import { JobCard } from '../../components/jobs/JobCard';
import { FloorPlan } from '../../components/career-fair/FloorPlan';
import { useToast } from '../../hooks/useToast';

export function CareerFairDetailPage() {
  const { fairId } = useParams<{ fairId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [fair, setFair] = useState<FrontendCareerFair | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooth, setSelectedBooth] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<ExtendedJob | null>(null);

  useEffect(() => {
    if (fairId) {
      fetchFairDetails();
    }
  }, [fairId]);

  const fetchFairDetails = async () => {
    try {
      setIsLoading(true);
      const response = await careerFairService.getFairDetails(fairId!);
      setFair(response);
    } catch (err) {
      setError('Failed to load career fair details.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooths = fair?.booths?.filter(booth => 
    booth.company.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleBoothClick = (booth: any) => {
    setSelectedBooth(booth);
  };

  const handleJobDetailsClick = (job: ExtendedJob) => {
    setSelectedJob(job);
  };

  const handleBrowseAllJobs = () => {
    if (selectedBooth) {
      navigate(`/student/jobs`);
    }
  };

  const handleAddToItinerary = () => {
    if (selectedBooth) {
      // Add to itinerary functionality
      addToast({ 
        title: 'Success', 
        description: `${selectedBooth.company.name} added to your itinerary!` 
      });
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setSelectedBooth(null);
    setSelectedJob(null);
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!fair) return <div className="p-8 text-center text-gray-500">Career fair not found.</div>;

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/student/career-fairs" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Fairs
        </Link>
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900">{fair.title}</h1>
            <p className="mt-2 text-lg text-gray-600">{fair.description}</p>
        </div>

        {fair.floor_plan_url && (
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Floor Plan</h2>
                <FloorPlan fair={fair} />
            </div>
        )}

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border rounded-full focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooths?.map(booth => (
            <motion.div 
              key={booth.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-white rounded-xl p-6 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleBoothClick(booth)}
            >
              <div className="flex items-center mb-4">
                <img src={booth.company.logo_url || '/placeholder.svg'} alt={booth.company.name} className="h-16 w-16 rounded-full object-contain mr-4" />
                <div>
                  <h2 className="text-2xl font-bold">{booth.company.name}</h2>
                </div>
              </div>
              <p className="text-gray-600 mb-4 text-sm h-20 overflow-hidden">{booth.company.description}</p>
              <h3 className="text-lg font-semibold mb-2">Featured Jobs</h3>
              <div className="space-y-4">
                {booth.jobs.slice(0, 2).map(job => (
                  <div 
                    key={job.id}
                    className="p-3 border rounded-lg hover:border-indigo-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobDetailsClick(job);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">{job.title}</h4>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{job.job_type.replace('_', ' ')}</span>
                          <span>{job.location}</span>
                          {job.salary_min && job.salary_max && (
                            <span>MYR {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <span className="text-sm text-indigo-600 hover:text-indigo-500 cursor-pointer">
                        View details
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                onClick={(e) => e.stopPropagation()}
              >
                Register Interest
              </button>
            </motion.div>
          ))}
        </div>

        {/* Company Modal */}
        {selectedBooth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
          >
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={selectedBooth.company.logo_url || '/placeholder.svg'}
                        alt={selectedBooth.company.name}
                        className="h-16 w-16 rounded-lg object-contain bg-white p-2"
                      />
                      <div>
                        <h2 className="text-2xl font-bold">{selectedBooth.company.name}</h2>
                        <div className="mt-1 flex items-center space-x-4 text-white/80">
                          <span>{selectedBooth.company.industry || 'Technology'}</span>
                          <span>•</span>
                          <span>{selectedBooth.company.location || 'Location'}</span>
                          <span>•</span>
                          <span>{selectedBooth.company.size || 'STARTUP'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* About Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">About {selectedBooth.company.name}</h3>
                    <p className="text-gray-600">{selectedBooth.company.description || 'A dynamic company building innovative solutions.'}</p>
                  </div>

                  {/* Open Positions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Open Positions</h3>
                    <div className="space-y-4">
                      {selectedBooth.jobs.slice(0, 3).map((job: ExtendedJob) => (
                        <div key={job.id} className="p-4 border rounded-lg hover:border-indigo-500 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{job.title}</h4>
                              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Briefcase className="h-4 w-4 mr-1.5" />
                                  {job.job_type.replace('_', ' ')}
                                </span>
                                <span className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1.5" />
                                  {job.location}
                                </span>
                                {job.salary_min && job.salary_max && (
                                  <span>MYR {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}</span>
                                )}
                              </div>
                              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{job.description}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => handleJobDetailsClick(job)}
                              className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              View details
                              <ExternalLink className="h-4 w-4 ml-1.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Company Gallery */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Gallery</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">Image {i}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleBrowseAllJobs}
                      className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                    >
                      <ExternalLink className="h-4 w-4 mr-1.5" />
                      Browse All Jobs
                    </button>
                    <button
                      onClick={handleAddToItinerary}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                      <Calendar className="h-4 w-4 mr-1.5" />
                      Add to Itinerary
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Job Details Modal */}
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
          >
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{selectedJob.title}</h2>
                      <p className="mt-1 text-white/80">{selectedJob.company.name}</p>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Quick Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 mr-1.5" />
                        {selectedJob.job_type.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1.5" />
                        {selectedJob.location}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1.5" />
                        {selectedJob.salary_min && selectedJob.salary_max 
                          ? `MYR ${selectedJob.salary_min.toLocaleString()} - ${selectedJob.salary_max.toLocaleString()}`
                          : 'Competitive'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Position Overview</h3>
                    <p className="text-gray-600">{selectedJob.description}</p>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Requirements</h3>
                    <ul className="space-y-2">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span className="text-gray-600">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <div className="flex space-x-3">
                    <Link
                      to={`/jobs/${selectedJob.id}`}
                      className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                    >
                      <ExternalLink className="h-4 w-4 mr-1.5" />
                      View Full Details
                    </Link>
                    <button
                      onClick={() => navigate(`/jobs/apply/${selectedJob.id}`)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                      Apply Now
                      <ChevronRight className="ml-1.5 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 