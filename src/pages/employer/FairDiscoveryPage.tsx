import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Search, Calendar, MapPin, Building, Users, ArrowLeft, Plus, CheckCircle } from 'lucide-react';
import { careerFairService } from '../../services/careerFairService';
import type { FrontendCareerFair } from '../../types/components';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export function FairDiscoveryPage() {
  const [fairs, setFairs] = useState<CareerFair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();
  const [showUnregisterModal, setShowUnregisterModal] = useState(false);
  const [pendingUnregisterId, setPendingUnregisterId] = useState<string | null>(null);

  const fetchFairs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // This will need a new service method to get all *registerable* fairs
      const response = await careerFairService.getDiscoverableFairs({ search: searchTerm });
      setFairs(response.results);
    } catch (err) {
      const errorMessage = 'Failed to load career fairs.';
      setError(errorMessage);
      addToast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, addToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchFairs();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchFairs]);

  const handleRegister = async (fairId: string) => {
    try {
      await careerFairService.registerForFair(fairId);
      addToast({ title: 'Success', description: 'Successfully registered for the fair.' });
      // Update UI to reflect registration
      setFairs(prevFairs => prevFairs.map(f => f.id === fairId ? { ...f, is_registered: true } : f));
    } catch (error) {
      addToast({ title: 'Error', description: 'Failed to register for the fair.', variant: 'destructive' });
    }
  };

  const handleUnregister = async () => {
    if (!pendingUnregisterId) return;
    try {
      await careerFairService.unregisterFromFair(pendingUnregisterId);
      addToast({ title: 'Success', description: 'You have unregistered from the fair.' });
      setFairs(prevFairs => prevFairs.map(f => f.id === pendingUnregisterId ? { ...f, is_registered: false } : f));
    } catch (error) {
      addToast({ title: 'Error', description: 'Failed to unregister from the fair.', variant: 'destructive' });
    } finally {
      setShowUnregisterModal(false);
      setPendingUnregisterId(null);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
            <p className="text-lg text-gray-600 font-medium">Loading career fairs...</p>
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
            <h2 className="text-xl font-semibold text-red-700 mb-2">Failed to Load Fairs</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchFairs} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700">
              Try Again
            </Button>
          </div>
        </div>
      );
    }
    if (fairs.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-6">
            <Building className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Career Fairs Found</h3>
          <p className="text-gray-500">No upcoming career fairs match your search criteria.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {fairs.map((fair, index) => (
          <motion.div
            key={fair.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden">
              {/* Enhanced Header with Image */}
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
                {/* Registration Status Badge */}
                <div className="absolute top-4 right-4">
                  {fair.is_registered ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Registered
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      <Plus className="h-4 w-4 mr-1" />
                      Available
                    </span>
                  )}
                </div>
              </div>

              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">{fair.title}</CardTitle>
                <div className="flex items-center text-gray-600 mt-2">
                  <Building className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm font-medium">{fair.university_name}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col justify-between pb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium">
                        {new Date(fair.start_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      {fair.start_date !== fair.end_date && (
                        <>
                          <span className="mx-1">-</span>
                          <span className="font-medium">
                            {new Date(fair.end_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm line-clamp-1">{fair.location}</span>
                  </div>

                  {fair.expected_attendees && (
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                      <span className="text-sm">
                        <span className="font-medium">{fair.expected_attendees}</span> expected attendees
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Button 
                    onClick={() => {
                      if (fair.is_registered) {
                        setPendingUnregisterId(fair.id);
                        setShowUnregisterModal(true);
                      } else {
                        handleRegister(fair.id);
                      }
                    }}
                    className={`w-full py-3 font-semibold transition-all duration-200 ${
                      fair.is_registered 
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {fair.is_registered ? 'Unregister' : 'Register Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        <ConfirmationModal
          isOpen={showUnregisterModal}
          onClose={() => setShowUnregisterModal(false)}
          title="Unregister from Career Fair"
          description="Are you sure you want to unregister from this fair? This action cannot be undone."
          onConfirm={handleUnregister}
          confirmText="Unregister"
          confirmVariant="destructive"
        />
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Removed Back to Fair Management button as this is a standalone page */}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Discover Career Fairs
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Find and register for upcoming career fairs to expand your company's reach.
            </p>
          </div>
        </motion.header>
        
        {/* Enhanced Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by fair name, university, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-3 text-base border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {fairs.length > 0 ? `${fairs.length} career fair${fairs.length !== 1 ? 's' : ''} found` : 'Searching...'}
            </p>
          </div>
        </motion.div>

        {renderContent()}
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 
 
 