import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../../../lib/axios';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../contexts/AuthContext';

const COMPANY_SIZES = [
  { value: '', label: 'Select size' },
  { value: 'SEED', label: 'Seed (1-10 employees)' },
  { value: 'STARTUP', label: 'Startup (11-50 employees)' },
  { value: 'SCALEUP', label: 'Scale-up (51-250 employees)' },
  { value: 'MID_SIZE', label: 'Mid-size (251-1000 employees)' },
  { value: 'LARGE', label: 'Large (1001-5000 employees)' },
  { value: 'ENTERPRISE', label: 'Enterprise (5001+ employees)' },
];

export function CompanyProfile() {
  const { user } = useAuth();
  const isAdmin = user?.employer_profile?.is_company_admin;
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<any>({});
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await api.get('/employer/company-profile/');
        setCompany(res.data);
        setForm(res.data);
      } catch (err) {
        setError('Failed to load company profile');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

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
      addToast({ title: 'Logo uploaded', description: 'Company logo updated.' });
    } catch {
      addToast({ title: 'Upload failed', description: 'Could not upload logo.', variant: 'destructive' });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      const res = await api.put('/employer/company-profile/', form);
      setCompany(res.data);
      setForm(res.data);
      setSuccess('Profile updated successfully!');
      addToast({ title: 'Success', description: 'Company profile updated.' });
    } catch (err) {
      setError('Failed to update company profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      <div className="bg-white rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-shrink-0 relative">
          <img
            src={form.logo_url || '/default-company-logo.png'}
            alt="Company Logo"
            className="w-24 h-24 rounded-full object-cover border-2 border-indigo-200 shadow"
          />
          {isAdmin && (
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 shadow hover:bg-indigo-700 focus:outline-none"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
              title="Upload Logo"
            >
              {logoUploading ? '...' : '✎'}
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="mt-1 text-gray-500">Manage your company information</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 space-y-6">
        {isAdmin ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <input
                type="text"
                name="industry"
                value={form.industry || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={form.location || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="url"
                name="website"
                value={form.website || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Size</label>
              <select
                name="size"
                value={form.size || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {COMPANY_SIZES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            {success && <div className="mt-4 text-green-600">{success}</div>}
            <div className="mt-6">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <div className="mt-1 block w-full rounded-md border-gray-100 bg-gray-50 p-2">{form.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <div className="mt-1 block w-full rounded-md border-gray-100 bg-gray-50 p-2">{form.industry}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <div className="mt-1 block w-full rounded-md border-gray-100 bg-gray-50 p-2">{form.location}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <div className="mt-1 block w-full rounded-md border-gray-100 bg-gray-50 p-2">{form.website}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Size</label>
              <div className="mt-1 block w-full rounded-md border-gray-100 bg-gray-50 p-2">{COMPANY_SIZES.find(opt => opt.value === form.size)?.label || '-'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <div className="mt-1 block w-full rounded-md border-gray-100 bg-gray-50 p-2">{form.description}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}