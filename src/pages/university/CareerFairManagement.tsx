import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, Calendar, Users, FileText, TrendingUp, 
  Plus, BarChart3, Clock, MapPin, Settings, Search, Filter, X
} from 'lucide-react';
import { universityService, CareerFair } from '../../services/universityService';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/input';

export function CareerFairManagement() {
  const [careerFairs, setCareerFairs] = useState<CareerFair[]>([]);
  const [filteredFairs, setFilteredFairs] = useState<CareerFair[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFair, setNewFair] = useState({ name: '', date: '', location: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadCareerFairs();
  }, []);

  const loadCareerFairs = async () => {
    try {
      const data = await universityService.getCareerFairs();
      setCareerFairs(data);
      setFilteredFairs(data);
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

  const handleManageRegistrations = (fairId: string) => {
    navigate(`/university/fairs/${fairId}/registrations`);
  };

  const handleViewReports = (fairId: string) => {
    navigate(`/university/fairs/${fairId}/reports`);
  };

  const handleViewAnalytics = () => {
    navigate(`/university/fairs/analytics`);
  };

  const handleManageFair = (fairId: string) => {
    navigate(`/university/fairs/${fairId}/manage`);
  };

  // Filter career fairs based on search term and status
  useEffect(() => {
    let filtered = careerFairs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(fair =>
        fair.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(fair => fair.status === statusFilter);
    }

    setFilteredFairs(filtered);
  }, [careerFairs, searchTerm, statusFilter]);

  const stats = {
    totalCareerFairs: careerFairs.length,
    totalEmployers: careerFairs.reduce((sum, fair) => sum + fair.registeredEmployers, 0),
    totalStudents: careerFairs.reduce((sum, fair) => sum + fair.registeredStudents, 0),
    totalApplications: careerFairs.reduce((sum, fair) => sum + fair.totalApplications, 0)
  };

  const handleCreateCareerFair = () => {
    setShowCreateModal(true);
  };

  const handleCreateFair = async () => {
    setCreating(true);
    setCreateError('');
    try {
      const createdFair = await universityService.createCareerFair(newFair);
      addToast({
        title: 'Success',
        description: 'Career fair created successfully!',
        variant: 'default'
      });
      setShowCreateModal(false);
      setNewFair({ name: '', date: '', location: '' });
      // Add the new fair to the list immediately for better UX
      setCareerFairs(prev => [createdFair, ...prev]);
      setFilteredFairs(prev => [createdFair, ...prev]);
    } catch (err: any) {
      console.error('Create career fair error:', err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to create career fair.';
      setCreateError(errorMessage);
      addToast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Career Fair Management</h1>
              <p className="text-gray-600 mt-2">Manage and oversee career fairs for your university</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleViewAnalytics}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
              <Button
                onClick={handleCreateCareerFair}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                Create Career Fair
              </Button>
            </div>
          </div>

          {/* Create Fair Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError('');
                  setNewFair({ name: '', date: '', location: '' });
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Career Fair</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateError('');
                      setNewFair({ name: '', date: '', location: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fair Name *
                    </label>
                    <Input
                      placeholder="Enter career fair name"
                      value={newFair.name}
                      onChange={e => setNewFair(f => ({ ...f, name: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date *
                    </label>
                    <Input
                      type="date"
                      value={newFair.date}
                      onChange={e => setNewFair(f => ({ ...f, date: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location *
                    </label>
                    <Input
                      placeholder="Enter venue location"
                      value={newFair.location}
                      onChange={e => setNewFair(f => ({ ...f, location: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  
                  {createError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm font-medium">{createError}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateError('');
                      setNewFair({ name: '', date: '', location: '' });
                    }}
                    disabled={creating}
                    className="px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateFair}
                    disabled={creating || !newFair.name || !newFair.date || !newFair.location}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2"
                  >
                    {creating ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create Career Fair'
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Search and Filter Bar */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search career fairs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="all">All Status</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Showing {filteredFairs.length} of {careerFairs.length} career fairs
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-600">Total Career Fairs</p>
                      <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalCareerFairs}</p>
                    </div>
                    <div className="bg-blue-200 p-3 rounded-full">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-600">Total Employers</p>
                      <p className="text-3xl font-bold text-green-900 mt-1">{stats.totalEmployers}</p>
                    </div>
                    <div className="bg-green-200 p-3 rounded-full">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-purple-600">Total Students</p>
                      <p className="text-3xl font-bold text-purple-900 mt-1">{stats.totalStudents}</p>
                    </div>
                    <div className="bg-purple-200 p-3 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-orange-600">Total Applications</p>
                      <p className="text-3xl font-bold text-orange-900 mt-1">{stats.totalApplications}</p>
                    </div>
                    <div className="bg-orange-200 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Career Fairs Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building className="h-6 w-6" />
                  Career Fairs
                </CardTitle>
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={handleViewAnalytics}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {filteredFairs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <Building className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {careerFairs.length === 0 ? 'No career fairs yet' : 'No matching career fairs found'}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {careerFairs.length === 0 
                      ? 'Create your first career fair to get started using the button above.'
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredFairs.map((fair, index) => (
                    <motion.div
                      key={fair.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:border-indigo-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{fair.name}</h3>
                              <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-sm font-medium">{formatDate(fair.date)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    {'location' in fair && (fair as any).location ? (fair as any).location : 'University Campus'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(fair.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                              <div className="bg-indigo-100 p-2 rounded-lg">
                                <Users className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Employers</p>
                                <p className="text-lg font-bold text-gray-900">{fair.registeredEmployers}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <Users className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Students</p>
                                <p className="text-lg font-bold text-gray-900">{fair.registeredStudents}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                              <div className="bg-orange-100 p-2 rounded-lg">
                                <FileText className="h-4 w-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Applications</p>
                                <p className="text-lg font-bold text-gray-900">{fair.totalApplications}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <Button
                              size="sm"
                              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                              onClick={() => handleManageFair(fair.id)}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Manage Fair
                            </Button>
                            {fair.registeredEmployers > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                onClick={() => handleManageRegistrations(fair.id)}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Manage Registrations
                              </Button>
                            )}
                            {fair.totalApplications > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                onClick={() => handleViewReports(fair.id)}
                              >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Reports
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}