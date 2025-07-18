import React, { useState } from 'react';
import { ResumeUpload } from '../../components/ResumeUpload';
import { JobMatching } from '../../components/JobMatching';

export function JobMatchingPage() {
  const [parsedResume, setParsedResume] = useState<any>(null);
  const [preferences, setPreferences] = useState({
    location: '',
    salary_range: '',
    job_type: '',
    skills: [] as string[],
  });
  const [showPreferences, setShowPreferences] = useState(false);

  const handleResumeUpload = (data: any) => {
    setParsedResume(data);
    // Auto-populate skills from resume
    if (data.skills) {
      setPreferences(prev => ({
        ...prev,
        skills: data.skills,
      }));
    }
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillsChange = (skills: string[]) => {
    setPreferences(prev => ({
      ...prev,
      skills,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Job Match</h1>
          <p className="mt-2 text-gray-600">
            Upload your resume and set your preferences to discover matching opportunities
          </p>
        </div>

        <div className="space-y-8">
          {/* Resume Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Your Resume</h2>
            <ResumeUpload onUploadComplete={handleResumeUpload} />
          </div>

          {/* Job Preferences Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Job Preferences</h2>
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                {showPreferences ? 'Hide Preferences' : 'Show Preferences'}
              </button>
            </div>

            {showPreferences && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={preferences.location}
                    onChange={handlePreferenceChange}
                    placeholder="e.g., New York, NY"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Range
                  </label>
                  <select
                    name="salary_range"
                    value={preferences.salary_range}
                    onChange={handlePreferenceChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select range</option>
                    <option value="0-50000">$0 - $50,000</option>
                    <option value="50000-75000">$50,000 - $75,000</option>
                    <option value="75000-100000">$75,000 - $100,000</option>
                    <option value="100000-125000">$100,000 - $125,000</option>
                    <option value="125000+">$125,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <select
                    name="job_type"
                    value={preferences.job_type}
                    onChange={handlePreferenceChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select type</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Skills
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {preferences.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
                      >
                        {skill}
                        <button
                          type="button"
                          className="ml-2 text-indigo-400 hover:text-red-500"
                          onClick={() =>
                            handleSkillsChange(preferences.skills.filter((_, i) => i !== index))
                          }
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      const input = e.target as HTMLInputElement;
                      if (e.key === 'Enter' && input.value.trim()) {
                        e.preventDefault();
                        if (!preferences.skills.includes(input.value.trim())) {
                          handleSkillsChange([...preferences.skills, input.value.trim()]);
                        }
                        input.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Job Matching Results */}
          {parsedResume && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <JobMatching parsedResume={parsedResume} preferences={preferences} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 