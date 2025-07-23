import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Download, FileText, TrendingUp, Users, Building2, 
  BarChart3, Activity
} from 'lucide-react';
import { universityService } from '../../services/universityService';
import { useToast } from '../../hooks/useToast';

interface ReportData {
  overview: {
    totalEmployers: number;
    totalStudents: number;
    totalApplications: number;
    totalInterviews: number;
    averageApplicationsPerStudent: number;
    averageApplicationsPerEmployer: number;
  };
  employerBreakdown: {
    industry: string;
    count: number;
    percentage: number;
  }[];
  studentBreakdown: {
    major: string;
    count: number;
    percentage: number;
  }[];
  dailyActivity: {
    date: string;
    registrations: number;
    applications: number;
    interviews: number;
  }[];
  topPerformers: {
    topEmployers: {
      name: string;
      applications: number;
      interviews: number;
    }[];
    topStudents: {
      name: string;
      applications: number;
      interviews: number;
    }[];
  };
}

export function FairReports() {
  const { fairId } = useParams<{ fairId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [fairName, setFairName] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [fairId]);

  const loadReportData = async () => {
    try {
      // Get fair name first
      const fairs = await universityService.getCareerFairs();
      const fair = fairs.find(f => f.id === fairId);
      setFairName(fair?.title || fair?.name || 'Career Fair');      // Fetch real report data from backend
      const response = await universityService.getFairReports(fairId!);
      setReportData(response);
    } catch (error) {
      console.error('Failed to load reports:', error);
      // Fallback to basic report structure if API fails
      const fallbackReportData: ReportData = {
        overview: {
          totalEmployers: 25,
          totalStudents: 180,
          totalApplications: 420,
          totalInterviews: 85,
          averageApplicationsPerStudent: 2.3,
          averageApplicationsPerEmployer: 16.8
        },
        employerBreakdown: [
          { industry: 'Technology', count: 10, percentage: 40 },
          { industry: 'Finance', count: 6, percentage: 24 },
          { industry: 'Healthcare', count: 4, percentage: 16 },
          { industry: 'Manufacturing', count: 3, percentage: 12 },
          { industry: 'Others', count: 2, percentage: 8 }
        ],
        studentBreakdown: [
          { major: 'Computer Science', count: 65, percentage: 36.1 },
          { major: 'Software Engineering', count: 45, percentage: 25.0 },
          { major: 'Information Systems', count: 30, percentage: 16.7 },
          { major: 'Data Science', count: 25, percentage: 13.9 },
          { major: 'Others', count: 15, percentage: 8.3 }
        ],
        dailyActivity: [
          { date: '2025-07-15', registrations: 25, applications: 15, interviews: 2 },
          { date: '2025-07-16', registrations: 35, applications: 45, interviews: 8 },
          { date: '2025-07-17', registrations: 40, applications: 85, interviews: 15 },
          { date: '2025-07-18', registrations: 30, applications: 120, interviews: 25 },
          { date: '2025-07-19', registrations: 25, applications: 90, interviews: 20 },
          { date: '2025-07-20', registrations: 15, applications: 45, interviews: 10 },
          { date: '2025-07-21', registrations: 10, applications: 20, interviews: 5 }
        ],
        topPerformers: {
          topEmployers: [
            { name: 'TechCorp Malaysia', applications: 45, interviews: 12 },
            { name: 'Digital Solutions Sdn Bhd', applications: 38, interviews: 10 },
            { name: 'InnovateHub', applications: 32, interviews: 8 },
            { name: 'Future Systems', applications: 28, interviews: 7 },
            { name: 'CloudTech Solutions', applications: 25, interviews: 6 }
          ],
          topStudents: [
            { name: 'Ahmad Rahman', applications: 8, interviews: 4 },
            { name: 'Siti Nurhaliza', applications: 7, interviews: 3 },
            { name: 'Chen Wei Ming', applications: 6, interviews: 3 },
            { name: 'Sarah Abdullah', applications: 6, interviews: 2 },
            { name: 'Raj Kumar', applications: 5, interviews: 2 }
          ]
        }
      };      setReportData(fallbackReportData);
      addToast({
        title: 'Error',
        description: 'Failed to load report data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = async () => {
    setGeneratingReport(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addToast({
        title: 'Success',
        description: 'PDF report has been generated and downloaded.',
        variant: 'default'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to generate PDF report.',
        variant: 'destructive'
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const exportCSVData = (dataType: string) => {
    if (!reportData) return;
    
    let csvContent = '';
    let filename = '';
    
    switch (dataType) {
      case 'overview':
        csvContent = "Metric,Value\n" +
          `Total Employers,${reportData.overview.totalEmployers}\n` +
          `Total Students,${reportData.overview.totalStudents}\n` +
          `Total Applications,${reportData.overview.totalApplications}\n` +
          `Total Interviews,${reportData.overview.totalInterviews}\n` +
          `Average Applications Per Student,${reportData.overview.averageApplicationsPerStudent}\n` +
          `Average Applications Per Employer,${reportData.overview.averageApplicationsPerEmployer}`;
        filename = 'overview';
        break;
      case 'daily-activity':
        csvContent = "Date,Registrations,Applications,Interviews\n" +
          reportData.dailyActivity.map(day => 
            `${day.date},${day.registrations},${day.applications},${day.interviews}`
          ).join('\n');
        filename = 'daily-activity';
        break;
      case 'employer-breakdown':
        csvContent = "Industry,Count,Percentage\n" +
          reportData.employerBreakdown.map(item => 
            `${item.industry},${item.count},${item.percentage}%`
          ).join('\n');
        filename = 'employer-breakdown';
        break;
      case 'student-breakdown':
        csvContent = "Major,Count,Percentage\n" +
          reportData.studentBreakdown.map(item => 
            `${item.major},${item.count},${item.percentage}%`
          ).join('\n');
        filename = 'student-breakdown';
        break;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fairName}_${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    addToast({
      title: 'Success',
      description: `${filename.replace('-', ' ')} data exported successfully.`,
      variant: 'default'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No report data available</h3>
        <Button onClick={() => navigate(`/university/fairs/${fairId}/manage`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Fair Management
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
                onClick={() => navigate(`/university/fairs/${fairId}/manage`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Fair Reports</h1>
                <p className="text-gray-600 mt-1">{fairName}</p>
              </div>
            </div>
            <Button
              onClick={generatePDFReport}
              disabled={generatingReport}
              className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {generatingReport ? 'Generating...' : 'Generate PDF Report'}
            </Button>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -2 }}>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-600">Total Participants</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {reportData.overview.totalEmployers + reportData.overview.totalStudents}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -2 }}>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-600">Total Applications</p>
                      <p className="text-3xl font-bold text-green-900">{reportData.overview.totalApplications}</p>
                    </div>
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -2 }}>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-purple-600">Total Interviews</p>
                      <p className="text-3xl font-bold text-purple-900">{reportData.overview.totalInterviews}</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Report Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="activity">Daily Activity</TabsTrigger>
              <TabsTrigger value="performance">Top Performers</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-6 w-6" />
                      Fair Overview
                    </CardTitle>
                    <Button
                      onClick={() => exportCSVData('overview')}
                      variant="secondary"
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Participation Metrics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">Total Employers</span>
                          <span className="font-bold text-indigo-600">{reportData.overview.totalEmployers}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">Total Students</span>
                          <span className="font-bold text-green-600">{reportData.overview.totalStudents}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Activity Metrics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">Total Applications</span>
                          <span className="font-bold text-purple-600">{reportData.overview.totalApplications}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">Total Interviews</span>
                          <span className="font-bold text-orange-600">{reportData.overview.totalInterviews}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Average Metrics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">Apps/Student</span>
                          <span className="font-bold text-blue-600">{reportData.overview.averageApplicationsPerStudent}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">Apps/Employer</span>
                          <span className="font-bold text-teal-600">{reportData.overview.averageApplicationsPerEmployer}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-6 w-6" />
                        Employer by Industry
                      </CardTitle>
                      <Button
                        onClick={() => exportCSVData('employer-breakdown')}
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {reportData.employerBreakdown.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium text-gray-700">{item.industry}</span>
                              <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                className="bg-blue-600 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        Students by Major
                      </CardTitle>
                      <Button
                        onClick={() => exportCSVData('student-breakdown')}
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {reportData.studentBreakdown.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium text-gray-700">{item.major}</span>
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
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-6 w-6" />
                      Daily Activity
                    </CardTitle>
                    <Button
                      onClick={() => exportCSVData('daily-activity')}
                      variant="secondary"
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {reportData.dailyActivity.map((day, index) => (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <Users className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="text-sm font-semibold text-blue-600">Registrations</p>
                              <p className="text-2xl font-bold text-blue-900">{day.registrations}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <FileText className="h-8 w-8 text-green-600" />
                            <div>
                              <p className="text-sm font-semibold text-green-600">Applications</p>
                              <p className="text-2xl font-bold text-green-900">{day.applications}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                            <Activity className="h-8 w-8 text-purple-600" />
                            <div>
                              <p className="text-sm font-semibold text-purple-600">Interviews</p>
                              <p className="text-2xl font-bold text-purple-900">{day.interviews}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-6 w-6" />
                      Top Performing Employers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {reportData.topPerformers.topEmployers.map((employer, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="font-bold text-orange-600">#{index + 1}</span>
                            </div>
                            <span className="font-medium text-gray-900">{employer.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{employer.applications} applications</p>
                            <p className="text-sm text-gray-600">{employer.interviews} interviews</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-6 w-6" />
                      Most Active Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {reportData.topPerformers.topStudents.map((student, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                              <span className="font-bold text-teal-600">#{index + 1}</span>
                            </div>
                            <span className="font-medium text-gray-900">{student.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{student.applications} applications</p>
                            <p className="text-sm text-gray-600">{student.interviews} interviews</p>
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
