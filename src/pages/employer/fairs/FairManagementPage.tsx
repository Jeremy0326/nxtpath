import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Calendar, Building, MapPin, Users, CheckCircle, AlertCircle, Settings, Plus } from 'lucide-react';
import { careerFairService } from '../../../services/careerFairService';
import { CareerFair } from '../../../types/career-fair';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/useToast';

export function FairManagementPage() {
  const [fairs, setFairs] = useState<CareerFair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { addToast } = useToast();
  const [creatingBoothFor, setCreatingBoothFor] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFairs();
  }, []);

  const fetchFairs = async () => {
    try {
      setIsLoading(true);
      const response = await careerFairService.getEmployerFairs();
      const fairsData = Array.isArray(response) ? response : response.results;
      setFairs(fairsData || []);
      
      // Auto-create booth for any fair where company is registered but has no booth
      const employerCompanyId = user?.employer_profile?.company;
      for (const fair of fairsData || []) {
        const hasBooth = fair.booths.some((booth: any) => booth.company.id === employerCompanyId);
        if (!hasBooth && !creatingBoothFor) {
          setCreatingBoothFor(fair.id);
          try {
            await careerFairService.createBooth(fair.id);
            addToast({ 
              title: 'Booth Created', 
              description: `Booth successfully created for ${fair.title}. You can now manage your booth and add jobs.` 
            });
            // Refetch fairs after booth creation
            const refreshed = await careerFairService.getEmployerFairs();
            setFairs(Array.isArray(refreshed) ? refreshed : refreshed.results);
          } catch (err: any) {
            console.error('Booth creation error:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
            
            // If the error indicates the company is not registered, provide a helpful message
            if (errorMessage.includes('not associated with a company') || errorMessage.includes('not registered')) {
              addToast({ 
                title: 'Registration Required', 
                description: `You need to register for ${fair.title} first. Please go to Discover Fairs to register.`, 
                variant: 'destructive'
              });
            } else {
              addToast({ 
                title: 'Booth Creation Failed', 
                description: `Could not create booth for ${fair.title}: ${errorMessage}`, 
                variant: 'destructive' 
              });
            }
          } finally {
            setCreatingBoothFor(null);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load fairs:', err);
      setError('Failed to load your career fairs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualBoothCreation = async (fairId: string, fairTitle: string) => {
    if (creatingBoothFor) return; // Prevent multiple simultaneous creations
    
    setCreatingBoothFor(fairId);
    try {
      await careerFairService.createBooth(fairId);
      addToast({ 
        title: 'Booth Created', 
        description: `Booth successfully created for ${fairTitle}. You can now manage your booth and add jobs.` 
      });
      // Refetch fairs after booth creation
      const refreshed = await careerFairService.getEmployerFairs();
      setFairs(Array.isArray(refreshed) ? refreshed : refreshed.results);
    } catch (err: any) {
      console.error('Manual booth creation error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
      
      // If the error indicates the company is not registered, provide a helpful message
      if (errorMessage.includes('not associated with a company') || errorMessage.includes('not registered')) {
        addToast({ 
          title: 'Registration Required', 
          description: `You need to register for ${fairTitle} first. Please go to Discover Fairs to register.`, 
          variant: 'destructive'
        });
      } else {
        addToast({ 
          title: 'Booth Creation Failed', 
          description: `Could not create booth for ${fairTitle}: ${errorMessage}`, 
          variant: 'destructive' 
        });
      }
    } finally {
      setCreatingBoothFor(null);
    }
  };

  // Calculate dashboard statistics
  const totalFairs = fairs.length;
  const setUpBooths = fairs.filter(fair => {
    const employerCompanyId = user?.employer_profile?.company;
    const companyBooth = fair.booths.find(booth => booth.company.id === employerCompanyId);
    return companyBooth && companyBooth.jobs && companyBooth.jobs.length > 0;
  }).length;
  const pendingSetup = totalFairs - setUpBooths;
  const activeFairs = fairs.filter(fair => {
    const now = new Date();
    const startDate = new Date(fair.start_date);
    const endDate = new Date(fair.end_date);
    return now >= startDate && now <= endDate;
  }).length;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
        >
          <div className="mb-4 sm:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Fair Management
            </h1>
            <p className="text-lg text-gray-600 mt-2">Manage your company's presence at career fairs.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link 
              to="/employer/fairs/discover"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Discover Fairs
            </Link>
          </div>
        </motion.header>

        {/* Enhanced Statistics Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Total Fairs"
            value={totalFairs}
            icon={Building}
            color="blue"
            description="Career fairs you're registered for"
          />
          <StatCard
            title="Set Up Booths"
            value={setUpBooths}
            icon={CheckCircle}
            color="green"
            description="Booths with jobs configured"
          />
          <StatCard
            title="Pending Setup"
            value={pendingSetup}
            icon={AlertCircle}
            color="orange"
            description="Booths needing configuration"
          />
          <StatCard
            title="Active Fairs"
            value={activeFairs}
            icon={Calendar}
            color="purple"
            description="Currently running fairs"
          />
        </motion.div>

        {isLoading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
            <p className="text-lg text-gray-600 font-medium">Loading your career fairs...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">Failed to Load Fairs</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchFairs}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Loader2 className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </motion.div>
        ) : fairs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-6">
              <Building className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Career Fairs Found</h3>
            <p className="text-gray-600 mb-6">You are not registered for any upcoming career fairs.</p>
            <Link 
              to="/employer/fairs/discover"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Discover Career Fairs
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {fairs.map((fair, index) => {
              const employerCompanyId = user?.employer_profile?.company;
              const companyBooth = fair.booths.find(booth => booth.company.id === employerCompanyId);
              const boothId = companyBooth ? companyBooth.id : null;
              const isSetUp = companyBooth && companyBooth.jobs && companyBooth.jobs.length > 0;
              const jobCount = companyBooth?.jobs?.length || 0;
              
              return (
                <motion.div
                  key={fair.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${
                    isSetUp ? 'border-green-200 ring-1 ring-green-100' : 'border-orange-200 ring-1 ring-orange-100'
                  }`}
                >
                  {/* Enhanced Image Section */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
                    {fair.banner_image_url ? (
                      <img 
                        src={fair.banner_image_url} 
                        alt={fair.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building className="h-16 w-16 text-white opacity-80" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {isSetUp ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Set Up
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Not Set Up
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Content Section */}
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{fair.title}</h3>
                    
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">
                          {new Date(fair.start_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                          {fair.start_date !== fair.end_date && (
                            <> - {new Date(fair.end_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}</>
                          )}
                        </span>
                      </div>
                      
                      {fair.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="line-clamp-1">{fair.location}</span>
                        </div>
                      )}
                      
                      {fair.host && (
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="line-clamp-1">Host: {fair.host}</span>
                        </div>
                      )}
                      
                      {companyBooth && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="font-medium">
                            Your Booth: {companyBooth.label || 'NxtLvL Solutions'}
                            {jobCount > 0 && (
                              <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                                {jobCount} job{jobCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Action Section */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          className="flex items-center px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={async () => {
                            setCreatingBoothFor(fair.id);
                            try {
                              let booth = companyBooth;
                              if (!booth) {
                                booth = await careerFairService.createBooth(fair.id);
                                addToast({ title: 'Booth Created', description: `Booth created for ${fair.title}.` });
                              }
                              navigate(`/employer/fairs/${fair.id}/booth/${booth.id}`);
                            } catch (err: any) {
                              const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
                              addToast({ title: 'Error', description: `Could not manage booth for ${fair.title}: ${errorMessage}`, variant: 'destructive' });
                            } finally {
                              setCreatingBoothFor(null);
                            }
                          }}
                          disabled={creatingBoothFor === fair.id}
                        >
                          {creatingBoothFor === fair.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Settings className="h-4 w-4 mr-2" />
                          )}
                          {companyBooth ? 'Manage Booth' : creatingBoothFor === fair.id ? 'Creating Booth...' : 'Setup Booth'}
                        </button>
                      </div>
                      
                      {companyBooth && (
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Booth Status</div>
                          <div className={`text-sm font-medium ${
                            isSetUp ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {isSetUp ? 'Ready' : 'Needs Setup'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Enhanced StatCard component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'orange' | 'purple';
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, description }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
    </motion.div>
  );
}; 
 
 
 
 
 
 
 
 
 
 
 