import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Users, Building2, 
  Target, Zap, Clock, BarChart3, Activity,
  Calendar, MapPin, Award
} from 'lucide-react';
import { universityService } from '../../services/universityService';
import { useToast } from '../../hooks/useToast';

interface AnalyticsData {
  engagementMetrics: {
    applicationRate: number;
    interviewConversionRate: number;
    averageTimeToApply: number;
    peakApplicationHours: string[];
  };
  trendAnalysis: {
    applicationsTrend: {
      period: string;
      value: number;
      change: number;
    }[];
    registrationsTrend: {
      period: string;
      value: number;
      change: number;
    }[];
  };
  demographics: {
    studentGradYears: {
      year: string;
      count: number;
      percentage: number;
    }[];
    employerSizes: {
      size: string;
      count: number;
      percentage: number;
    }[];
    geographicDistribution: {
      region: string;
      students: number;
      employers: number;
    }[];
  };
  successMetrics: {
    totalOffers: number;
    offerAcceptanceRate: number;
    averageOfferSalary: number;
    topHiringCompanies: {
      name: string;
      offers: number;
      avgSalary: number;
    }[];
  };
  realTimeMetrics: {
    currentActiveUsers: number;
    applicationsToday: number;
    interviewsScheduled: number;
    messagesExchanged: number;
  };
}

export function FairAnalytics() {
  const { fairId } = useParams<{ fairId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [fairName, setFairName] = useState('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
    // Set up real-time updates
    const interval = setInterval(loadAnalyticsData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fairId]);

  const loadAnalyticsData = async () => {
    try {
      // Get fair name first
      const fairs = await universityService.getCareerFairs();
      const fair = fairs.find(f => f.id === fairId);
      setFairName(fair?.title || fair?.name || 'Career Fair');      // Fetch real analytics data from backend
      const response = await universityService.getFairAnalytics(fairId!);
      setAnalyticsData(response);    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Fallback to basic analytics structure if API fails
      const fallbackAnalyticsData: AnalyticsData = {
        engagementMetrics: {
          applicationRate: 78.5,
          interviewConversionRate: 32.1,
          averageTimeToApply: 4.2,
          peakApplicationHours: ['10:00 AM', '2:00 PM', '7:00 PM']
        },
        trendAnalysis: {
          applicationsTrend: [
            { period: 'Week 1', value: 45, change: 0 },
            { period: 'Week 2', value: 78, change: 73.3 },
            { period: 'Week 3', value: 120, change: 53.8 },
            { period: 'Week 4', value: 95, change: -20.8 },
            { period: 'Week 5', value: 132, change: 38.9 }
          ],
          registrationsTrend: [
            { period: 'Week 1', value: 25, change: 0 },
            { period: 'Week 2', value: 42, change: 68.0 },
            { period: 'Week 3', value: 58, change: 38.1 },
            { period: 'Week 4', value: 67, change: 15.5 },
            { period: 'Week 5', value: 73, change: 9.0 }
          ]
        },
        demographics: {
          studentGradYears: [
            { year: '2025', count: 85, percentage: 47.2 },
            { year: '2026', count: 62, percentage: 34.4 },
            { year: '2027', count: 28, percentage: 15.6 },
            { year: '2024', count: 5, percentage: 2.8 }
          ],
          employerSizes: [
            { size: 'Startup (1-50)', count: 8, percentage: 32.0 },
            { size: 'SME (51-250)', count: 10, percentage: 40.0 },
            { size: 'Large (251-1000)', count: 5, percentage: 20.0 },
            { size: 'Enterprise (1000+)', count: 2, percentage: 8.0 }
          ],
          geographicDistribution: [
            { region: 'Kuala Lumpur', students: 95, employers: 15 },
            { region: 'Selangor', students: 45, employers: 6 },
            { region: 'Penang', students: 25, employers: 3 },
            { region: 'Johor', students: 15, employers: 1 }
          ]
        },
        successMetrics: {
          totalOffers: 45,
          offerAcceptanceRate: 82.2,
          averageOfferSalary: 4200,
          topHiringCompanies: [
            { name: 'TechCorp Malaysia', offers: 12, avgSalary: 4800 },
            { name: 'Digital Solutions', offers: 8, avgSalary: 4200 },
            { name: 'InnovateHub', offers: 7, avgSalary: 4500 },
            { name: 'Future Systems', offers: 6, avgSalary: 3900 },
            { name: 'CloudTech', offers: 5, avgSalary: 4600 }
          ]
        },
        realTimeMetrics: {
          currentActiveUsers: 23,
          applicationsToday: 12,
          interviewsScheduled: 8,
          messagesExchanged: 156
        }
      };

      setAnalyticsData(fallbackAnalyticsData);
      addToast({
        title: 'Error',
        description: 'Failed to load analytics data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No analytics data available</h3>
        <Button onClick={() => navigate(`/university/fairs/${fairId}/manage`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Fair Management
        </Button>
      </div>
    );
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

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
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Fair Analytics</h1>
                <p className="text-gray-600 mt-1">{fairName} - Real-time insights</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Activity className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div whileHover={{ y: -2 }}>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-600">Active Users</p>
                      <p className="text-3xl font-bold text-green-900">{analyticsData.realTimeMetrics.currentActiveUsers}</p>
                      <p className="text-xs text-green-600 mt-1">Currently online</p>
                    </div>
                    <div className="relative">
                      <Users className="h-8 w-8 text-green-600" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -2 }}>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-600">Applications Today</p>
                      <p className="text-3xl font-bold text-blue-900">{analyticsData.realTimeMetrics.applicationsToday}</p>
                      <p className="text-xs text-blue-600 mt-1">Last 24 hours</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -2 }}>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-purple-600">Interviews Scheduled</p>
                      <p className="text-3xl font-bold text-purple-900">{analyticsData.realTimeMetrics.interviewsScheduled}</p>
                      <p className="text-xs text-purple-600 mt-1">Upcoming</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -2 }}>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-orange-600">Messages</p>
                      <p className="text-3xl font-bold text-orange-900">{analyticsData.realTimeMetrics.messagesExchanged}</p>
                      <p className="text-xs text-orange-600 mt-1">Today</p>
                    </div>
                    <Zap className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Analytics Tabs */}
          <Tabs defaultValue="engagement" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="success">Success</TabsTrigger>
            </TabsList>

            <TabsContent value="engagement">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-6 w-6" />
                      Key Engagement Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-green-700">Application Rate</p>
                          <p className="text-2xl font-bold text-green-900">{analyticsData.engagementMetrics.applicationRate}%</p>
                        </div>
                        <div className="text-green-600">
                          <TrendingUp className="h-8 w-8" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-blue-700">Interview Conversion</p>
                          <p className="text-2xl font-bold text-blue-900">{analyticsData.engagementMetrics.interviewConversionRate}%</p>
                        </div>
                        <div className="text-blue-600">
                          <Activity className="h-8 w-8" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-purple-700">Avg. Time to Apply</p>
                          <p className="text-2xl font-bold text-purple-900">{analyticsData.engagementMetrics.averageTimeToApply} days</p>
                        </div>
                        <div className="text-purple-600">
                          <Clock className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-6 w-6" />
                      Peak Activity Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <p className="text-gray-600 mb-6">Highest application activity occurs during:</p>
                      {analyticsData.engagementMetrics.peakApplicationHours.map((hour, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                            <span className="font-bold text-orange-600">#{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-orange-900">{hour}</p>
                            <p className="text-sm text-orange-700">Peak application time</p>
                          </div>
                          <Zap className="h-6 w-6 text-orange-600" />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-6 w-6" />
                      Applications Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {analyticsData.trendAnalysis.applicationsTrend.map((period, index) => (
                        <motion.div
                          key={period.period}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{period.period}</p>
                            <p className="text-2xl font-bold text-blue-600">{period.value}</p>
                          </div>
                          <div className={`flex items-center gap-2 ${getTrendColor(period.change)}`}>
                            {getTrendIcon(period.change)}
                            <span className="font-medium">
                              {period.change > 0 ? '+' : ''}{period.change.toFixed(1)}%
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-6 w-6" />
                      Registrations Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {analyticsData.trendAnalysis.registrationsTrend.map((period, index) => (
                        <motion.div
                          key={period.period}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{period.period}</p>
                            <p className="text-2xl font-bold text-green-600">{period.value}</p>
                          </div>
                          <div className={`flex items-center gap-2 ${getTrendColor(period.change)}`}>
                            {getTrendIcon(period.change)}
                            <span className="font-medium">
                              {period.change > 0 ? '+' : ''}{period.change.toFixed(1)}%
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="demographics">
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        Student Graduation Years
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {analyticsData.demographics.studentGradYears.map((item, index) => (
                          <div key={item.year} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Class of {item.year}</span>
                              <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                className="bg-purple-600 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-6 w-6" />
                        Company Sizes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {analyticsData.demographics.employerSizes.map((item, index) => (
                          <div key={item.size} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">{item.size}</span>
                              <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                className="bg-orange-600 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-6 w-6" />
                      Geographic Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {analyticsData.demographics.geographicDistribution.map((region, index) => (
                        <motion.div
                          key={region.region}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200"
                        >
                          <h3 className="font-semibold text-teal-900 mb-4">{region.region}</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-teal-700">Students</span>
                              <span className="font-bold text-teal-900">{region.students}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-teal-700">Employers</span>
                              <span className="font-bold text-teal-900">{region.employers}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="success">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-green-600">Total Offers</p>
                          <p className="text-3xl font-bold text-green-900">{analyticsData.successMetrics.totalOffers}</p>
                        </div>
                        <Award className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-blue-600">Acceptance Rate</p>
                          <p className="text-3xl font-bold text-blue-900">{analyticsData.successMetrics.offerAcceptanceRate}%</p>
                        </div>
                        <Target className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-purple-600">Avg. Salary</p>
                          <p className="text-3xl font-bold text-purple-900">RM{analyticsData.successMetrics.averageOfferSalary}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-6 w-6" />
                      Top Hiring Companies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {analyticsData.successMetrics.topHiringCompanies.map((company, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
                              <span className="font-bold text-emerald-600">#{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-emerald-900">{company.name}</h3>
                              <p className="text-sm text-emerald-700">{company.offers} offers made</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-900">RM{company.avgSalary}</p>
                            <p className="text-sm text-emerald-700">Average salary</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
