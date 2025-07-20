import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  MapPin,
  Search,
  Filter,
  ArrowLeft,
  Building,
  Globe,
  Users,
  Briefcase,
  Clock,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { BookingModal } from '../../components/career-fair/BookingModal';
import { CompanyCard } from '../../components/career-fair/CompanyCard';
import { FloorMap } from '../../components/career-fair/FloorMap';
import { FairItinerary } from '../../components/career-fair/FairItinerary';
import { careerFairService } from '../../services/careerFairService';
import type { FrontendCareerFair } from '../../types/components';
import { Loader2 } from 'lucide-react';
import { Company } from '../../types/models';

interface DisplayCompany {
  id: string;
  name: string;
  logo: string;
  boothNumber?: string;
  description?: string;
  industry?: string;
  jobs?: any[];
  location?: string;
  website?: string;
  size?: string;
  social_links?: Record<string, string>;
  gallery_urls?: string[];
}

export function CareerFairPage() {
  const { fairId } = useParams<{ fairId: string }>();
  const [fair, setFair] = useState<FrontendCareerFair | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<DisplayCompany | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [showItinerary, setShowItinerary] = useState(false);
  const navigate = useNavigate();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (fairId) {
      fetchFairDetails(fairId);
    }
  }, [fairId]);

  const fetchFairDetails = async (id: string) => {
    try {
      setIsLoading(true);
      const fairData = await careerFairService.getFairDetails(id);
      setFair(fairData);
    } catch (err) {
      setError('Failed to load career fair details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCompany = (company: DisplayCompany) => {
    setSelectedCompany(company);
    setDetailsOpen(true);
    setActiveImageIndex(0);
  };
  
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setTimeout(() => setSelectedCompany(null), 300); // Clear after animation completes
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/student/jobs`);
  };

  const handleMessageRecruiter = (companyId: string) => {
    console.log('Message recruiter:', companyId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!fair) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Career fair not found.
      </div>
    );
  }

  const filteredBooths = fair.booths?.filter(booth => {
    const company = booth.company;
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesIndustry =
      selectedIndustry === 'all' || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <Link to="/student/career-fairs" className="flex items-center text-indigo-600 hover:underline">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Fairs
          </Link>
          <button 
            onClick={() => setShowItinerary(!showItinerary)}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-all"
          >
            {showItinerary ? 'Hide Itinerary' : 'Show Itinerary'}
          </button>
        </div>
        <div className="mt-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{fair.title}</h1>
          <p className="mt-2 text-gray-600">{fair.description}</p>
          <div className="mt-4 flex justify-center items-center space-x-6 text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{new Date(fair.start_date).toLocaleDateString()} - {new Date(fair.end_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{fair.location}</span>
            </div>
          </div>
        </div>
      </div>

      {showItinerary ? (
        <FairItinerary date={fair.start_date} events={[]} onCancelEvent={() => {}} />
      ) : (
        <>
          <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm py-4 px-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search companies by name or industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select 
                  value={selectedIndustry} 
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Industries</option>
                  {[...new Set(fair.booths.map(b => b.company.industry))].map((industry, idx) => (
                    <option key={industry + '-' + idx} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBooths.map(booth => {
                const company = {
                  id: booth.company.id,
                  name: booth.company.name,
                  logo: booth.company.logo_url || '/placeholder.svg',
                  boothNumber: booth.booth_number || '',
                  description: booth.company.description || '',
                  industry: booth.company.industry || '',
                  jobs: booth.jobs || [],
                  location: booth.company.location || '',
                  website: booth.company.website || '',
                  size: booth.company.size || '',
                  social_links: booth.company.social_links || {},
                  gallery_urls: booth.company.gallery_urls || [],
                };
                return (
                  <CompanyCard
                    key={booth.id}
                    company={company}
                    onClick={() => handleSelectCompany(company)}
                  />
                );
              })}
            </div>

            <div className="lg:col-span-1 sticky top-24">
              <FloorMap
                booths={fair.booths.map(b => ({
                  id: b.id,
                  booth_number: b.booth_number,
                  label: b.label || b.company.name,
                  company: {
                    id: b.company.id,
                    name: b.company.name,
                    logo_url: b.company.logo_url || '/placeholder.svg',
                  },
                  x: b.x,
                  y: b.y,
                  width: b.width || 16,
                  height: b.height || 16,
                  jobs: b.jobs || [],
                  created_at: b.created_at,
                  updated_at: b.updated_at
                }))}
                selectedBooth={selectedCompany?.boothNumber || null}
                onBoothClick={boothId => {
                  const boothData = fair.booths.find(b => b.booth_number === boothId || b.id === boothId);
                  if (boothData) {
                    const company = {
                      id: boothData.company.id,
                      name: boothData.company.name,
                      logo: boothData.company.logo_url || '/placeholder.svg',
                      boothNumber: boothData.booth_number || '',
                      description: boothData.company.description || '',
                      industry: boothData.company.industry || '',
                      jobs: boothData.jobs || [],
                      location: boothData.company.location || '',
                      website: boothData.company.website || '',
                      size: boothData.company.size || '',
                      social_links: boothData.company.social_links || {},
                      gallery_urls: boothData.company.gallery_urls || [],
                    };
                    handleSelectCompany(company);
                  }
                }}
              />
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {detailsOpen && selectedCompany && (
          <Dialog 
            open={detailsOpen} 
            onClose={handleCloseDetails} 
            className="fixed z-50 inset-0 overflow-y-auto"
            static
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <Dialog.Overlay 
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 transition-opacity" 
              />
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl border border-gray-100 transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl w-full relative"
                style={{ boxShadow: '0 8px 40px 0 rgba(0,0,0,0.18), 0 1.5px 6px 0 rgba(0,0,0,0.08)' }}
              >
                {/* Close button (relative to modal box) */}
                <div className="absolute top-6 right-6 z-10">
                  <button 
                    onClick={handleCloseDetails} 
                    className="bg-white border border-gray-200 rounded-full shadow p-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="flex flex-col md:flex-row">
                  {/* Left column - Logo and gallery */}
                  <div className="md:w-2/5 bg-gray-50 p-8 flex flex-col">
                    <div className="mb-6 flex justify-center">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-20"></div>
                        <img 
                          src={selectedCompany.logo || '/placeholder.svg'} 
                          alt={selectedCompany.name} 
                          className="relative w-40 h-40 rounded-2xl object-contain border border-gray-100 bg-white shadow-md p-3" 
                          onError={e => { e.currentTarget.src = '/placeholder.svg'; }} 
                        />
                      </div>
                    </div>
                    
                    {selectedCompany.gallery_urls && selectedCompany.gallery_urls.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Company Gallery</h4>
                        <div className="relative">
                          <div className="overflow-hidden rounded-xl shadow-md aspect-video bg-gray-100">
                            <img 
                              src={selectedCompany.gallery_urls[activeImageIndex]} 
                              alt="Company gallery" 
                              className="w-full h-full object-cover"
                              onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
                            />
                          </div>
                          
                          <div className="flex justify-center mt-3 space-x-2">
                            {selectedCompany.gallery_urls.map((_, idx) => (
                              <button 
                                key={idx} 
                                className={`w-2 h-2 rounded-full ${idx === activeImageIndex ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                onClick={() => setActiveImageIndex(idx)}
                                aria-label={`View image ${idx + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          {selectedCompany.gallery_urls.map((url, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveImageIndex(idx)}
                              className={`rounded-lg overflow-hidden border-2 ${idx === activeImageIndex ? 'border-indigo-500' : 'border-transparent'}`}
                            >
                              <img 
                                src={url} 
                                alt={`Gallery thumbnail ${idx + 1}`} 
                                className="w-full h-12 object-cover" 
                                onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Right column - Company details */}
                  <div className="md:w-3/5 p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedCompany.name}</h2>
                        {selectedCompany.boothNumber && (
                          <span className="inline-flex items-center px-3 py-1 mt-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                            Booth {selectedCompany.boothNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {selectedCompany.industry && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="w-4 h-4 mr-2 text-indigo-500" />
                          <span className="font-medium mr-1">Industry:</span> {selectedCompany.industry}
                        </div>
                      )}
                      
                      {selectedCompany.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                          <span className="font-medium mr-1">Location:</span> {selectedCompany.location}
                        </div>
                      )}
                      
                      {selectedCompany.website && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="w-4 h-4 mr-2 text-indigo-500" />
                          <span className="font-medium mr-1">Website:</span> 
                          <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">{selectedCompany.website}</a>
                        </div>
                      )}
                      
                      {selectedCompany.size && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-indigo-500" />
                          <span className="font-medium mr-1">Size:</span> {selectedCompany.size.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                    
                    {selectedCompany.description && (
                      <div className="mb-6">
                        <h3 className="text-md font-semibold text-gray-900 mb-2">About {selectedCompany.name}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{selectedCompany.description}</p>
                      </div>
                    )}
                    
                    {/* Social links */}
                    {selectedCompany.social_links && Object.keys(selectedCompany.social_links).length > 0 && (
                      <div className="flex space-x-3 mb-6">
                        {Object.entries(selectedCompany.social_links).map(([platform, url]) => (
                          <a 
                            key={platform} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-indigo-500 hover:text-indigo-700 transition-colors"
                            aria-label={`${selectedCompany.name} on ${platform}`}
                          >
                            <i className={`fab fa-${platform.toLowerCase()} text-lg`}></i>
                          </a>
                        ))}
                      </div>
                    )}
                    
                    {/* Open Jobs */}
                    <div className="mt-6">
                      <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-indigo-500" />
                        Open Positions
                      </h3>
                      
                      {selectedCompany.jobs && selectedCompany.jobs.length > 0 ? (
                        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 -mr-2">
                          {selectedCompany.jobs.map((job: any) => (
                            <div 
                              key={job.id} 
                              className="bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                              onClick={() => handleViewJob(job.id)}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-indigo-700">{job.title}</h4>
                                {job.match_score && (
                                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                                    {job.match_score}% Match
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                                <div className="flex items-center">
                                  <Briefcase className="w-3 h-3 mr-1 text-gray-400" />
                                  {job.job_type}
                                </div>
                                
                                {job.location && (
                                  <div className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                    {job.location}
                                  </div>
                                )}
                                
                                {job.salary_min && job.salary_max && (
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1 text-gray-400" />
                                    MYR {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                                  </div>
                                )}
                              </div>
                              
                              {job.description && (
                                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                              )}
                              
                              <div className="flex justify-end mt-3">
                                <button className="text-xs text-indigo-600 font-medium flex items-center hover:text-indigo-800">
                                  View details
                                  <ChevronRight className="w-3 h-3 ml-1" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <p className="text-gray-500 text-sm">No open positions listed at this time</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Footer actions */}
                <div className="bg-gray-50 px-8 py-4 flex justify-between items-center">
                  <button
                    onClick={handleCloseDetails}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                  >
                    Close
                  </button>
                  
                  <div className="flex space-x-3">                    
                    <button
                      onClick={() => {/* Add to itinerary logic */}}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      Add to Itinerary
                      <ChevronRight className="w-4 h-4 ml-1.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}