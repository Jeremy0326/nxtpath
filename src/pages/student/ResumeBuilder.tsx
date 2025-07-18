import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Sparkles, 
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Upload
} from 'lucide-react';
import { CVUpload } from '../../components/cv/CVUpload';
import api from '../../lib/axios';

interface ResumeSection {
  id: string;
  type: 'education' | 'experience' | 'projects' | 'skills' | 'certifications';
  content: any;
}

interface AIFeedback {
  score: number;
  suggestions: {
    type: 'warning' | 'success';
    message: string;
  }[];
}

export function ResumeBuilder() {
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [activeTemplate, setActiveTemplate] = useState('professional');
  const [showCVUpload, setShowCVUpload] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback>({
    score: 85,
    suggestions: [
      {
        type: 'warning',
        message: 'Add more quantifiable achievements to your experience section'
      },
      {
        type: 'warning',
        message: 'Include relevant certifications to strengthen your profile'
      },
      {
        type: 'success',
        message: 'Strong technical skills section that matches industry demands'
      }
    ]
  });
  const [currentCV, setCurrentCV] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentCV = async () => {
      try {
        const response = await api.get('cv/active/');
        setCurrentCV(response.data);
      } catch (error) {
        setCurrentCV(null);
      }
    };
    fetchCurrentCV();
  }, []);

  const templates = [
    { id: 'professional', name: 'Professional', description: 'Clean and modern design' },
    { id: 'technical', name: 'Technical', description: 'Highlight your technical skills' },
    { id: 'creative', name: 'Creative', description: 'Stand out with a unique layout' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Editor */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
                <p className="mt-1 text-gray-500">Create a professional resume with AI assistance</p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowCVUpload(!showCVUpload)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Upload className="h-4 w-4 inline-block mr-2" />
                  {showCVUpload ? 'Hide CV Upload' : 'Upload CV'}
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download className="h-4 w-4 inline-block mr-2" />
                  Export PDF
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                  <Sparkles className="h-4 w-4 inline-block mr-2" />
                  AI Review
                </button>
              </div>
            </div>
          </div>

          {/* CV Upload Section */}
          {showCVUpload && (
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Your CV</h2>
              <CVUpload />
              {/* Show current CV preview/download if available */}
              {currentCV && (
                <div className="mt-4">
                  <a
                    href={currentCV.file_url || currentCV.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 text-sm font-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    View Uploaded CV
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Template Selection */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Template</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setActiveTemplate(template.id)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    activeTemplate === template.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <FileText className={`h-6 w-6 mb-2 ${
                    activeTemplate === template.id ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  <h3 className="text-sm font-medium text-gray-900">{template.name}</h3>
                  <p className="text-xs text-gray-500">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section Editor */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Professional Title</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
                  <textarea
                    rows={4}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Write a compelling summary..."
                  />
                </div>
              </div>
            </div>

            {/* Add Section Button */}
            <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
              <Plus className="h-5 w-5 inline-block mr-2" />
              Add Section
            </button>
          </div>
        </div>

        {/* AI Review Panel */}
        <div className="lg:w-96">
          <div className="sticky top-8 space-y-6">
            {/* Resume Score */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Resume Score</h2>
                <div className="flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  {aiFeedback.score}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${aiFeedback.score}%` }}
                />
              </div>
              <div className="space-y-3">
                {aiFeedback.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${
                      suggestion.type === 'warning' ? 'bg-yellow-50' : 'bg-green-50'
                    }`}
                  >
                    {suggestion.type === 'warning' ? (
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                    <p className="text-sm text-gray-600">{suggestion.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Keywords */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trending Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {['React', 'Node.js', 'AWS', 'System Design', 'CI/CD'].map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <span className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <span className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download Word
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                  <span className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Online Profile
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}