import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Users, 
  Search,
  BarChart2,
  Star,
  Calendar,
  MessageSquare,
  ChevronRight,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import api from '../../lib/axios';
import { employerService } from '../../services/employerService';
import { useNavigate } from 'react-router-dom';

export function EmployerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [topCandidates, setTopCandidates] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [pipelineStats, setPipelineStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profileRes = await api.get('profile/');
        setProfile(profileRes.data.employer_profile);
        const statsRes = await employerService.getDashboardStats();
        setStats(statsRes);
        const candidatesRes = await employerService.getTopCandidates();
        setTopCandidates(candidatesRes);
        const activityRes = await employerService.getRecentActivity();
        setRecentActivity(activityRes);
        // Fetch hiring pipeline and time to hire
        const pipelineRes = await api.get('/employer/hiring-pipeline-stats/');
        setPipelineStats(pipelineRes.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-lg text-gray-600 font-medium">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please ensure your employer profile is complete and your company has at least one active job post.<br/>
            If the problem persists, contact support or check your backend logs for more details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Employer Dashboard
              </h1>
              <p className="mt-2 text-base text-gray-600">
                Welcome back, {profile?.company_name || 'Employer'}!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Here's what's happening with your hiring process today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200"
                onClick={() => navigate('/employer/settings/profile')}
              >
                <Building className="h-4 w-4 mr-2" />
                View Company Profile
              </button>
              <button
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md"
                onClick={() => navigate('/employer/jobs?create=1')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <EnhancedStatCard
            icon={Briefcase}
            name="Active Job Posts"
            value={stats?.active_job_posts || 0}
            color="blue"
            description="Currently active positions"
            trend={stats?.active_job_posts_trend || 0}
          />
          <EnhancedStatCard
            icon={Users}
            name="Total Applicants"
            value={stats?.total_applicants || 0}
            color="green"
            description="All-time applications"
            trend={stats?.total_applicants_trend || 0}
          />
          <EnhancedStatCard
            icon={Calendar}
            name="Interviews Scheduled"
            value={stats?.interviews_scheduled || 0}
            color="purple"
            description="Upcoming interviews"
            trend={stats?.interviews_scheduled_trend || 0}
          />
          <EnhancedStatCard
            icon={TrendingUp}
            name="New Applicants (Weekly)"
            value={stats?.new_applicants_weekly || 0}
            color="orange"
            description="This week's applications"
            trend={stats?.new_applicants_weekly_trend || 0}
          />
        </motion.div>

        {/* Enhanced Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Top Candidates */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Star className="h-6 w-6 mr-3 text-yellow-500" />
                Top Candidates
              </h2>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {topCandidates.length > 0 ? (
                topCandidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-indigo-100 rounded-full">
                        <Users className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{candidate.role}</p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills?.slice(0, 3).map((skill: string) => (
                            <span
                              key={skill}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills?.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              +{candidate.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                        <Star className="h-4 w-4 mr-1" />
                        {candidate.matchScore}% Match
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                        candidate.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                        candidate.status === 'interviewed' ? 'bg-purple-100 text-purple-800' :
                        candidate.status === 'offered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {candidate.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Top Candidates Yet</h3>
                  <p className="text-gray-500">Start posting jobs to see top matching candidates here.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-8 flex items-center">
              <Clock className="h-6 w-6 mr-3 text-indigo-600" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-3 h-3 rounded-full bg-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.content}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button className="flex-shrink-0 text-gray-400 hover:text-gray-500 transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Hiring Pipeline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-8 flex items-center">
              <BarChart2 className="h-6 w-6 mr-3 text-indigo-600" />
              Hiring Pipeline
            </h2>
            <div className="space-y-6">
              {pipelineStats && pipelineStats.pipeline ? (
                Object.entries(pipelineStats.pipeline).map(([stage, count], index) => {
                  const totalCandidates = Object.values(pipelineStats.pipeline).reduce((sum: number, val: any) => sum + Number(val), 0);
                  const percentage = totalCandidates > 0 ? (Number(count) / totalCandidates) * 100 : 0;
                  
                  return (
                    <motion.div 
                      key={stage}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-900 capitalize">{stage.replace('_', ' ')}</span>
                        <span className="text-gray-600 font-medium">{Number(count)} candidates</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                          className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                        />
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <BarChart2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No pipeline data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Time to Hire */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-8 flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-indigo-600" />
              Time to Hire
            </h2>
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
                  <span className="text-2xl font-bold text-white">
                    {pipelineStats && pipelineStats.time_to_hire !== null ? pipelineStats.time_to_hire : '--'}
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">Average Days to Hire</p>
                <p className="text-sm text-gray-500 mt-1">Based on recent successful hires</p>
              </div>
              
              {pipelineStats && pipelineStats.time_to_hire !== null && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Performance Insights</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Industry Average:</span>
                      <span className="font-medium">~30 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Your Performance:</span>
                      <span className={`font-medium ${
                        pipelineStats.time_to_hire <= 30 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {pipelineStats.time_to_hire <= 30 ? 'Above Average' : 'Below Average'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Enhanced StatCard component
interface EnhancedStatCardProps {
  icon: React.ElementType;
  name: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
  description: string;
  trend?: number;
}

const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({ 
  icon: Icon, 
  name, 
  value, 
  color, 
  description, 
  trend 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  const trendColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend !== undefined && (
          <div className={`text-sm font-medium ${trendColorClasses[color]}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        <p className="text-lg font-semibold text-gray-700">{name}</p>
      </div>
      <p className="text-sm text-gray-500">{description}</p>
    </motion.div>
  );
};