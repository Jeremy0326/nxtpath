import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Building, Star } from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  company: string;
  eventType: 'presentation' | 'interview' | 'networking';
  title: string;
  capacity: number;
  registered: number;
  isBooked: boolean;
}

interface FairScheduleProps {
  date: string;
  timeSlots: TimeSlot[];
  onBookSlot: (slotId: string) => void;
}

export function FairSchedule({ date, timeSlots, onBookSlot }: FairScheduleProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const getEventTypeStyles = (type: TimeSlot['eventType']) => {
    const styles = {
      presentation: 'bg-blue-100 text-blue-800',
      interview: 'bg-purple-100 text-purple-800',
      networking: 'bg-green-100 text-green-800',
    };
    return styles[type];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">{date}</h2>
          </div>
          <select className="px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option>All Events</option>
            <option>Presentations</option>
            <option>Interviews</option>
            <option>Networking</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {timeSlots.map((slot) => (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${
                selectedSlot === slot.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
              onClick={() => setSelectedSlot(slot.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900">{slot.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeStyles(slot.eventType)}`}>
                      {slot.eventType.charAt(0).toUpperCase() + slot.eventType.slice(1)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1.5" />
                      {slot.company}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5" />
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1.5" />
                      {slot.registered}/{slot.capacity} spots
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onBookSlot(slot.id)}
                  disabled={slot.isBooked || slot.registered >= slot.capacity}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    slot.isBooked
                      ? 'bg-green-100 text-green-800'
                      : slot.registered >= slot.capacity
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {slot.isBooked ? 'Booked' : slot.registered >= slot.capacity ? 'Full' : 'Book Slot'}
                </button>
              </div>

              {selectedSlot === slot.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t"
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Event Description</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Join us for an interactive session to learn more about our company culture,
                        open positions, and career growth opportunities.
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => onBookSlot(slot.id)}
                        disabled={slot.isBooked || slot.registered >= slot.capacity}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {slot.isBooked ? 'Already Booked' : 'Confirm Booking'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}