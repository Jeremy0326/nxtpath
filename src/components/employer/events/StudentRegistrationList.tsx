import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Clock, CheckCircle, X, Download, MessageSquare } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  university: string;
  major: string;
  year: string;
  registrationTime: string;
  status: 'registered' | 'waitlist' | 'cancelled';
  resume?: string;
}

interface StudentRegistrationListProps {
  eventId: string;
  students: Student[];
  onMessageStudent: (studentId: string) => void;
  onDownloadResume: (studentId: string) => void;
  onUpdateStatus: (studentId: string, status: Student['status']) => void;
}

export function StudentRegistrationList({
  eventId,
  students,
  onMessageStudent,
  onDownloadResume,
  onUpdateStatus,
}: StudentRegistrationListProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Registered Students</h2>
          <div className="flex items-center space-x-4">
            <select className="text-sm border-gray-300 rounded-lg focus:ring-indigo-500">
              <option value="all">All Students</option>
              <option value="registered">Registered</option>
              <option value="waitlist">Waitlist</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              <Download className="h-4 w-4 mr-2" />
              Export List
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {students.map((student) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 hover:bg-gray-50"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-gray-100 rounded-full">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{student.name}</h3>
                  <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>{student.email}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                    <span>{student.university}</span>
                    <span>•</span>
                    <span>{student.major}</span>
                    <span>•</span>
                    <span>{student.year} Year</span>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    Registered {student.registrationTime}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  student.status === 'registered'
                    ? 'bg-green-100 text-green-800'
                    : student.status === 'waitlist'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </span>
                <div className="flex items-center space-x-2">
                  {student.resume && (
                    <button
                      onClick={() => onDownloadResume(student.id)}
                      className="p-1 text-gray-400 hover:text-gray-500"
                      title="Download Resume"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onMessageStudent(student.id)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                    title="Message Student"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  {student.status !== 'registered' ? (
                    <button
                      onClick={() => onUpdateStatus(student.id, 'registered')}
                      className="p-1 text-gray-400 hover:text-green-500"
                      title="Approve Registration"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateStatus(student.id, 'cancelled')}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Cancel Registration"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}