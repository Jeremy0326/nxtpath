import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Building, MapPin, Globe, Users, GraduationCap, Calendar, Edit3, Save, X } from 'lucide-react';

export function UniversityProfile() {
  const { user } = useAuth();
  const [university, setUniversity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<any>({});
  const [logoUploading, setLogoUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchUniversity = async () => {
      setLoading(true);
      try {
        const res = await api.get('/profile/');
        setUniversity(res.data);
        setForm(res.data);
      } catch (err) {
        setError('Failed to load university profile');
        addToast({
          title: 'Error',
          description: 'Failed to load university profile',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUniversity();
  }, [addToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setLogoUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/profile/upload-picture/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev: any) => ({ ...prev, logo_url: res.data.profile_picture_url }));
      addToast({ 
        title: 'Logo uploaded', 
        description: 'University logo updated successfully.' 
      });
    } catch {
      addToast({ 
        title: 'Upload failed', 
        description: 'Could not upload logo.', 
        variant: 'destructive' 
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      const res = await api.put('/profile/', form);
      setUniversity(res.data);
      setForm(res.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      addToast({ 
        title: 'Success', 
        description: 'University profile updated successfully.' 
      });
    } catch (err) {
      setError('Failed to update university profile');
      addToast({
        title: 'Error',
        description: 'Failed to update university profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(university);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading university profile...</p>
        </div>
      </div>
    );
  }

  if (error && !university) {
    return (
      <div className="text-center py-12">
        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Profile</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0 relative">
              <img
                src={form.logo_url || '/default-university-logo.png'}
                alt="University Logo"
                className="w-24 h-24 rounded-full object-cover border-2 border-indigo-200 shadow"
              />
              {isEditing && (
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 shadow hover:bg-indigo-700 focus:outline-none"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  title="Upload Logo"
                >
                  {logoUploading ? '...' : <Edit3 className="h-4 w-4" />}
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={logoInputRef}
                className="hidden"
                onChange={handleLogoChange}
                disabled={logoUploading}
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900">University Profile</h1>
              <p className="mt-1 text-gray-500">Manage your university information and settings</p>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button onClick={handleCancel} variant="outline" disabled={loading}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-indigo-600" />
            University Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">University Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={form.location || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={form.website || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="established">Established Year</Label>
                <Input
                  id="established"
                  name="established"
                  value={form.established || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="totalStudents">Total Students</Label>
                <Input
                  id="totalStudents"
                  name="totalStudents"
                  type="number"
                  value={form.totalStudents || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="totalStaff">Total Staff</Label>
                <Input
                  id="totalStaff"
                  name="totalStaff"
                  type="number"
                  value={form.totalStaff || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                className="mt-1"
                placeholder="Describe your university's mission, values, and achievements..."
              />
            </div>

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">{success}</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-900">{form.totalStudents || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Staff</p>
                <p className="text-2xl font-bold text-green-900">{form.totalStaff || 0}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Established</p>
                <p className="text-2xl font-bold text-purple-900">{form.established || 'N/A'}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
} 