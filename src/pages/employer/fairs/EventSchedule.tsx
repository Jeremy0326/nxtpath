import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users } from 'lucide-react';
import { InterviewScheduler } from '../../../components/employer/events/InterviewScheduler';
import { EventScheduleForm } from '../../../components/employer/events/EventScheduleForm';
import { StudentRegistrationList } from '../../../components/employer/events/StudentRegistrationList';

const mockTimeSlots = [
  {
    id: '1',
    startTime: '09:00',
    endTime: '09:30',
    status: 'booked' as const,
    student: {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
    },
  },
  {
    id: '2',
    startTime: '09:30',
    endTime: '10:00',
    status: 'available' as const,
  },
  {
    id: '3',
    startTime: '10:00',
    endTime: '10:30',
    status: 'unavailable' as const,
  },
  {
    id: '4',
    startTime: '13:00',
    endTime: '13:30',
    status: 'available' as const,
  },
  {
    id: '5',
    startTime: '13:30',
    endTime: '14:00',
    status: 'booked' as const,
    student: {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
    },
  },
];

const mockStudents = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    university: 'Stanford University',
    major: 'Computer Science',
    year: '3rd',
    registrationTime: '2 days ago',
    status: 'registered' as const,
    resume: 'resume.pdf',
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    university: 'MIT',
    major: 'Software Engineering',
    year: '4th',
    registrationTime: '1 day ago',
    status: 'waitlist' as const,
  },
];

export function EventSchedule() {
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Schedule</h1>
            <p className="mt-1 text-gray-500">Manage your career fair schedule and student registrations</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            label: 'Total Events',
            value: '8',
            icon: Calendar,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Available Slots',
            value: '24',
            icon: Clock,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Registered Students',
            value: '45',
            icon: Users,
            color: 'bg-purple-100 text-purple-600',
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
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Interview Schedule */}
      <InterviewScheduler
        date="March 20, 2024"
        timeSlots={mockTimeSlots}
        onScheduleInterview={(slotId, studentId) => {
          console.log('Scheduling interview:', { slotId, studentId });
        }}
        onCancelInterview={(slotId) => {
          console.log('Canceling interview:', slotId);
        }}
        onMessageStudent={(studentId) => {
          console.log('Messaging student:', studentId);
        }}
      />

      {/* Student Registrations */}
      <StudentRegistrationList
        eventId="1"
        students={mockStudents}
        onMessageStudent={(studentId) => {
          console.log('Messaging student:', studentId);
        }}
        onDownloadResume={(studentId) => {
          console.log('Downloading resume:', studentId);
        }}
        onUpdateStatus={(studentId, status) => {
          console.log('Updating status:', { studentId, status });
        }}
      />

      {showScheduleForm && (
        <EventScheduleForm
          onClose={() => setShowScheduleForm(false)}
          onSave={(data) => {
            console.log('Saving event:', data);
            setShowScheduleForm(false);
          }}
        />
      )}
    </motion.div>
  );
}