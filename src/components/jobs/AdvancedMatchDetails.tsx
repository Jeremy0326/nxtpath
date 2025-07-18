import React from 'react';
import { Job, CareerInsight, AdvancedAnalysis } from '../../types/job';

interface AdvancedMatchDetailsProps {
  job: Job;
  onClose: () => void;
}

const AdvancedMatchDetails: React.FC<AdvancedMatchDetailsProps> = ({ job, onClose }) => {
  const matchScore = job.matchScore || 0;
  const advancedAnalysis = job.advanced_analysis || {
    confidence_level: 'Medium',
    skill_gap_analysis: {
      critical_gaps: [],
      minor_gaps: [],
      strong_matches: [],
      transferable_skills: [],
      learning_priority: [],
    },
    experience_alignment: {
      relevance_score: 0,
      relevant_experiences: [],
      transferable_experiences: [],
      experience_gaps: [],
      growth_trajectory: '',
    },
    career_fit_analysis: {
      cultural_fit_score: 0,
      growth_potential: 'Medium',
      career_stage_alignment: '',
      long_term_potential: '',
      risk_factors: [],
    },
    career_insights: [],
    competitive_advantage: [],
    areas_for_improvement: [],
    hiring_recommendation: 'Consider',
    interview_focus_areas: [],
    executive_summary: '',
  };
  
  // Get color for match score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return '💪';
      case 'weakness': return '⚠️';
      case 'opportunity': return '🚀';
      case 'recommendation': return '💡';
      default: return '📊';
    }
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getGrowthPotentialColor = (potential: string) => {
    switch (potential) {
      case 'High': return 'text-green-600 bg-green-100 border-green-300';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'Low': return 'text-red-600 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-gray-600">{job.company.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Overall Match Score - Enhanced */}
          <div className={`rounded-lg border-2 p-6 mb-6 ${getScoreColor(matchScore)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Overall Match Analysis</h3>
              <div className="flex items-center space-x-3">
                {advancedAnalysis?.confidence_level && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(advancedAnalysis.confidence_level)}`}>
                    {advancedAnalysis.confidence_level} Confidence
                  </span>
                )}
                <div className={`flex items-center justify-center w-16 h-16 rounded-full ${getScoreBadgeColor(matchScore)} text-white font-bold text-lg`}>
                  {matchScore}%
                </div>
              </div>
            </div>
            
            {advancedAnalysis?.executive_summary && (
              <p className="text-gray-700 leading-relaxed mb-4">
                {advancedAnalysis.executive_summary}
              </p>
            )}

            {job.matchReasons && (
              <div>
                <h4 className="font-medium mb-2">Key Factors:</h4>
                <ul className="space-y-1">
                  {job.matchReasons.map((reason, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-sm">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Advanced Analysis Sections */}
          {advancedAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Skills Analysis */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  Skills Deep Dive
                </h3>
                
                {/* Strong Matches */}
                {advancedAnalysis.skill_gap_analysis?.strong_matches?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-green-700 mb-2">✅ Strong Matches</h4>
                    <div className="flex flex-wrap gap-2">
                      {advancedAnalysis.skill_gap_analysis.strong_matches.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transferable Skills */}
                {advancedAnalysis.skill_gap_analysis?.transferable_skills?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-blue-700 mb-2">🔄 Transferable Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {advancedAnalysis.skill_gap_analysis.transferable_skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Critical Gaps */}
                {advancedAnalysis.skill_gap_analysis?.critical_gaps?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-red-700 mb-2">🚨 Critical Gaps</h4>
                    <div className="flex flex-wrap gap-2">
                      {advancedAnalysis.skill_gap_analysis.critical_gaps.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Priority */}
                {advancedAnalysis.skill_gap_analysis?.learning_priority?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-purple-700 mb-2">📚 Learning Priority</h4>
                    <div className="flex flex-wrap gap-2">
                      {advancedAnalysis.skill_gap_analysis.learning_priority.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Career Fit Analysis */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  Career Fit Assessment
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Cultural Fit Score:</span>
                    <span className="font-semibold text-green-700">
                      {advancedAnalysis.career_fit_analysis?.cultural_fit_score ?? 0}/100
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Growth Potential:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGrowthPotentialColor(advancedAnalysis.career_fit_analysis.growth_potential)}`}>
                      {advancedAnalysis.career_fit_analysis.growth_potential}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Experience Relevance:</span>
                    <span className="font-semibold text-green-700">
                      {advancedAnalysis.experience_alignment.relevance_score}/100
                    </span>
                  </div>

                  {advancedAnalysis.career_fit_analysis.career_stage_alignment && (
                    <div>
                      <span className="text-gray-700 block mb-1">Career Stage Alignment:</span>
                      <p className="text-sm text-gray-600 bg-white p-2 rounded">
                        {advancedAnalysis.career_fit_analysis.career_stage_alignment}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Career Insights */}
          {advancedAnalysis?.career_insights && advancedAnalysis.career_insights.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💡</span>
                Career Insights & Recommendations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advancedAnalysis.career_insights.map((insight, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{getInsightIcon(insight.insight_type)}</span>
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(insight.impact_level)}`}>
                        {insight.impact_level}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3">{insight.description}</p>
                    
                    {insight.actionable_steps.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 text-sm mb-1">Action Steps:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {insight.actionable_steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start">
                              <span className="text-blue-500 mr-1">•</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitive Advantage & Areas for Improvement */}
          {advancedAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Competitive Advantage */}
              {advancedAnalysis.competitive_advantage.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                    <span className="mr-2">⭐</span>
                    Your Competitive Edge
                  </h3>
                  <ul className="space-y-2">
                    {advancedAnalysis.competitive_advantage.map((advantage, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-600 mr-2">✨</span>
                        <span className="text-gray-700 text-sm">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {advancedAnalysis.areas_for_improvement.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                    <span className="mr-2">📈</span>
                    Growth Opportunities
                  </h3>
                  <ul className="space-y-2">
                    {advancedAnalysis.areas_for_improvement.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-600 mr-2">🎯</span>
                        <span className="text-gray-700 text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Hiring Recommendation */}
          {advancedAnalysis?.hiring_recommendation && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">👥</span>
                For Hiring Managers
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Recommendation:</h4>
                  <span className={`inline-block px-4 py-2 rounded-full font-medium ${
                    advancedAnalysis.hiring_recommendation === 'Strong Consider' 
                      ? 'bg-green-100 text-green-800' 
                      : advancedAnalysis.hiring_recommendation === 'Consider'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {advancedAnalysis.hiring_recommendation}
                  </span>
                </div>
                
                {advancedAnalysis.interview_focus_areas.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Interview Focus Areas:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {advancedAnalysis.interview_focus_areas.map((area, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detailed Report */}
          {(job.detailed_report || job.detailedReport) && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Detailed Analysis Report
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {job.detailed_report || job.detailedReport}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedMatchDetails; 