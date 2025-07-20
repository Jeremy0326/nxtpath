import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, TrendingUp, DollarSign, Building, 
  GraduationCap, Target, Calendar, AlertCircle,
  BarChart3, Star, TrendingDown, Activity,
  CheckCircle, XCircle, Clock, Award
} from 'lucide-react';
import { universityService } from '../../services/universityService';
import { useToast } from '../../hooks/useToast';

// Utility function to truncate text with ellipsis
function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
}

export function UniversityDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await universityService.getDashboardStats();
      console.log('Dashboard stats received:', data);
      console.log('Skill gaps data:', data.skillGaps);
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setError('Failed to load dashboard statistics');
      addToast({
        title: 'Error',
        description: 'Failed to load dashboard statistics. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where no university profile exists
  if (stats && !stats.hasProfile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">University Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome to your university dashboard</p>
            </div>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-orange-800">Complete Your Profile</h3>
                    <p className="text-orange-700 mt-1">
                      {stats.message || 'Please complete your university staff profile to view dashboard statistics.'}
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/university/profile'} 
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Complete Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where stats is null or empty
  if (!stats || error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">University Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome to your university dashboard</p>
            </div>
            
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {error ? 'Unable to Load Dashboard' : 'No Data Available'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {error || 'Please check your university profile setup.'}
                </p>
                <Button onClick={fetchStats} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900">University Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your university's performance and statistics</p>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Students</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalGraduates || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">Active students</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Employment Rate</p>
                  <p className="text-2xl font-bold text-green-900">{stats.employmentRate || 0}%</p>
                  <p className="text-xs text-green-600 mt-1">Graduates employed</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Average Salary</p>
                  <p className="text-2xl font-bold text-purple-900">
                    RM {(stats.averageSalary || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Based on job offers</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Partner Companies</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.partnerCompanies || 0}</p>
                  <p className="text-xs text-orange-600 mt-1">Active partnerships</p>
                </div>
                <Building className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employment Trends */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Employment Trends (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.employmentTrend && stats.employmentTrend.length > 0 ? (
                <div className="space-y-6">
                  {/* Graph Visualization */}
                  <div className="h-40 flex items-end justify-between gap-2">
                    {stats.employmentTrend.map((trend: any, index: number) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-indigo-100 rounded-t transition-all duration-300"
                          style={{ 
                            height: `${Math.max(10, (trend.rate / 100) * 140)}px`,
                            backgroundColor: trend.rate > 0 ? '#4f46e5' : '#e5e7eb'
                          }}
                        />
                        <p className="text-xs font-medium text-gray-600 mt-2">{trend.month}</p>
                        <p className="text-sm font-bold text-indigo-600">{trend.rate}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No employment trend data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Companies */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-600" />
                Top Companies by Hires
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topEmployers && stats.topEmployers.length > 0 ? (
                <div className="space-y-4">
                  {stats.topEmployers.map((company: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{company.name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>{company.hires || 0} hired</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-blue-600">
                            <Clock className="h-4 w-4" />
                            <span>{company.interviewed || 0} interviewed</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-red-600">
                            <XCircle className="h-4 w-4" />
                            <span>{company.rejected || 0} rejected</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {company.totalApplications || 0} total
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No company hiring data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skill Gaps Analysis */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              Top 6 Skill Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.skillGaps && stats.skillGaps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.skillGaps.slice(0, 6).map((skill: any, index: number) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700" title={skill.skill}>{truncateText(skill.skill, 32)}</span>
                      <span className="text-sm text-red-500 font-medium">{skill.gap}% gap</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-red-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${skill.gap}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{skill.demand}% have this skill</span>
                      <span>{skill.students_with_skill || 0}/{skill.total_students || 0} students</span>
                    </div>
                    {skill.job_demand && (
                      <div className="text-xs text-blue-600 font-medium">
                        Required by {skill.job_demand} job{skill.job_demand > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No skill gap data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Insights */}
        <div className={`grid gap-6 ${stats.performanceMetrics && Object.keys(stats.performanceMetrics).length > 0 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
          {/* Application Status */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-indigo-600" />
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Applied</span>
                  <Badge variant="secondary">
                    {stats.totalApplied || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Interviewed</span>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    {stats.totalInterviewed || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Offered</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {stats.totalOffered || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rejected</span>
                  <Badge variant="destructive">
                    {stats.totalRejected || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-indigo-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">New job applications</span>
                  <span className="ml-auto font-medium">{stats.recentApplications || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">New companies joined</span>
                  <span className="ml-auto font-medium">{stats.recentCompanies || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Career fairs this month</span>
                  <span className="ml-auto font-medium">{stats.recentCareerFairs || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics - Only show if we have data */}
          {stats.performanceMetrics && Object.keys(stats.performanceMetrics).length > 0 && (
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.performanceMetrics.interviewSuccessRate !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Interview Success Rate</span>
                      <span className="text-sm font-medium text-green-600">
                        {stats.performanceMetrics.interviewSuccessRate}%
                      </span>
                    </div>
                  )}
                  {stats.performanceMetrics.avgResponseTime !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Response Time</span>
                      <span className="text-sm font-medium text-blue-600">
                        {stats.performanceMetrics.avgResponseTime} days
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}