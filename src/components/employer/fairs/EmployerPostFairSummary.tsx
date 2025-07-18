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
  Star,
  Mail,
  Download
} from 'lucide-react';

interface EmployerPostFairSummaryProps {
  fairData: {
    id: string;
    title: string;
    date: string;
    visitors: number;
    connections: number;
    resumesCollected: number;
    pendingFollowUps: number;
    potentialCandidates: number;
  };
}

export function EmployerPostFairSummary({ fairData }: EmployerPostFairSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-indigo-900">Booth Visitors</h3>
              <span className="text-xl font-bold text-indigo-600">{fairData.visitors}</span>
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
              <h3 className="text-sm font-medium text-purple-900">Resumes Collected</h3>
              <span className="text-xl font-bold text-purple-600">{fairData.resumesCollected}</span>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-yellow-900">Pending Follow-ups</h3>
              <span className="text-xl font-bold text-yellow-600">{fairData.pendingFollowUps}</span>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-blue-900">Potential Candidates</h3>
              <span className="text-xl font-bold text-blue-600">{fairData.potentialCandidates}</span>
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
                  Send personalized follow-up emails to promising candidates. 
                  You have {fairData.pendingFollowUps} pending follow-ups to complete.
                </p>
                <button className="mt-3 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200">
                  <Mail className="h-4 w-4 inline-block mr-1.5" />
                  Send Batch Emails
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
                <h3 className="text-base font-medium text-gray-900">Review Potential Candidates</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Review resumes and notes from the career fair to identify top candidates. 
                  You have {fairData.potentialCandidates} potential candidates to review.
                </p>
                <button className="mt-3 px-4 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-lg hover:bg-green-200">
                  <Users className="h-4 w-4 inline-block mr-1.5" />
                  Review Candidates
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
                <h3 className="text-base font-medium text-gray-900">Export Fair Data</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Export all data collected during the fair including visitor information, 
                  resumes, and analytics for your records and ATS integration.
                </p>
                <button className="mt-3 px-4 py-2 text-sm font-medium text-yellow-600 bg-yellow-100 rounded-lg hover:bg-yellow-200">
                  <Download className="h-4 w-4 inline-block mr-1.5" />
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Post-Fair Recruitment Timeline</h2>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-8">
            <div className="relative flex items-start">
              <div className="absolute left-0 mt-1 flex items-center justify-center">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100 z-10">
                  <Mail className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="ml-24">
                <h3 className="text-base font-medium text-gray-900">Within 48 Hours</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Send follow-up emails to all promising candidates</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Connect with candidates on LinkedIn</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Categorize resumes by role and potential</p>
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
                    <p className="text-sm text-gray-600">Schedule initial screening interviews</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Import candidate data into your ATS</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Review fair analytics to improve future events</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="absolute left-0 mt-1 flex items-center justify-center">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-purple-100 z-10">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-24">
                <h3 className="text-base font-medium text-gray-900">Within 2-3 Weeks</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Complete technical and team interviews</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Make initial offers to top candidates</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Update recruitment pipeline with fair results</p>
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