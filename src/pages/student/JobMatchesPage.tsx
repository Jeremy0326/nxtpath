import React, { useState, useEffect } from 'react';
import { jobService } from '../../services/jobService';
import { Job } from '../../types/job';
import { Briefcase, MapPin, Star, Loader2, Lightbulb, CheckCircle, XCircle, ChevronDown, ChevronUp, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InterviewReport } from '../../components/interview/InterviewReport';

const JobMatchesPage: React.FC = () => {
  const [matchedJobs, setMatchedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchType, setMatchType] = useState<'standard' | 'ai'>('ai');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [interviewModal, setInterviewModal] = useState<{ interviewId: string } | null>(null);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewError, setInterviewError] = useState<string | null>(null);


  useEffect(() => {
    const fetchMatchedJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let jobs;
        if (matchType === 'ai') {
          jobs = await jobService.getAIJobMatches(10); // Get top 10 AI matches
        } else {
          jobs = await jobService.getJobMatches(10); // Get top 10 standard matches
        }
        
        setMatchedJobs(jobs);
      } catch (err) {
        console.error('Error fetching matched jobs:', err);
        setError('Failed to load job matches. Please upload your CV to get personalized matches.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchedJobs();
  }, [matchType]);

  const toggleJobExpansion = (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
    }
  };

  const toggleMatchType = () => {
    setMatchType(prevType => prevType === 'standard' ? 'ai' : 'standard');
  };

  const handleStartInterview = async (job: Job) => {
    setInterviewLoading(true);
    setInterviewError(null);
    try {
      const applicationId = job.applicationId;
      if (!applicationId) throw new Error('No application found for this job.');
      const data = await jobService.startInterview(applicationId);
      // Interview session handling removed - interviews are now handled through the application flow
    } catch (err) {
      setInterviewError('Failed to start AI interview. Please try again later.');
    } finally {
      setInterviewLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Job Matches</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Job Matches</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-700">{error}</p>
            <Link to="/student/cv-upload" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
              Upload your CV
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (matchedJobs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Job Matches</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
            <p className="text-gray-600">No job matches found. Upload or update your CV to get personalized job recommendations.</p>
            <Link to="/student/cv-upload" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
              Upload your CV
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">
            {matchType === 'ai' ? 'AI-Powered Job Matches' : 'Job Matches'}
          </h1>
          {matchType === 'ai' && (
            <div className="ml-3 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center">
              <Lightbulb className="h-4 w-4 mr-1" />
              AI Matching
            </div>
          )}
        </div>
        <button 
          onClick={toggleMatchType}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Switch to {matchType === 'ai' ? 'standard' : 'AI'} matching
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {matchType === 'ai' 
              ? 'These job matches are powered by AI analysis of your CV and job descriptions. The AI considers skills, experience, education, and other factors to provide personalized recommendations.'
              : 'These job matches are based on keyword matching between your CV and job descriptions.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {matchedJobs.map((job) => (
            <div key={job.id} className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-4">
              <div className="flex items-start">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200 mr-4">
                  {job.company?.logo ? (
                    <img
                      src={job.company.logo}
                      alt={job.company?.name}
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <Building className="h-8 w-8 text-gray-400 m-2" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        <Link to={`/jobs/${job.id}`} className="hover:text-blue-700">
                          {job.title}
                        </Link>
                      </h2>
                      <p className="text-sm text-gray-600">{job.company?.name}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="mr-3">{job.location}</span>
                        <Briefcase className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{job.job_type}</span>
                      </div>
                    </div>
                    {job.matchScore && (
                      <div className="flex items-center bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full">
                        <Star className="h-4 w-4 mr-1 fill-blue-500 text-blue-500" />
                        <span>{job.matchScore}% Match</span>
                      </div>
                    )}
                  </div>
                  {/* Match reasons */}
                  {job.matchReasons && job.matchReasons.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-700">{job.matchReasons[0]}</p>
                    </div>
                  )}
                  
                  {/* Skills section */}
                  {matchType === 'ai' && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {job.highlightedSkills && job.highlightedSkills.map((skill, index) => (
                          <span key={index} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      {job.missingSkills && job.missingSkills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {job.missingSkills.map((skill, index) => (
                            <span key={index} className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full flex items-center">
                              <XCircle className="h-3 w-3 mr-1" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Toggle details button */}
                  {matchType === 'ai' && (
                    <button 
                      onClick={() => toggleJobExpansion(job.id)}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      {expandedJobId === job.id ? (
                        <>Hide details <ChevronUp className="h-4 w-4 ml-1" /></>
                      ) : (
                        <>Show details <ChevronDown className="h-4 w-4 ml-1" /></>
                      )}
                    </button>
                  )}
                  
                  {/* Expanded details */}
                  {matchType === 'ai' && expandedJobId === job.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {/* Experience match */}
                      {job.experienceMatch && (
                        <div className="mb-3">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">Experience Match</h3>
                          <div className="flex items-center mb-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${job.experienceMatch.score}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">{job.experienceMatch.score}%</span>
                          </div>
                          <p className="text-sm text-gray-600">{job.experienceMatch.details}</p>
                        </div>
                      )}
                      
                      {/* Education match */}
                      {job.educationMatch && (
                        <div className="mb-3">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">Education Match</h3>
                          <div className="flex items-center mb-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${job.educationMatch.score}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">{job.educationMatch.score}%</span>
                          </div>
                          <p className="text-sm text-gray-600">{job.educationMatch.details}</p>
                        </div>
                      )}
                      
                      {/* Improvement suggestions */}
                      {job.improvementSuggestions && job.improvementSuggestions.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">Improvement Suggestions</h3>
                          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                            {job.improvementSuggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* Modern Action Row */}
              <div className="flex flex-wrap gap-2 mt-4 items-center justify-end">
                {job.interview_status === 'COMPLETED' && job.interview_id ? (
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors shadow-sm"
                    onClick={() => setInterviewModal({ interviewId: job.interview_id! })}
                  >
                    View AI Interview Report
                  </button>
                ) : job.interview_status === 'IN_PROGRESS' && job.interview_id ? (
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                    onClick={() => {
                      // Interview session handling removed - interviews are now handled through the application flow
                    }}
                  >
                    Continue AI Interview
                  </button>
                ) : job.interview_status === 'PENDING' ? (
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm"
                    onClick={() => handleStartInterview(job)}
                    disabled={interviewLoading}
                  >
                    {interviewLoading ? 'Starting...' : 'Start AI Interview'}
                  </button>
                ) : job.interview_status === 'ERROR' ? (
                  <span className="text-xs text-red-600">Interview Error</span>
                ) : null}
                <Link 
                  to={`/jobs/${job.id}`}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors shadow-sm"
                >
                  View Details
                </Link>
                <Link 
                  to={`/jobs/${job.id}/apply`}
                  className="px-4 py-2 bg-blue-600 border border-blue-600 rounded-lg text-white hover:bg-blue-700 text-xs font-semibold transition-colors shadow-sm"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Interview Report Modal */}
      {interviewModal && (
        <InterviewReport
          applicationId={interviewModal.interviewId}
          onClose={() => setInterviewModal(null)}
          onRetake={() => {
            // Interview session handling removed - interviews are now handled through the application flow
          }}
        />
      )}
      {interviewError && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {interviewError}
          <button className="ml-4 underline" onClick={() => setInterviewError(null)}>Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default JobMatchesPage;
 