import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, Building2, MapPin, Heart, Users, Calendar, 
  ExternalLink, Search, Info, Briefcase, Map, Grid, 
  Globe, DollarSign
} from 'lucide-react';
import { CareerFair, Booth, StudentInterest } from '../../services/universityService';
import { studentService } from '../../services/studentService';
import { useToast } from '../../hooks/useToast';
import api from '../../lib/axios';

export function StudentFairDetails() {
  const { fairId } = useParams<{ fairId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [fair, setFair] = useState<CareerFair | null>(null);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [interests, setInterests] = useState<StudentInterest[]>([]);  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    if (fairId) {
      loadFairData();
    }
  }, [fairId]);
  const loadFairData = async () => {
    try {
      const [fairData, boothsData] = await Promise.all([
        studentService.getCareerFairDetails(fairId!),
        studentService.getFairBooths(fairId!)
      ]);
      
      setFair(fairData);
      setBooths(boothsData);
      
      // Load user interests
      try {
        const interestsData = await studentService.getMyInterests(fairId!);
        setInterests(interestsData);
      } catch (error) {
        // User might not be authenticated, continue without interests
        setInterests([]);
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load career fair details.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };  const handleExpressInterest = async (boothId: string) => {
    try {
      console.log('Expressing interest in booth:', boothId);
      console.log('Fair ID:', fairId);
      const interest = await studentService.expressInterest(fairId!, boothId);
      setInterests(prev => [...prev, interest]);
      addToast({
        title: 'Interest Expressed!',
        description: 'You have successfully expressed interest in this booth.',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Express interest error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to express interest.';
      addToast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };
  const handleRemoveInterest = async (boothId: string) => {
    try {
      console.log('Removing interest from booth:', boothId);
      await studentService.removeInterest(fairId!, boothId);
      setInterests(prev => prev.filter(interest => interest.booth_id !== boothId));
      addToast({
        title: 'Interest Removed',
        description: 'You have removed your interest in this booth.',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Remove interest error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to remove interest.';
      addToast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };
  const isInterested = (boothId: string) => {
    return interests.some(interest => interest.booth_id === boothId);
  };

  const filteredBooths = booths.filter(booth =>
    booth.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booth.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booth.jobs.some(job => job.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDebugBooths = async () => {
    try {
      const response = await api.get(`/career-fairs/fairs/${fairId}/debug_booth_data/`);
      console.log('Debug booth data:', response.data);
      addToast({
        title: 'Debug Info',
        description: `Found ${response.data.booth_count} booths. Check console for details.`,
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Debug error:', error);
      addToast({
        title: 'Debug Error',
        description: 'Failed to get debug info. Check console.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading career fair details...</p>
        </div>
      </div>
    );
  }

  if (!fair) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Career Fair Not Found</h3>
        <p className="text-gray-500 mb-4">The requested career fair could not be found.</p>
        <Button onClick={() => navigate('/student/career-fairs')}>
          Back to Career Fairs
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/student/career-fairs')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Career Fairs
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{fair.title}</h1>
                <p className="text-gray-600 mt-1">Explore opportunities and express your interest</p>
              </div>
            </div>
          </div>

          {/* Fair Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-gray-700">{fair.description}</p>
                  
                  <div className="space-y-2">
                    {fair.startDate && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(fair.startDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      {fair.location}
                    </div>
                    
                    {fair.website && (
                      <div className="flex items-center text-sm text-gray-500">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        <a 
                          href={fair.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                    <Building2 className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{booths.length || 0}</p>
                    <p className="text-sm text-gray-600">Companies</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{fair.registeredStudents || 0}</p>
                    <p className="text-sm text-gray-600">Students</p>
                  </div>
                  
                  <div className="bg-pink-50 p-4 rounded-lg text-center">
                    <Heart className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{interests.length}</p>
                    <p className="text-sm text-gray-600">Your Interests</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <Briefcase className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{booths.reduce((sum, booth) => sum + booth.jobs.length, 0)}</p>
                    <p className="text-sm text-gray-600">Total Jobs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>          {/* Search Bar and View Toggle */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative max-w-md flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search companies or jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                  <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDebugBooths}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Info className="h-4 w-4" />
                    Debug
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    onClick={() => setViewMode('grid')}
                    className="flex items-center gap-2"
                  >
                    <Grid className="h-4 w-4" />
                    Grid View
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'outline'}
                    onClick={() => setViewMode('map')}
                    className="flex items-center gap-2"
                  >
                    <Map className="h-4 w-4" />
                    Floor Map
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>          {/* Booths Grid or Floor Map */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooths.map((booth) => {
                const interested = isInterested(booth.id);
                
                return (
                  <motion.div
                    key={booth.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >                    <Card className={`h-full hover:shadow-xl transition-all duration-300 ${interested ? 'ring-2 ring-pink-200 bg-pink-50' : ''}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={booth.company?.logo || (booth.company as any)?.profile_picture_url || '/placeholder.svg'}
                                alt={booth.company?.name || 'Company'}
                                className="w-12 h-12 object-contain rounded-lg bg-gray-50 border"
                                onError={(e) => { 
                                  e.currentTarget.src = '/placeholder.svg'; 
                                  e.currentTarget.onerror = null; // Prevent infinite loop
                                }}
                              />
                              {interested && (
                                <div className="absolute -top-1 -right-1 bg-pink-500 rounded-full p-1">
                                  <Heart className="h-3 w-3 text-white fill-current" />
                                </div>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg font-bold text-gray-900">
                                {booth.company.name}
                              </CardTitle>
                              {booth.booth_number && (
                                <Badge variant="outline" className="mt-1">
                                  Booth {booth.booth_number}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {interested && (
                            <Heart className="h-5 w-5 text-pink-500 fill-current" />
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4 flex-1">
                        {booth.label && (
                          <p className="text-gray-600 text-sm">{booth.label}</p>
                        )}

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                            Available Positions ({booth.jobs.length})
                          </h4>
                          <div className="space-y-2">
                            {booth.jobs.slice(0, 2).map(job => (                              <div key={job.id} className="text-sm text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-indigo-200">
                                <div className="font-medium">{job.title}</div>
                                {(job as any).job_type && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {(job as any).job_type.replace('_', ' ')} • {(job as any).location || 'Location TBD'}
                                  </div>
                                )}
                              </div>
                            ))}
                            {booth.jobs.length > 2 && (
                              <p className="text-xs text-gray-500 italic">
                                +{booth.jobs.length - 2} more positions
                              </p>
                            )}
                            {booth.jobs.length === 0 && (
                              <p className="text-sm text-gray-500">No positions listed</p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 mt-auto">
                          {interested ? (
                            <Button
                              variant="outline"
                              onClick={() => handleRemoveInterest(booth.id)}
                              className="flex-1 border-pink-300 text-pink-700 hover:bg-pink-50"
                            >
                              <Heart className="h-4 w-4 mr-2 fill-current" />
                              Interested
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleExpressInterest(booth.id)}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <Heart className="h-4 w-4 mr-2" />
                              Express Interest
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            onClick={() => setSelectedBooth(booth)}
                            className="px-3"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Floor Map View */
            <Card>
              <CardContent className="p-6">
                <div className="bg-gray-50 rounded-lg p-8 min-h-[400px] relative">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Floor Map</h3>
                    <p className="text-gray-600">Interactive booth locations</p>
                  </div>
                  
                  <div className="grid grid-cols-8 gap-2 max-w-4xl mx-auto">
                    {Array.from({ length: 64 }, (_, index) => {
                      const booth = filteredBooths.find(b => b.x === (index % 8) + 1 && b.y === Math.floor(index / 8) + 1);
                      const interested = booth ? isInterested(booth.id) : false;
                      
                      return (
                        <div
                          key={index}
                          className={`
                            aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200
                            ${booth ? 
                              interested ? 
                                'bg-pink-100 border-pink-300 text-pink-800 hover:bg-pink-200' :
                                'bg-indigo-100 border-indigo-300 text-indigo-800 hover:bg-indigo-200'
                              : 'bg-gray-100 border-gray-200 text-gray-400'
                            }
                          `}
                          onClick={() => booth && setSelectedBooth(booth)}
                        >
                          {booth && (
                            <>
                              <div className="truncate w-full text-center px-1">
                                {booth.booth_number || `B${index + 1}`}
                              </div>
                              <div className="truncate w-full text-center px-1 text-xs">
                                {booth.company.name.split(' ')[0]}
                              </div>
                              {interested && <Heart className="h-3 w-3 fill-current mt-1" />}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 flex justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-indigo-100 border-2 border-indigo-300 rounded"></div>
                      <span>Available Booth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-pink-100 border-2 border-pink-300 rounded"></div>
                      <span>Interested</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded"></div>
                      <span>Empty</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredBooths.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchQuery ? 'No booths found' : 'No booths available'}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Companies haven\'t registered for booths yet'}
              </p>
            </div>
          )}

          {/* Selected Booth Modal/Details */}
          {selectedBooth && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedBooth(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">                      <img
                        src={selectedBooth.company?.logo || (selectedBooth.company as any)?.profile_picture_url || '/placeholder.svg'}
                        alt={selectedBooth.company?.name || 'Company'}
                        className="w-16 h-16 object-contain rounded-lg bg-gray-50 border"
                        onError={(e) => { 
                          e.currentTarget.src = '/placeholder.svg'; 
                          e.currentTarget.onerror = null;
                        }}
                      />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedBooth.company.name}</h2>
                        {selectedBooth.booth_number && (
                          <Badge variant="outline" className="mt-2">
                            Booth {selectedBooth.booth_number}
                          </Badge>
                        )}                        {(selectedBooth.company as any).industry && (
                          <p className="text-sm text-gray-500 mt-1">{(selectedBooth.company as any).industry}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedBooth(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Company Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Company Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">                          {(selectedBooth.company as any).location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{(selectedBooth.company as any).location}</span>
                            </div>
                          )}
                          {(selectedBooth.company as any).website && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Globe className="h-4 w-4" />
                              <a 
                                href={(selectedBooth.company as any).website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline"
                              >
                                Visit Website
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">                          {(selectedBooth.company as any).size && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>{(selectedBooth.company as any).size}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="h-4 w-4" />
                            <span>Booth {selectedBooth.booth_number || 'TBD'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {selectedBooth.label && (
                        <div className="mt-4">
                          <p className="text-gray-600">{selectedBooth.label}</p>
                        </div>
                      )}
                        {(selectedBooth.company as any).description && (
                        <div className="mt-4">
                          <p className="text-gray-600">{(selectedBooth.company as any).description}</p>
                        </div>
                      )}
                    </div>

                    {/* Job Positions */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Available Positions ({selectedBooth.jobs.length})</h3>
                      <div className="space-y-3">
                        {selectedBooth.jobs.map(job => (
                          <div key={job.id} className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{job.title}</h4>                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  {(job as any).job_type && (
                                    <span className="flex items-center gap-1">
                                      <Briefcase className="h-3 w-3" />
                                      {(job as any).job_type.replace('_', ' ')}
                                    </span>
                                  )}
                                  {(job as any).location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {(job as any).location}
                                    </span>
                                  )}
                                  {((job as any).salary_min && (job as any).salary_max) && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      MYR {(job as any).salary_min.toLocaleString()} - {(job as any).salary_max.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                {(job as any).description && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{(job as any).description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {selectedBooth.jobs.length === 0 && (
                          <p className="text-gray-500 italic text-center py-4">No positions listed</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                      {isInterested(selectedBooth.id) ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            handleRemoveInterest(selectedBooth.id);
                            setSelectedBooth(null);
                          }}
                          className="flex-1 border-pink-300 text-pink-700 hover:bg-pink-50"
                        >
                          <Heart className="h-4 w-4 mr-2 fill-current" />
                          Remove Interest
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            handleExpressInterest(selectedBooth.id);
                            setSelectedBooth(null);
                          }}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Express Interest
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
