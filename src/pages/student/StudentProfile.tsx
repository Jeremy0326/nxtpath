import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile, updateAccount } from '@/lib/api/profile';
import type { StudentProfile, User } from '@/types';
import { useToast } from '@/hooks/useToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { getUniversities } from '@/lib/api/profile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/services/api';

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');
  return (
    <div className="flex flex-wrap gap-2 items-center bg-white border border-gray-200 rounded-md px-2 py-2 min-h-[44px] focus-within:ring-2 focus-within:ring-indigo-500">
      {value.map((tag, idx) => (
        <Badge key={idx} variant="secondary" className="flex items-center gap-1 px-3 py-1 text-sm font-medium bg-indigo-50 text-indigo-700 border-indigo-200">
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            className="ml-1 text-indigo-400 hover:text-red-500 focus:outline-none"
            onClick={() => onChange(value.filter((_, i) => i !== idx))}
          >
            ×
          </button>
        </Badge>
      ))}
      <input
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
        className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm px-2 py-1"
        aria-label={placeholder || 'Add tag'}
      />
    </div>
  );
}

export function StudentProfile() {
  const { addToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [universities, setUniversities] = useState<{ id: number; name: string }[]>([]);
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
        // Defensive initialization for career_preferences
        let p = data.student_profile || null;
        if (p) {
          const cp = p.career_preferences || {};
          p = {
            ...p,
            career_preferences: {
              preferred_roles: Array.isArray(cp.preferred_roles) ? cp.preferred_roles : [],
              locations: Array.isArray(cp.locations) ? cp.locations : [],
              work_types: Array.isArray(cp.work_types) ? cp.work_types : [],
              industries: Array.isArray(cp.industries) ? cp.industries : [],
            },
          };
        }
        setProfile(p);
      } catch (error) {
        addToast({ title: 'Error', description: 'Failed to load profile.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [addToast]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const data = await getUniversities();
        setUniversities(Array.isArray(data) ? data : []);
      } catch (error) {
        setUniversities([]);
        addToast({ title: 'Error', description: 'Failed to load universities.', variant: 'destructive' });
      }
    };
    fetchUniversities();
  }, [addToast]);

  const handleProfileChange = (field: keyof StudentProfile, value: any) => {
    setProfile(p => (p ? { ...p, [field]: value } : null));
  };

  const handleUserChange = (field: keyof User, value: any) => {
    setUser(u => (u ? { ...u, [field]: value } : null));
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      // Always send university as a string (UUID) or null
      const payload = {
        ...profile,
        university: typeof profile.university === 'string' ? profile.university : null,
      };
      await updateProfile({ student_profile: payload });
      addToast({ title: 'Success', description: 'Profile updated successfully!' });
    } catch (error) {
      addToast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    }
  };

  const handleProfilePicUpload = (url: string) => {
    setUser(u => (u ? { ...u, profile_picture_url: url } : null));
    addToast({ title: 'Success', description: 'Profile picture updated!' });
  };

  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!user) return;
    try {
      await updateAccount({ full_name: user.full_name, email: user.email });
      addToast({ title: 'Success', description: 'Account updated successfully!' });
    } catch (error) {
      addToast({ title: 'Error', description: 'Failed to update account.', variant: 'destructive' });
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

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !profile) return <div>Could not load profile.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col items-center mb-8">
            <ProfilePictureUpload
              currentUrl={user?.profile_picture_url}
              onUpload={handleProfilePicUpload}
            />
            <div className="mt-4 text-xl font-semibold text-gray-900">{user?.full_name}</div>
            <div className="text-gray-500 text-sm">{user?.email}</div>
          </div>
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <form onSubmit={handleAccountSave} className="space-y-6 bg-gray-50 rounded-xl p-6 shadow">
                <h2 className="text-lg font-bold text-indigo-700 mb-2">Account Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <Input value={user.full_name} onChange={e => handleUserChange('full_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input type="email" value={user.email} onChange={e => handleUserChange('email', e.target.value)} />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Account</Button>
                </div>
              </form>
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
            </TabsContent>
            <TabsContent value="profile">
              <form onSubmit={handleProfileSave} className="space-y-8 bg-gray-50 rounded-xl p-6 shadow">
                <h2 className="text-lg font-bold text-indigo-700 mb-2">Student Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                    <select
                      value={profile.university || ''}
                      onChange={e => handleProfileChange('university', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select University</option>
                      {(universities || []).map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                    <Input value={profile.major || ''} onChange={e => handleProfileChange('major', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                    <Input type="number" value={profile.graduation_year || ''} onChange={e => handleProfileChange('graduation_year', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                    <Input type="number" step="0.1" value={profile.gpa || ''} onChange={e => handleProfileChange('gpa', parseFloat(e.target.value))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                    <TagInput value={profile.skills || []} onChange={v => handleProfileChange('skills', v)} placeholder="Add a skill..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
                    <TagInput value={profile.interests || []} onChange={v => handleProfileChange('interests', v)} placeholder="Add an interest..." />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm mt-6">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2">Career Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Roles</label>
                      <TagInput
                        value={profile.career_preferences?.preferred_roles || []}
                        onChange={v => handleProfileChange('career_preferences', { ...profile.career_preferences, preferred_roles: v })}
                        placeholder="Add a role..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Locations</label>
                      <TagInput
                        value={profile.career_preferences?.locations || []}
                        onChange={v => handleProfileChange('career_preferences', { ...profile.career_preferences, locations: v })}
                        placeholder="Add a location..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Types</label>
                      <TagInput
                        value={profile.career_preferences?.work_types || []}
                        onChange={v => handleProfileChange('career_preferences', { ...profile.career_preferences, work_types: v })}
                        placeholder="Add a work type..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industries</label>
                      <TagInput
                        value={profile.career_preferences?.industries || []}
                        onChange={v => handleProfileChange('career_preferences', { ...profile.career_preferences, industries: v })}
                        placeholder="Add an industry..."
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Profile</Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}