import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  TrendingUp,
  Building,
  GraduationCap,
  Briefcase,
  BarChart2,
  Star,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/axios';

export function UniversityDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ university_name: profile?.university_name || '', location: profile?.location || '' });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('profile/');
        setProfile(res.data);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({ university_name: profile.university_name || '', location: profile.location || '' });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    try {
      await api.put('profile/', form);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      setSuccess('Failed to update profile');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">University Career Dashboard</h1>
            <p className="mt-1 text-gray-500">Welcome, {profile?.university_name || 'University'}!</p>
          </div>
          <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option>2024 Academic Year</option>
            <option>2023 Academic Year</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Graduates',
            value: profile?.totalGraduates || 0,
            change: '+45',
            icon: GraduationCap,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Employment Rate',
            value: `${profile?.employmentRate || 0}%`,
            change: '+5%',
            icon: Briefcase,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Average Salary',
            value: `$${(profile?.averageSalary || 0 / 1000).toFixed(0)}k`,
            change: '+$5k',
            icon: TrendingUp,
            color: 'bg-purple-100 text-purple-600',
          },
          {
            label: 'Partner Companies',
            value: profile?.partnerCompanies || '85',
            change: '+12',
            icon: Building,
            color: 'bg-yellow-100 text-yellow-600',
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Employment Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Employment Rate Trends</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profile?.employmentTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Employers</h2>
          <div className="space-y-4">
            {profile?.topEmployers?.map((employer: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Building className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{employer.name}</h3>
                    <p className="text-xs text-gray-500">{employer.hires} graduates hired</p>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="font-medium">{employer.satisfaction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Gaps Analysis */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Industry Skill Gaps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profile?.skillGaps?.map((skill: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-medium text-gray-900">{skill.skill}</h3>
                </div>
                <span className="text-sm font-medium text-red-600">{skill.gap}% gap</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${100 - skill.gap}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}