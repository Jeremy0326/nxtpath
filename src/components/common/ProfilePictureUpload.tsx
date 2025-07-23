import React, { useRef, useState } from 'react';
import api from '../../lib/axios';

interface ProfilePictureUploadProps {
  currentUrl?: string;
  onUpload: (url: string) => void;
}

export function ProfilePictureUpload({ currentUrl, onUpload }: ProfilePictureUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(currentUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/profile/upload-picture/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(response.data.profile_picture_url);
      onUpload(response.data.profile_picture_url);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload profile picture.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
        <img
          src={preview || '/default-avatar.png'}
          alt="Profile"
          className="object-cover w-full h-full"
        />
        <button
          type="button"
          className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 shadow hover:bg-indigo-700 focus:outline-none"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={isUploading}
      />
      {isUploading && <div className="text-sm text-gray-500">Uploading...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
} 