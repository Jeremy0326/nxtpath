import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, Calendar, Users, FileText, TrendingUp, 
  Plus, BarChart3, Clock, MapPin, Settings, Search, Filter
} from 'lucide-react';
import { universityService, CareerFair } from '../../services/universityService';
import { useToast } from '../../hooks/useToast';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Link } from 'react-router-dom';

export function CareerFairOversight() {
  const [careerFairs, setCareerFairs] = useState<CareerFair[]>([]);
  const [filteredFairs, setFilteredFairs] = useState<CareerFair[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
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

  // Filter career fairs based on search term and status
  useEffect(() => {
    let filtered = careerFairs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(fair =>
        (fair.title || fair.name).toLowerCase().includes(searchTerm.toLowerCase())
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
      // TODO: Implement real API call
      // await universityService.createCareerFair(newFair);
      addToast({
        title: 'Success',
        description: 'Career fair created successfully!',
        variant: 'default'
      });
      setShowCreateModal(false);
      setNewFair({ name: '', date: '', location: '' });
      loadCareerFairs();
    } catch (err) {
      setCreateError('Failed to create career fair.');
      addToast({
        title: 'Error',
        description: 'Failed to create career fair.',
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

      {/* Create Fair Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg mx-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Career Fair</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <p className="text-red-600 text-sm">{createError}</p>
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
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFair}
                disabled={creating || !newFair.name || !newFair.date || !newFair.location}
                className="bg-indigo-600 hover:bg-indigo-700"
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
          </div>
        </div>
      </Dialog>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search career fairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredFairs.length} of {careerFairs.length} career fairs
        </div>
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
            <Button variant="outline" size="sm" onClick={() => {}}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFairs.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {careerFairs.length === 0 ? 'No career fairs yet' : 'No matching career fairs found'}
              </h3>
              <p className="text-gray-600">
                {careerFairs.length === 0 
                  ? 'Create your first career fair to get started using the button above.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFairs.map((fair) => (
                <div key={fair.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{fair.title || fair.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm">{formatDate(fair.date)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{'location' in fair && (fair as any).location ? (fair as any).location : 'University Campus'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(fair.status)}
                          <Button
                            size="sm"
                            variant="outline"
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
                        <Link to={`/university/fairs/${fair.id}/manage`} className="flex items-center px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                          <Settings className="h-4 w-4 mr-2"/>
                          Manage Fair
                        </Link>
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