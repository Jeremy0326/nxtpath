import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles, CheckCircle, AlertCircle, Star, TrendingUp, Award, BookOpen, Target, BarChart2 } from "lucide-react";
import { Job, AdvancedAnalysis } from "../../types/job";

interface JobMatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  isLoading: boolean;
}

const TabButton = ({ isActive, onClick, children }: { isActive: boolean, onClick: () => void, children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

const AnalysisCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      {icon}
      <span className="ml-2">{title}</span>
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const SkillList = ({ title, skills, color }: { title: string, skills: string[], color: string }) => (
  <div>
    <h4 className={`font-semibold text-sm mb-2 text-${color}-800`}>{title}</h4>
    {skills && skills.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span key={index} className={`px-2 py-1 bg-${color}-100 text-${color}-800 text-xs rounded-full`}>
            {skill}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500">None identified.</p>
    )}
  </div>
);

export function JobMatchDetailsModal({ isOpen, onClose, job, isLoading }: JobMatchDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!job) return null;
  
  const analysis: AdvancedAnalysis | undefined = job.advanced_analysis;

  const renderContent = () => {
    switch (activeTab) {
      case "skills":
        return (
          <div className="space-y-6">
            <AnalysisCard title="Skill Gap Analysis" icon={<Target className="text-indigo-600" />}>
              <SkillList title="Strong Matches" skills={analysis?.skill_gap_analysis.strong_matches || []} color="green" />
              <SkillList title="Minor Gaps" skills={analysis?.skill_gap_analysis.minor_gaps || []} color="yellow" />
              <SkillList title="Critical Gaps" skills={analysis?.skill_gap_analysis.critical_gaps || []} color="red" />
            </AnalysisCard>
            <AnalysisCard title="Transferable Skills" icon={<Sparkles className="text-indigo-600" />}>
               <SkillList title="Identified" skills={analysis?.skill_gap_analysis.transferable_skills || []} color="blue" />
            </AnalysisCard>
          </div>
        );
      case "experience":
         return (
          <AnalysisCard title="Experience Alignment" icon={<TrendingUp className="text-indigo-600" />}>
            <p className="text-sm text-gray-600">{analysis?.experience_alignment.growth_trajectory}</p>
            <SkillList title="Relevant Experiences" skills={analysis?.experience_alignment.relevant_experiences || []} color="green" />
            <SkillList title="Experience Gaps" skills={analysis?.experience_alignment.experience_gaps || []} color="red" />
          </AnalysisCard>
        );
      case "suggestions":
        return (
          <AnalysisCard title="Actionable Suggestions" icon={<CheckCircle className="text-indigo-600" />}>
            {analysis?.career_insights.map((insight, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-md">
                <h4 className="font-semibold text-gray-800">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            ))}
          </AnalysisCard>
        );
      case "overview":
      default:
        return (
           <AnalysisCard title="Match Overview" icon={<BarChart2 className="text-indigo-600" />}>
              <p className="text-gray-700 text-sm">{analysis?.executive_summary}</p>
              <div className="flex justify-around pt-4">
                  <div className="text-center">
                      <div className={`text-3xl font-bold text-indigo-600`}>{job.matchScore?.toFixed(0) || 'N/A'}%</div>
                      <div className="text-sm text-gray-500">Overall Score</div>
                  </div>
                  <div className="text-center">
                      <div className={`text-3xl font-bold text-green-600`}>{analysis?.skill_gap_analysis.strong_matches.length || 0}</div>
                      <div className="text-sm text-gray-500">Skills Matched</div>
                  </div>
                   <div className="text-center">
                      <div className={`text-3xl font-bold text-red-600`}>{analysis?.skill_gap_analysis.critical_gaps.length || 0}</div>
                      <div className="text-sm text-gray-500">Skills Gap</div>
                  </div>
              </div>
           </AnalysisCard>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-50 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-6 w-6 text-indigo-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">AI Job Match Analysis</h2>
                  <p className="text-sm text-gray-500">{job.title}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-full text-gray-500 hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex space-x-2">
                    <TabButton isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                    <TabButton isActive={activeTab === 'skills'} onClick={() => setActiveTab('skills')}>Skills</TabButton>
                    <TabButton isActive={activeTab === 'experience'} onClick={() => setActiveTab('experience')}>Experience</TabButton>
                    <TabButton isActive={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')}>Suggestions</TabButton>
                </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 flex-grow">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                </div>
              ) : (
                renderContent()
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
