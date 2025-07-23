import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calendar, MapPin, Users, Building2, Search, 
  ExternalLink, Heart, BookOpen
} from 'lucide-react';
import { CareerFair, StudentInterest } from '../../services/universityService';
import { studentService } from '../../services/studentService';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';

export function StudentCareerFairs() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [fairs, setFairs] = useState<CareerFair[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [interests, setInterests] = useState<Record<string, StudentInterest[]>>({});

  useEffect(() => {
    loadCareerFairs();
  }, []);
  const loadCareerFairs = async () => {
    try {
      const fairsData = await studentService.getCareerFairs();
      setFairs(fairsData);
      
      // Load interests for each fair
      const interestsData = await studentService.getAllMyInterests();
      setInterests(interestsData);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load career fairs.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFairs = fairs.filter(fair =>
    fair.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fair.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fair.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'active':
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date TBD';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
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
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Fairs</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover exciting career opportunities and connect with top employers at upcoming career fairs.
            </p>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-6">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search career fairs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Career Fairs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFairs.map((fair) => (
              <motion.div
                key={fair.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
              >                <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col">
                  {fair.bannerImageUrl && (
                    <div className="h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={fair.bannerImageUrl}
                        alt={fair.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
                        {fair.title}
                      </CardTitle>
                      <Badge className={getStatusColor(fair.status)}>
                        {fair.status || 'Unknown'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col space-y-4">                    <p className="text-gray-600 line-clamp-3">
                      {fair.description}
                    </p>

                    <div className="space-y-2 flex-1">
                      {fair.startDate && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(fair.startDate)}
                        </div>
                      )}
                      
                      {fair.location && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-2" />
                          {fair.location}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <Building2 className="h-4 w-4 mr-1" />
                          {fair.registeredEmployers || 0} Companies
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {fair.registeredStudents || 0} Students
                        </div>
                      </div>

                      {interests[fair.id] && interests[fair.id].length > 0 && (
                        <div className="flex items-center text-sm text-pink-600">
                          <Heart className="h-4 w-4 mr-1 fill-current" />
                          {interests[fair.id].length} Interest{interests[fair.id].length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 mt-auto"><Button
                        onClick={() => navigate(`/student/career-fairs/${fair.id}`)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      
                      {fair.website && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(fair.website, '_blank')}
                          className="px-3"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredFairs.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchQuery ? 'No career fairs found' : 'No career fairs available'}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Check back later for upcoming career fair opportunities'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
