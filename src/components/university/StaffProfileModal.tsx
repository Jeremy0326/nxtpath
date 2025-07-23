import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Clock, Calendar, Building } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  lastActive: string;
}

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
}

export function StaffProfileModal({ isOpen, onClose, staff }: StaffProfileModalProps) {
  if (!staff) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString || dateString === 'Never') return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center">
                <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center mr-6 shadow-md">
                  <User className="h-10 w-10 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">{staff.name}</h2>
                  <p className="text-base text-gray-600 font-medium">{staff.role}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-200">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Staff Info */}
            <div className="space-y-10 p-8 bg-white flex-1 overflow-y-auto">
              <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Staff Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-base font-medium text-gray-900">{staff.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Joined</p>
                      <p className="text-base font-medium text-gray-900">{formatDate(staff.joinedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-indigo-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-4 bg-white rounded-xl border border-indigo-100 hover:bg-indigo-50 transition-colors shadow-sm">
                    <p className="font-medium text-indigo-900">Send Message</p>
                    <p className="text-xs text-indigo-700">Contact this staff member</p>
                  </button>
                  <button className="w-full text-left p-4 bg-white rounded-xl border border-indigo-100 hover:bg-indigo-50 transition-colors shadow-sm">
                    <p className="font-medium text-indigo-900">View Schedule</p>
                    <p className="text-xs text-indigo-700">Check availability and meetings</p>
                  </button>
                  <button className="w-full text-left p-4 bg-white rounded-xl border border-indigo-100 hover:bg-indigo-50 transition-colors shadow-sm">
                    <p className="font-medium text-indigo-900">Performance Review</p>
                    <p className="text-xs text-indigo-700">View performance metrics</p>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 