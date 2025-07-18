import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export function UniversityProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    university_name: '',
    location: '',
    website: '',
    description: '',
    founded_year: '',
    student_population: '',
    acceptance_rate: '',
    ranking: '',
    accreditation: '',
    research_focus: '',
    partnerships: ''
  });
  const [researchFocus, setResearchFocus] = useState<string[]>([]);
  const [partnerships, setPartnerships] = useState<string[]>([]);
  // Account settings
  const [accountForm, setAccountForm] = useState({ username: '', email: '', password: '', newPassword: '', confirmNewPassword: '' });
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountError, setAccountError] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState<string | undefined>(undefined);
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { handleError } = useErrorHandler();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('profile/');
        const universityProfile = res.data.university_profile || {};
        setProfile(res.data);
        setProfilePicUrl(res.data.profile_picture_url);
        setForm({
          university_name: universityProfile.university_name || '',
          location: universityProfile.location || '',
          website: universityProfile.website || '',
          description: universityProfile.description || '',
          founded_year: universityProfile.founded_year || '',
          student_population: universityProfile.student_population || '',
          acceptance_rate: universityProfile.acceptance_rate || '',
          ranking: universityProfile.ranking || '',
          accreditation: universityProfile.accreditation || '',
          research_focus: universityProfile.research_focus?.join(', ') || '',
          partnerships: universityProfile.partnerships?.join(', ') || ''
        });
        setResearchFocus(universityProfile.research_focus || []);
        setPartnerships(universityProfile.partnerships || []);
        setAccountForm({
          username: res.data.username || '',
          email: res.data.email || '',
          password: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } catch (err) {
        handleError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const profileData: any = {};
      Object.entries(form).forEach(([key, value]) => {
        if ((typeof value === 'string' && value.trim() !== '') || (typeof value === 'number' && !isNaN(value))) {
          profileData[key] = value;
        }
      });
      if (researchFocus.length > 0) profileData.research_focus = researchFocus;
      if (partnerships.length > 0) profileData.partnerships = partnerships;
      setLoading(true);
      await api.put('profile/', { university_profile: profileData });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      handleError(err, 'Failed to update profile');
    }
  };

  const handleProfilePicUpload = (url: string) => {
    setProfilePicUrl(url);
    setSuccess('Profile picture updated!');
  };

  // Account settings handlers
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountSuccess('');
    setAccountError('');
    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmNewPassword) {
      setAccountError('New passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await api.put('profile/', {
        ...profile,
        university_profile: {
          ...profile.university_profile,
          research_focus: researchFocus,
          partnerships: partnerships
        },
        username: accountForm.username,
        email: accountForm.email,
      });
      setAccountSuccess('Account updated successfully!');
    } catch (err) {
      handleError(err, 'Failed to update account');
    }
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
          <h2 className="text-xl font-bold text-gray-900 mb-1">{profile?.username || 'University'}</h2>
          <p className="text-gray-500 mb-2">{profile?.email || ''}</p>
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium mb-2">University</span>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="Profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Profile">Profile</TabsTrigger>
            <TabsTrigger value="Account Settings">Account Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="Profile">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleSave} className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">University Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="university_name" className="block text-sm font-medium text-gray-700 mb-1">University Name</Label>
                      <Input
                        id="university_name"
                        name="university_name"
                        value={form.university_name}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={form.website}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="founded_year" className="block text-sm font-medium text-gray-700 mb-1">Founded Year</Label>
                      <Input
                        id="founded_year"
                        name="founded_year"
                        value={form.founded_year}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="student_population" className="block text-sm font-medium text-gray-700 mb-1">Student Population</Label>
                      <Input
                        id="student_population"
                        name="student_population"
                        value={form.student_population}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="acceptance_rate" className="block text-sm font-medium text-gray-700 mb-1">Acceptance Rate (%)</Label>
                      <Input
                        id="acceptance_rate"
                        name="acceptance_rate"
                        value={form.acceptance_rate}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ranking" className="block text-sm font-medium text-gray-700 mb-1">Ranking</Label>
                      <Input
                        id="ranking"
                        name="ranking"
                        value={form.ranking}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accreditation" className="block text-sm font-medium text-gray-700 mb-1">Accreditation</Label>
                      <Input
                        id="accreditation"
                        name="accreditation"
                        value={form.accreditation}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">University Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <hr className="my-6 border-gray-200" />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Research & Partnerships</h3>
                  <div className="space-y-6">
                    <TagsInput
                      label="Research Focus Areas"
                      value={researchFocus}
                      onChange={setResearchFocus}
                      placeholder="Add a research area..."
                    />
                    <TagsInput
                      label="Industry Partnerships"
                      value={partnerships}
                      onChange={setPartnerships}
                      placeholder="Add a partnership..."
                    />
                  </div>
                </div>

                {success && <div className="mt-4 text-green-600">{success}</div>}
                {error && <div className="mt-4 text-red-600">{error}</div>}

                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
          <TabsContent value="Account Settings">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleAccountSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={accountForm.username}
                      onChange={handleAccountChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={accountForm.email}
                      onChange={handleAccountChange}
                      className="mt-1"
                    />
                  </div>
                </div>
                <hr className="my-6 border-gray-200" />
                <form onSubmit={handlePasswordSave} className="space-y-6 bg-gray-50 rounded-xl p-6 shadow mt-8">
                  <h2 className="text-lg font-bold text-indigo-700 mb-2">Change Password</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <Input
                      type="password"
                      name="old_password"
                      value={passwordForm.old_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <Input
                      type="password"
                      name="new_password"
                      value={passwordForm.new_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <Input
                      type="password"
                      name="confirm_password"
                      value={passwordForm.confirm_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  {passwordSuccess && <div className="text-green-600 text-sm mt-2">{passwordSuccess}</div>}
                  {passwordError && <div className="text-red-600 text-sm mt-2">{passwordError}</div>}
                  <div className="pt-4 flex justify-end">
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Change Password</Button>
                  </div>
                </form>
                {accountSuccess && <div className="mt-4 text-green-600">{accountSuccess}</div>}
                {accountError && <div className="mt-4 text-red-600">{accountError}</div>}
                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    Save Account
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// TagsInput component (same as in StudentProfile)
function TagsInput({ label, value, onChange, placeholder }: { label: string, value: string[], onChange: (v: string[]) => void, placeholder?: string }) {
  const [input, setInput] = useState('');
  return (
    <div>
      <Label htmlFor={`tags-${label.toLowerCase().replace(/\s/g, '_')}`} className="block text-sm font-medium text-gray-700 mb-1">{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, idx) => (
          <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
            {tag}
            <button type="button" className="ml-2 text-indigo-400 hover:text-red-500" onClick={() => onChange(value.filter((_, i) => i !== idx))}>&times;</button>
          </span>
        ))}
      </div>
      <Input
        id={`tags-${label.toLowerCase().replace(/\s/g, '_')}`}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
            e.preventDefault();
            if (!value.includes(input.trim())) onChange([...value, input.trim()]);
            setInput('');
          }
        }}
        placeholder={placeholder || 'Add and press Enter'}
        className="mt-1"
      />
    </div>
  );
} 