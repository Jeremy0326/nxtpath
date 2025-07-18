import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Building, MapPin, Star, Download } from 'lucide-react';

interface ItineraryEvent {
  id: string;
  time: string;
  company: string;
  eventType: 'presentation' | 'interview' | 'networking';
  title: string;
  location: string;
  matchScore?: number;
}

interface FairItineraryProps {
  date: string;
  events: ItineraryEvent[];
  onCancelEvent: (eventId: string) => void;
}

export function FairItinerary({ date, events, onCancelEvent }: FairItineraryProps) {
  const getEventTypeStyles = (type: ItineraryEvent['eventType']) => {
    const styles = {
      presentation: 'bg-blue-100 text-blue-800',
      interview: 'bg-purple-100 text-purple-800',
      networking: 'bg-green-100 text-green-800',
    };
    return styles[type];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">My Schedule - {date}</h2>
          </div>
          <button className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
            <Download className="h-4 w-4 inline-block mr-1.5" />
            Export
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {events.length > 0 ? (
          events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEventTypeStyles(event.eventType)}`}>
                      {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Building className="h-3.5 w-3.5 mr-1" />
                      {event.company}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {event.location}
                    </div>
                  </div>
                  {event.matchScore && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Star className="h-3 w-3 mr-1" />
                        {event.matchScore}% Match
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onCancelEvent(event.id)}
                  className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No events scheduled yet</p>
          </div>
        )}
      </div>
    </div>
  );
}