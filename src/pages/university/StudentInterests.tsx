import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, Users, Building2, Heart, Mail, Download, 
  Search, Calendar, TrendingUp
} from 'lucide-react';
import { universityService, StudentInterest, FairDetails } from '../../services/universityService';
import { useToast } from '../../hooks/useToast';

export function StudentInterests() {
  const { fairId } = useParams<{ fairId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [fair, setFair] = useState<FairDetails | null>(null);
  const [interests, setInterests] = useState<StudentInterest[]>([]);
  const [loading, setLoading] = useState(true);  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (fairId) {
      loadData();
    }
  }, [fairId]);

  const loadData = async () => {
    try {
      const [fairData, interestsData] = await Promise.all([
        universityService.getCareerFairDetails(fairId!),
        universityService.getBoothInterests(fairId!)
      ]);
      
      setFair(fairData);
      setInterests(interestsData);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load student interests data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportInterests = () => {
    const csvContent = 'Student Name,Student Email,Company,Booth Number,Interest Date\n' +
      filteredInterests.map(interest => 
        `"${interest.student.first_name} ${interest.student.last_name}","${interest.student.email}","${interest.company_name}","${interest.booth_number || 'N/A'}","${new Date(interest.timestamp).toLocaleDateString()}"`
      ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `student-interests-${fair?.title?.replace(/\s+/g, '-').toLowerCase()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const filteredInterests = interests.filter(interest => {
    const matchesSearch = 
      (interest.student?.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (interest.student?.last_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (interest.student?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (interest.company_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const getInterestStats = () => {
    const companyStats = interests.reduce((acc, interest) => {
      const company = interest.company_name;
      if (!acc[company]) {
        acc[company] = 0;
      }
      acc[company]++;
      return acc;
    }, {} as Record<string, number>);

    const topCompanies = Object.entries(companyStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalInterests: interests.length,
      totalStudents: new Set(interests.map(i => i.student.email)).size,
      totalCompanies: Object.keys(companyStats).length,
      topCompanies
    };
  };

  const stats = getInterestStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading student interests...</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/university/fairs/${fairId}/manage`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Fair Management
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Interests</h1>
                <p className="text-gray-600 mt-1">{fair?.title} - Track student engagement</p>
              </div>
            </div>
            <Button
              onClick={exportInterests}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Heart className="h-8 w-8 text-pink-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Interests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalInterests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Engaged Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Companies with Interest</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Interest/Student</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalStudents ? (stats.totalInterests / stats.totalStudents).toFixed(1) : '0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Interests List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Student Interests ({filteredInterests.length})
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search students or companies..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredInterests.map((interest) => (
                      <motion.div
                        key={interest.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {interest.student.first_name.charAt(0)}{interest.student.last_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {interest.student.first_name} {interest.student.last_name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">{interest.student.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-medium text-gray-900">{interest.company_name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {interest.booth_number && (
                              <Badge variant="outline" className="text-xs">
                                Booth {interest.booth_number}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(interest.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {filteredInterests.length === 0 && (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          {searchQuery ? 'No interests match your search' : 'No student interests recorded yet'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Companies Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Companies by Interest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topCompanies.map(([company, count], index) => (
                      <div key={company} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium flex items-center justify-center mr-3">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900 truncate">{company}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                    
                    {stats.topCompanies.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No companies have received interest yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Most Popular Company</span>
                      <span className="font-medium">
                        {stats.topCompanies[0]?.[0] || 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Highest Interest Count</span>
                      <span className="font-medium">
                        {stats.topCompanies[0]?.[1] || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engagement Rate</span>
                      <span className="font-medium">
                        {fair?.registeredStudents ? 
                          `${((stats.totalStudents / fair.registeredStudents) * 100).toFixed(1)}%` : 
                          'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
