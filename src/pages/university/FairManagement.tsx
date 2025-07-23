import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Settings, Users, Building2, MapPin, Calendar, Clock,
  Edit3, Save, X, Eye, Download, Heart
} from 'lucide-react';
import { universityService, FairDetails } from '../../services/universityService';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

export function FairManagement() {
  const { fairId } = useParams<{ fairId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [fair, setFair] = useState<FairDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedFair, setEditedFair] = useState<Partial<FairDetails>>({});

  useEffect(() => {
    if (fairId) {
      loadFairDetails();
    }
  }, [fairId]);
  const loadFairDetails = async () => {
    try {
      // Try to get detailed fair info from the career fair API
      const fairData = await universityService.getCareerFairDetails(fairId!);
      setFair(fairData);
      setEditedFair(fairData);
    } catch (error) {
      // Fallback to the basic career fairs list
      try {
        const fairs = await universityService.getCareerFairs();
        const fairData = fairs.find(f => f.id === fairId);
        
        if (fairData) {
          // Enhance with additional fields for editing
          const enhancedFair: FairDetails = {
            ...fairData,
            description: fairData.description || `Career fair organized by the university`,
            location: fairData.location || 'University Main Campus',
            website: fairData.website || '',
            bannerImageUrl: fairData.bannerImageUrl || '',
            startDate: fairData.startDate || fairData.date,
            endDate: fairData.endDate || fairData.date,
            isActive: fairData.isActive ?? (fairData.status !== 'completed')
          };
          setFair(enhancedFair);
          setEditedFair(enhancedFair);
        } else {
          addToast({
            title: 'Error',
            description: 'Career fair not found.',
            variant: 'destructive'
          });
          navigate('/university/career-fair');
        }
      } catch (fallbackError) {
        addToast({
          title: 'Error',
          description: 'Failed to load career fair details.',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      if (fair && editedFair) {
        const updatedFair = await universityService.updateCareerFair(fair.id, editedFair);
        setFair(updatedFair);
      }
      
      setEditing(false);
      addToast({
        title: 'Success',
        description: 'Career fair updated successfully!',
        variant: 'default'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to update career fair.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedFair(fair || {});
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading fair details...</p>
        </div>
      </div>
    );
  }

  if (!fair) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Career fair not found</h3>
        <Button onClick={() => navigate('/university/career-fair')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
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
                onClick={() => navigate('/university/career-fair')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{fair.name}</h1>
                <p className="text-gray-600 mt-1">Manage career fair details and settings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!editing ? (
                <Button onClick={() => setEditing(true)} className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit Details
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Fair Overview */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Fair Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fair Name
                    </label>
                    {editing ? (
                      <Input
                        value={editedFair.name || ''}
                        onChange={(e) => setEditedFair(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter fair name"
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-900">{fair.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    {editing ? (
                      <Textarea
                        value={editedFair.description || ''}
                        onChange={(e) => setEditedFair(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter fair description"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-700">{fair.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Date
                      </label>
                      {editing ? (
                        <Input
                          type="date"
                          value={editedFair.startDate || ''}
                          onChange={(e) => setEditedFair(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="h-4 w-4" />
                          {new Date(fair.startDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Date
                      </label>
                      {editing ? (
                        <Input
                          type="date"
                          value={editedFair.endDate || ''}
                          onChange={(e) => setEditedFair(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="h-4 w-4" />
                          {new Date(fair.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location
                    </label>
                    {editing ? (
                      <Input
                        value={editedFair.location || ''}
                        onChange={(e) => setEditedFair(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter venue location"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-4 w-4" />
                        {fair.location}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Website (Optional)
                    </label>
                    {editing ? (
                      <Input
                        type="url"
                        value={editedFair.website || ''}
                        onChange={(e) => setEditedFair(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://example.com"
                      />
                    ) : (
                      <p className="text-gray-700">{fair.website || 'Not set'}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Status</span>
                    <Badge 
                      className={
                        fair.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        fair.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {fair.status.charAt(0).toUpperCase() + fair.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -2 }}>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-600">Registered Employers</p>
                      <p className="text-3xl font-bold text-blue-900">{fair.registeredEmployers}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -2 }}>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-600">Registered Students</p>
                      <p className="text-3xl font-bold text-green-900">{fair.registeredStudents}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -2 }}>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-orange-600">Total Applications</p>
                      <p className="text-3xl font-bold text-orange-900">{fair.totalApplications}</p>
                    </div>
                    <Eye className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Management Actions */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Button
                  onClick={() => navigate(`/university/fairs/${fairId}/registrations`)}
                  className="flex items-center justify-center gap-2 h-16 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Users className="h-5 w-5" />
                  Manage Registrations
                </Button>
                
                <Button
                  onClick={() => navigate(`/university/fairs/${fairId}/interests`)}
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-16 border-gray-300 hover:bg-gray-50"
                >
                  <Heart className="h-5 w-5" />
                  Student Interests
                </Button>
                
                <Button
                  onClick={() => navigate(`/university/fairs/${fairId}/reports`)}
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-16 border-gray-300 hover:bg-gray-50"
                >
                  <Download className="h-5 w-5" />
                  View Reports
                </Button>
                
                <Button
                  onClick={() => navigate(`/university/fairs/${fairId}/analytics`)}
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-16 border-gray-300 hover:bg-gray-50"
                >
                  <Eye className="h-5 w-5" />
                  Analytics
                </Button>
                  <Button
                  onClick={() => navigate(`/university/fairs/${fairId}/booths`)}
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-16 border-gray-300 hover:bg-gray-50"
                >
                  <Building2 className="h-5 w-5" />
                  Manage Booths
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
