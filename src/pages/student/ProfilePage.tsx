import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StudentProfile } from './StudentProfile';

export default function ProfilePage() {
  const { user } = useAuth();
  const userType = user?.user_type || 'student';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">Profile</h1>
          <p className="text-gray-500 mb-6">Manage your account and personal information</p>
          {userType === 'student' && <StudentProfile />}
          {userType !== 'student' && (
            <div className="p-8 text-center">
              <p className="text-gray-600">Profile management for {userType} coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 