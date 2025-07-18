import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  X, 
  Bell,
  MessageSquare,
  User
} from 'lucide-react';

interface VirtualQueueProps {
  queue: {
    id: string;
    company: string;
    boothId: string;
    position: number;
    estimatedWait: string;
    totalInQueue: number;
    status: 'waiting' | 'ready' | 'meeting';
  };
  onLeaveQueue: () => void;
  onStartMeeting: () => void;
  onMessageRecruiter: () => void;
}

export function VirtualQueue({
  queue,
  onLeaveQueue,
  onStartMeeting,
  onMessageRecruiter
}: VirtualQueueProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Virtual Queue Status</h2>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4" />
            <span>{queue.totalInQueue} in queue</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-medium text-gray-900">{queue.company}</h3>
            <p className="text-sm text-gray-500">Booth {queue.boothId}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            queue.status === 'ready'
              ? 'bg-green-100 text-green-800'
              : queue.status === 'meeting'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {queue.status === 'ready'
              ? 'Ready to Meet'
              : queue.status === 'meeting'
              ? 'In Meeting'
              : 'In Queue'}
          </div>
        </div>

        {queue.status === 'waiting' && (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">{queue.position}</p>
                  <p className="text-sm text-indigo-800">Your Position</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">Estimated wait time</p>
              <p className="text-xl font-semibold text-gray-900">{queue.estimatedWait}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">Notify when it's your turn</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex justify-between">
              <button
                onClick={onLeaveQueue}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <X className="h-4 w-4 inline-block mr-1.5" />
                Leave Queue
              </button>
              <button
                onClick={onMessageRecruiter}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
              >
                <MessageSquare className="h-4 w-4 inline-block mr-1.5" />
                Message Recruiter
              </button>
            </div>
          </div>
        )}

        {queue.status === 'ready' && (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-green-800">It's Your Turn!</h3>
              <p className="text-sm text-green-600">The recruiter is ready to meet with you now.</p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onStartMeeting}
                className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <User className="h-4 w-4 inline-block mr-1.5" />
                Start Meeting Now
              </button>
            </div>
          </div>
        )}

        {queue.status === 'meeting' && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-blue-800">Meeting in Progress</h3>
              <p className="text-sm text-blue-600">You're currently meeting with a recruiter.</p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onLeaveQueue}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                End Meeting
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}