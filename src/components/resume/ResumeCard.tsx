import React from 'react';
import { FileText, Download, Star, User } from 'lucide-react';

interface ResumeCardProps {
  student: {
    name: string;
    title: string;
    skills: string[];
    matchScore: number;
    resumeUrl: string;
  };
  onView: () => void;
}

export function ResumeCard({ student, onView }: ResumeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-gray-100 rounded-full">
            <User className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
            <p className="text-sm text-gray-500">{student.title}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {student.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-gray-900">{student.matchScore}%</span>
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={onView}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <FileText className="h-4 w-4 mr-1" />
          View Resume
        </button>
        <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-500">
          <Download className="h-4 w-4 mr-1" />
          Download
        </button>
      </div>
    </div>
  );
}