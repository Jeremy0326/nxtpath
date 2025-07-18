import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  Target, 
  Star,
  Calendar,
  ChevronRight,
  Clock,
  Book,
  Trophy,
  Sparkles,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Eye,
  Briefcase,
  TrendingUp,
  Users,
  Zap,
  MapPin
} from 'lucide-react';
import api from '../../lib/axios';
import { careerFairService } from '../../services/careerFairService';
import { jobService } from '../../services/jobService';

interface Company {
  id: string;
  name: string;
  logo_url?: string;
}

interface Application {
  id: string;
  job: {
    title: string;
    company: Company;
  };
  status: 'applied' | 'interviewed' | 'offered' | 'rejected';
  created_at: string;
  updated_at: string;
  ai_match_score?: number;
  interview_id?: string;
  interview_status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
}

interface Activity {
  type: 'interview' | 'application' | 'skill' | 'ai-interview' | 'job-notification';
  title: string;
  company?: string;
  position?: string;
  skill?: string;
  level?: number;
  score?: number;
  time: string;
  actionUrl?: string;
  status?: string;
}

interface UpcomingEvent {
  type: 'interview' | 'career-fair';
  title: string;
  company?: string;
  time?: string;
  date?: string;
  preparation?: number;
  registered?: boolean;
}

interface JobNotification {
  id: string;
  title: string;
  company: string;
  location: string;
  posted_date: string;
  match_score?: number;
}

export function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobNotification[]>([]);
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    skills: 0,
    careerFairs: 0,
    aiInterviewsReady: 0,
    newJobsToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch profile
        const profileRes = await api.get('/profile/');
        setProfile(profileRes.data);
        
        // Fetch applications
        const applicationsRes = await api.get('/my-applications/');
        const apps = applicationsRes.data.results || applicationsRes.data || [];
        setApplications(apps);
        
        // Calculate stats from real data
        const interviewCount = apps.filter((app: Application) => 
          app.status.toLowerCase().includes('interview')
        ).length;
        
        // Count AI interviews ready (applied status with interview_id)
        const aiInterviewsReady = apps.filter((app: Application) => 
          app.status === 'applied' && app.interview_id
        ).length;
        
        // Count skills from profile if available
        const skillsCount = profileRes.data?.student_profile?.skills?.length || 0;
        
        // Fetch career fairs for stats and upcoming events
        let careerFairsCount = 0;
        let careerFairEvents: UpcomingEvent[] = [];
        
        try {
          const fairsRes = await careerFairService.getDiscoverableFairs();
          const fairs = fairsRes.results || [];
          careerFairsCount = fairs.length;
          
          // Convert career fairs to upcoming events
          careerFairEvents = fairs.slice(0, 5).map((fair: any) => ({
            type: 'career-fair' as const,
            title: fair.title,
            date: new Date(fair.start_date).toLocaleDateString(),
            registered: fair.is_registered || false,
          }));
        } catch (err) {
          console.error('Error fetching career fairs:', err);
        }
        
        // Fetch recent jobs for notifications
        let recentJobsData: JobNotification[] = [];
        let newJobsToday = 0;
        
        try {
          const jobsRes = await jobService.getJobs({ page: 1, page_size: 10 });
          const jobs = jobsRes.results || [];
          const today = new Date();
          const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
          
          recentJobsData = jobs.slice(0, 5).map((job: any) => ({
            id: job.id,
            title: job.title,
            company: job.company.name,
            location: job.location,
            posted_date: job.created_at,
            match_score: job.ai_match_score
          }));
          
          newJobsToday = jobs.filter((job: any) => 
            new Date(job.created_at) > oneDayAgo
          ).length;
        } catch (err) {
          console.error('Error fetching recent jobs:', err);
        }
        
        setRecentJobs(recentJobsData);
        
        setStats({
          applications: apps.length,
          interviews: interviewCount,
          skills: skillsCount,
          careerFairs: careerFairsCount,
          aiInterviewsReady,
          newJobsToday
        });
        
        // Generate activities from real applications with AI interview status
        const recentActivities: Activity[] = apps.slice(0, 5).map((app: Application) => ({
          type: 'application',
          title: 'Application Submitted',
          company: app.job.company?.name || 'Unknown Company',
          position: app.job.title,
          time: new Date(app.created_at).toLocaleDateString(),
          actionUrl: `/student/applications/${app.id}`,
          status: app.status
        }));
        
        // Add AI interview activities
        const aiInterviewActivities: Activity[] = apps
          .filter((app: Application) => app.status === 'applied' && app.interview_id)
          .slice(0, 3)
          .map((app: Application) => ({
            type: 'ai-interview',
            title: 'AI Interview Ready',
            company: app.job.company?.name || 'Unknown Company',
            position: app.job.title,
            time: new Date(app.created_at).toLocaleDateString(),
            actionUrl: `/student/interview/${app.id}`,
            status: 'Ready to Start'
          }));
        
        // Add interview status activities
        const interviewStatusActivities: Activity[] = apps
          .filter((app: Application) => ['interviewed', 'offered', 'rejected'].includes(app.status))
          .slice(0, 3)
          .map((app: Application) => {
            let title = '';
            let status = '';
            switch (app.status) {
              case 'interviewed':
                title = 'Interview Completed';
                status = 'Waiting for Review';
                break;
              case 'offered':
                title = 'Job Offer Received';
                status = 'Congratulations!';
                break;
              case 'rejected':
                title = 'Application Update';
                status = 'Not Selected';
                break;
            }
            return {
              type: 'interview',
              title,
              company: app.job.company?.name || 'Unknown Company',
              position: app.job.title,
              time: new Date(app.updated_at).toLocaleDateString(),
              actionUrl: `/student/applications/${app.id}`,
              status
            };
          });
        
        // Add new job notifications
        const jobNotificationActivities: Activity[] = recentJobsData.slice(0, 3).map((job) => ({
          type: 'job-notification',
          title: 'New Job Posted',
          company: job.company,
          position: job.title,
          time: new Date(job.posted_date).toLocaleDateString(),
          actionUrl: `/jobs/${job.id}`,
          status: job.match_score ? `${Math.round(job.match_score)}% Match` : 'New'
        }));
        
        setActivities([
          ...aiInterviewActivities,
          ...interviewStatusActivities,
          ...recentActivities,
          ...jobNotificationActivities
        ]);
        
        // Set upcoming events from career fairs
        setUpcomingEvents(careerFairEvents);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const dashboardStats = [
    {
      label: 'Job Applications',
      value: stats.applications.toString(),
      change: stats.applications > 0 ? `+${stats.applications}` : '0',
      type: 'increase',
      icon: Briefcase,
    },
    {
      label: 'Interviews',
      value: stats.interviews.toString(),
      change: stats.interviews > 0 ? `+${stats.interviews}` : '0',
      type: 'increase',
      icon: Users,
    },
    {
      label: 'AI Interviews Ready',
      value: stats.aiInterviewsReady.toString(),
      change: stats.aiInterviewsReady > 0 ? 'Ready' : 'None',
      type: 'neutral',
      icon: Zap,
    },
    {
      label: 'New Jobs Today',
      value: stats.newJobsToday.toString(),
      change: stats.newJobsToday > 0 ? 'Posted' : 'None',
      type: 'neutral',
      icon: TrendingUp,
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ai-interview':
        return <Play className="h-5 w-5 text-green-600" />;
      case 'interview':
        return <Target className="h-5 w-5 text-purple-600" />;
      case 'application':
        return <BarChart2 className="h-5 w-5 text-blue-600" />;
      case 'job-notification':
        return <Briefcase className="h-5 w-5 text-orange-600" />;
      default:
        return <Star className="h-5 w-5 text-green-600" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case 'ready to start':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'waiting for review':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'congratulations!':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'not selected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Eye className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile?.full_name || 'Student'}!</h1>
            <p className="mt-1 text-gray-500">Here's an overview of your progress</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              <Sparkles className="h-4 w-4 inline-block mr-1.5" />
              {profile?.student_profile?.skills?.length ? `${profile.student_profile.skills.length} Skills` : 'No Skills Added'}
            </div>
            {stats.aiInterviewsReady > 0 && (
              <div className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-medium">
                <Zap className="h-4 w-4 inline-block mr-1.5" />
                {stats.aiInterviewsReady} AI Interview{stats.aiInterviewsReady > 1 ? 's' : ''} Ready
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-8 w-8 text-indigo-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  stat.type === 'increase' ? 'text-green-600' : 
                  stat.type === 'decrease' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity & Notifications</h2>
            <div className="space-y-6">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'ai-interview' ? 'bg-green-100' :
                      activity.type === 'interview' ? 'bg-purple-100' :
                      activity.type === 'application' ? 'bg-blue-100' :
                      activity.type === 'job-notification' ? 'bg-orange-100' :
                      'bg-gray-100'
                    }`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          {activity.company && (
                            <p className="text-sm text-gray-500">{activity.company}</p>
                          )}
                          {activity.position && (
                            <p className="text-sm text-gray-500">{activity.position}</p>
                          )}
                          {activity.skill && (
                            <p className="text-sm text-gray-500">
                              {activity.skill} - Level {activity.level}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {activity.status && getStatusIcon(activity.status)}
                          {activity.status && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              activity.status === 'Ready to Start' ? 'bg-green-100 text-green-800' :
                              activity.status === 'Waiting for Review' ? 'bg-yellow-100 text-yellow-800' :
                              activity.status === 'Congratulations!' ? 'bg-green-100 text-green-800' :
                              activity.status === 'Not Selected' ? 'bg-red-100 text-red-800' :
                              activity.status.includes('Match') ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        {activity.actionUrl && (
                          <Link
                            to={activity.actionUrl}
                            className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                          >
                            View Details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Book className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                  <p className="text-sm">Start by applying to jobs or attending career fairs</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Career Fairs</h2>
              <Link
                to="/student/career-fairs"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:border-indigo-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{event.title}</h3>
                        {event.company && (
                          <p className="text-sm text-gray-500">{event.company}</p>
                        )}
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1.5" />
                            {event.date || event.time}
                          </span>
                        </div>
                      </div>
                      {event.registered && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Registered
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming career fairs</p>
                  <p className="text-sm">Check back later for new events</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Job Notifications */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Job Postings</h2>
              <Link
                to="/jobs"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentJobs.length > 0 ? (
                recentJobs.map((job, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:border-indigo-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{job.title}</h3>
                        <p className="text-xs text-gray-500">{job.company}</p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(job.posted_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {job.match_score && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                          {Math.round(job.match_score)}%
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="mt-3 text-xs text-indigo-600 hover:text-indigo-500 font-medium block"
                    >
                      View Job →
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent job postings</p>
                  <p className="text-sm">Check back later for new opportunities</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}