import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Users, 
  Calendar, 
  CheckCircle, 
  FileText,
  Briefcase,
  MessageSquare,
  Star
} from 'lucide-react';

interface PostFairSummaryProps {
  fairData: {
    id: string;
    title: string;
    date: string;
    companies: number;
    connections: number;
    eventsAttended: number;
    pendingFollowUps: number;
    applications: number;
  };
}

export function PostFairSummary({ fairData }: PostFairSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-indigo-900">Companies Visited</h3>
              <span className="text-xl font-bold text-indigo-600">{fairData.companies}</span>
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-green-900">Connections Made</h3>
              <span className="text-xl font-bold text-green-600">{fairData.connections}</span>
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-purple-900">Events Attended</h3>
              <span className="text-xl font-bold text-purple-600">{fairData.eventsAttended}</span>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-yellow-900">Pending Follow-ups</h3>
              <span className="text-xl font-bold text-yellow-600">{fairData.pendingFollowUps}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended Next Steps</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">Send Follow-up Emails</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Send personalized thank-you emails to recruiters you met at the fair. 
                  Reference specific conversations to make a lasting impression.
                </p>
                <button className="mt-3 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200">
                  View Email Templates
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">Complete Job Applications</h3>
                <p className="mt-1 text-sm text-gray-600">
                  You have {fairData.applications} pending applications from the career fair. 
                  Complete them before the deadlines to maximize your opportunities.
                </p>
                <button className="mt-3 px-4 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-lg hover:bg-green-200">
                  View Applications
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">Organize Your Notes</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Review and organize your notes from company presentations and conversations.
                  Add any additional details while they're still fresh in your memory.
                </p>
                <button className="mt-3 px-4 py-2 text-sm font-medium text-yellow-600 bg-yellow-100 rounded-lg hover:bg-yellow-200">
                  Review Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Post-Fair Timeline</h2>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-8">
            <div className="relative flex items-start">
              <div className="absolute left-0 mt-1 flex items-center justify-center">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100 z-10">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="ml-24">
                <h3 className="text-base font-medium text-gray-900">Within 24-48 Hours</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Send thank-you emails to recruiters</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Connect with recruiters on LinkedIn</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Organize your notes and materials</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="absolute left-0 mt-1 flex items-center justify-center">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-green-100 z-10">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-24">
                <h3 className="text-base font-medium text-gray-900">Within 1 Week</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Complete and submit job applications</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Follow up on any promised materials</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="absolute left-0 mt-1 flex items-center justify-center">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-purple-100 z-10">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-24">
                <h3 className="text-base font-medium text-gray-900">Within 2-3 Weeks</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Follow up on applications if no response</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Prepare for potential interviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}