import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Building, MessageSquare, Briefcase, Star } from 'lucide-react';
import { Company as ApiCompany } from '../../types/job';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: {
    name: string;
    logo?: string;
    description?: string;
    openPositions?: OpenPosition[];
  };
  event: {
    title: string;
    type: string;
    startTime: string;
    endTime: string;
  };
  onConfirm: (data: {
    notes: string;
    resume: boolean;
    notification: boolean;
    positionInterest: string[];
  }) => void;
}

interface OpenPosition {
  id: string;
  title: string;
  type: string;
  description: string;
  requirements: string[];
  matchScore?: number;
}

export function BookingModal({
  isOpen,
  onClose,
  company,
  event,
  onConfirm,
}: BookingModalProps) {
  const [notes, setNotes] = useState('');
  const [attachResume, setAttachResume] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  if (!isOpen) return null;

  // Ensure company and openPositions exist and are valid
  if (!company || !company.openPositions) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
      >
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl p-6">
            <div className="text-center">
              <p className="text-gray-600">Unable to load company information. Please try again later.</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
    >
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl"
        >
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Company Info */}
            <div className="flex items-start space-x-4 border-b pb-6">
              <img
                src={company.logo || ''}
                alt={company.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{company.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{company.description}</p>
              </div>
            </div>

            {/* Event Details */}
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    March 20, 2024
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1.5" />
                    {event.startTime} - {event.endTime}
                  </div>
                </div>
              </div>

              {/* Open Positions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Open Positions</h3>
                <div className="space-y-4">
                  {(company.openPositions || []).map((position) => (
                    <div
                      key={position.id}
                      className="rounded-lg border p-4 hover:border-indigo-500 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-medium text-gray-900">{position.title}</h4>
                          <p className="mt-1 text-sm text-gray-500">{position.type}</p>
                          <p className="mt-2 text-sm text-gray-600">{position.description}</p>
                        </div>
                        {position.matchScore && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Star className="h-3 w-3 mr-1" />
                            {position.matchScore}% Match
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedPositions.includes(position.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPositions([...selectedPositions, position.id]);
                              } else {
                                setSelectedPositions(selectedPositions.filter(id => id !== position.id));
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Interested in this position
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes for the Recruiter
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Introduce yourself and mention any specific topics you'd like to discuss..."
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={attachResume}
                    onChange={(e) => setAttachResume(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    Attach my resume to the booking
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={enableNotifications}
                    onChange={(e) => setEnableNotifications(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    Send me email reminders
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm({
                notes,
                resume: attachResume,
                notification: enableNotifications,
                positionInterest: selectedPositions,
              })}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Confirm Registration
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}