import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, Calendar, Users, FileText, TrendingUp, 
  Plus, BarChart3, Clock, MapPin, ExternalLink
} from 'lucide-react';
import { universityService, CareerFair } from '../../services/universityService';
import { useToast } from '../../hooks/useToast';

export default function CareerFairOversight() {
  const [careerFairs, setCareerFairs] = useState<CareerFair[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadCareerFairs();
  }, []);

  const loadCareerFairs = async () => {
    try {
      const data = await universityService.getCareerFairs();
      setCareerFairs(data);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load career fairs data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalCareerFairs: careerFairs.length,
    totalEmployers: careerFairs.reduce((sum, fair) => sum + fair.registeredEmployers, 0),
    totalStudents: careerFairs.reduce((sum, fair) => sum + fair.registeredStudents, 0),
    totalApplications: careerFairs.reduce((sum, fair) => sum + fair.totalApplications, 0)
  };

  const handleCreateCareerFair = () => {
    addToast({
      title: 'Create Career Fair',
      description: 'Career fair creation feature coming soon.',
    });
  };

  const handleViewAnalytics = (fair: CareerFair) => {
    addToast({
      title: 'View Analytics',
      description: `Opening analytics for ${fair.name}`,
    });
  };

  const handleManageDetails = (fair: CareerFair) => {
    addToast({
      title: 'Manage Details',
      description: `Managing details for ${fair.name}`,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      ongoing: { color: 'bg-green-100 text-green-800', icon: TrendingUp },
      completed: { color: 'bg-gray-100 text-gray-800', icon: Calendar }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading career fairs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Career Fair Management</h1>
          <p className="text-gray-600 mt-2">Manage and oversee career fairs for your university</p>
        </div>
        <Button onClick={handleCreateCareerFair} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Career Fair
        </Button>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Career Fairs</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalCareerFairs}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Employers</p>
                <p className="text-2xl font-bold text-green-900">{stats.totalEmployers}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Students</p>
                <p className="text-2xl font-bold text-purple-900">{stats.totalStudents}</p>
                <p className="text-xs text-purple-600 mt-1">+8% from last month</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Total Applications</p>
                <p className="text-2xl font-bold text-orange-900">{stats.totalApplications}</p>
                <p className="text-xs text-orange-600 mt-1">+15% from last month</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Fairs Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-indigo-600" />
              Career Fairs
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleViewAnalytics({} as CareerFair)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {careerFairs.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No career fairs yet</h3>
              <p className="text-gray-600">Create your first career fair to get started using the button above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {careerFairs.map((fair) => (
                <div key={fair.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{fair.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm">{formatDate(fair.date)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">University Campus</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(fair.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewAnalytics(fair)}
                            className="flex items-center gap-1"
                          >
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-600">Employers:</span>
                            <span className="text-sm font-medium ml-1">{fair.registeredEmployers}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-600">Students:</span>
                            <span className="text-sm font-medium ml-1">{fair.registeredStudents}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-600">Applications:</span>
                            <span className="text-sm font-medium ml-1">{fair.totalApplications}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleManageDetails(fair)}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Manage Details
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Manage Registrations
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4" />
                          Reports
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}