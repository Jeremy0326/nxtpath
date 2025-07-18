import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, User, X, Plus, MessageSquare } from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'unavailable';
  student?: {
    id: string;
    name: string;
    email: string;
  };
}

interface InterviewSchedulerProps {
  date: string;
  timeSlots: TimeSlot[];
  onScheduleInterview: (slotId: string, studentId: string) => void;
  onCancelInterview: (slotId: string) => void;
  onMessageStudent: (studentId: string) => void;
}

export function InterviewScheduler({
  date,
  timeSlots,
  onScheduleInterview,
  onCancelInterview,
  onMessageStudent,
}: InterviewSchedulerProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Interview Schedule</h2>
          </div>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
            <Plus className="h-4 w-4 mr-2" />
            Add Time Slots
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Morning Slots */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Morning</h3>
            <div className="space-y-3">
              {timeSlots
                .filter(slot => {
                  const hour = parseInt(slot.startTime.split(':')[0]);
                  return hour < 12;
                })
                .map(slot => (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-lg border ${
                      selectedSlot === slot.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        slot.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : slot.status === 'booked'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                      </span>
                    </div>

                    {slot.student && (
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-gray-100 rounded-full">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{slot.student.name}</p>
                            <p className="text-gray-500">{slot.student.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onMessageStudent(slot.student!.id)}
                            className="p-1 text-gray-400 hover:text-gray-500"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onCancelInterview(slot.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Afternoon Slots */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Afternoon</h3>
            <div className="space-y-3">
              {timeSlots
                .filter(slot => {
                  const hour = parseInt(slot.startTime.split(':')[0]);
                  return hour >= 12;
                })
                .map(slot => (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-lg border ${
                      selectedSlot === slot.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        slot.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : slot.status === 'booked'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                      </span>
                    </div>

                    {slot.student && (
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-gray-100 rounded-full">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{slot.student.name}</p>
                            <p className="text-gray-500">{slot.student.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onMessageStudent(slot.student!.id)}
                            className="p-1 text-gray-400 hover:text-gray-500"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onCancelInterview(slot.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}