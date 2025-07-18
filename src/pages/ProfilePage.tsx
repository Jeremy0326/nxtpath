import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StudentProfile } from './student/StudentProfile';
import { EmployerProfile } from './employer/EmployerProfile';
import { UniversityProfile } from './university/UniversityProfile';

export default function ProfilePage() {
  const { user } = useAuth();
  const userType = user?.role || 'student';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">Profile</h1>
          <p className="text-gray-500 mb-6">Manage your account and personal information</p>
          {userType === 'student' && <StudentProfile />}
          {userType === 'employer' && <EmployerProfile />}
          {userType === 'university' && <UniversityProfile />}
          {!['student', 'employer', 'university'].includes(userType) && (
            <div className="p-8 text-center">Profile not available.</div>
          )}
        </div>
      </div>
    </div>
  );
} 