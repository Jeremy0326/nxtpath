import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import { ProfilePictureUpload } from '@/components/common/ProfilePictureUpload';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

function Tabs({ tabs, activeTab, setActiveTab }: { tabs: string[]; activeTab: string; setActiveTab: (tab: string) => void }) {
  return (
    <div className="flex space-x-4 border-b border-gray-200 mb-8">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors border-b-2 ${activeTab === tab ? 'border-indigo-600 text-indigo-700 bg-indigo-50' : 'border-transparent text-gray-500 hover:text-indigo-600'}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function EmployerProfile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: '',
    is_company_admin: false,
  });
  const [activeTab, setActiveTab] = useState('Profile');
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState<string | undefined>(undefined);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (authUser) {
      const employerProfile = authUser.employer_profile || {};
      setProfile(authUser);
      setProfilePicUrl(authUser.profile_picture_url);
      setForm({
        full_name: authUser.full_name || '',
        email: authUser.email || '',
        role: (employerProfile as any).role || '',
        is_company_admin: (employerProfile as any).is_company_admin || false,
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [authUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      await api.put('profile/', { full_name: form.full_name, email: form.email, employer_profile: { role: form.role } });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      handleError(err, 'Failed to update profile');
      setError('Failed to update profile');
    }
  };

  const handleProfilePicUpload = (url: string) => {
    setProfilePicUrl(url);
    setSuccess('Profile picture updated!');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match.');
      return;
    }
    try {
      await api.post('/auth/change-password/', passwordForm);
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordError('Failed to change password.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Summary Card */}
        <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg p-8 mb-6">
          <ProfilePictureUpload currentUrl={profilePicUrl} onUpload={handleProfilePicUpload} />
          <h2 className="text-xl font-bold text-gray-900 mb-1">{form.full_name || 'Employer'}</h2>
          <p className="text-gray-500 mb-2">{form.email || ''}</p>
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium mb-2">Employer</span>
        </div>

        {/* Tabs */}
        <Tabs tabs={['Profile', 'Account']} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'Profile' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSave} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              {form.is_company_admin && (
                <div className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1 inline-block">Company Admin</div>
              )}
              {success && <div className="mt-4 text-green-600">{success}</div>}
              {error && <div className="mt-4 text-red-600">{error}</div>}
              <div className="mt-6">
                <Button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        )}
        {activeTab === 'Account' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handlePasswordSave} className="space-y-6 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  name="old_password"
                  value={passwordForm.old_password}
                  onChange={handlePasswordChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={handlePasswordChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              {passwordSuccess && <div className="text-green-600 text-sm mt-2">{passwordSuccess}</div>}
              {passwordError && <div className="text-red-600 text-sm mt-2">{passwordError}</div>}
              <div className="mt-6">
                <Button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Change Password
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 