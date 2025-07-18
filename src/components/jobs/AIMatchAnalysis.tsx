import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { 
  Target, Briefcase, User, TrendingUp, Lightbulb, AlertTriangle, 
  CheckCircle, Building, MapPin, Loader2, ChevronDown, ChevronUp,
  Award, Zap, CheckSquare, XSquare, BarChart4
} from 'lucide-react';
import type { GroupedMatchReport } from '@/types';

// Expandable axis card for each matrix section
function ExpandableAxisCard({
  title,
  icon,
  summary,
  children,
  defaultOpen = false,
  score
}: {
  title: string;
  icon: React.ReactNode;
  summary?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  score?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  
  // Determine card border color based on score
  const getBorderColor = () => {
    if (score === undefined) return "border-gray-200";
    if (score >= 80) return "border-l-4 border-l-green-500";
    if (score >= 60) return "border-l-4 border-l-blue-500";
    return "border-l-4 border-l-amber-500";
  };
  
  return (
    <Card className={`mb-2 transition-all duration-300 hover:shadow-md ${getBorderColor()}`}>
      <CardHeader
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer flex flex-row items-center justify-between hover:bg-slate-50 px-4 py-3"
      >
        <span className="flex gap-2 items-center text-base font-semibold">{icon}{title}</span>
        <div className="flex items-center gap-2">
          {score !== undefined && (
            <Badge className={
              score >= 80 ? "bg-green-100 text-green-800" :
              score >= 60 ? "bg-blue-100 text-blue-800" :
              "bg-amber-100 text-amber-800"
            }>
              {score}/100
            </Badge>
          )}
          <button type="button" className="ml-2 text-gray-500 hover:text-gray-700" aria-label="Expand section">
          {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        </div>
      </CardHeader>
      {open && (
        <div className="transition-all duration-300 ease-in-out">
          <CardContent className="pb-4 pt-2">{children}</CardContent>
          {summary && <CardDescription className="px-4 pb-3 italic text-gray-600">{summary}</CardDescription>}
        </div>
      )}
      {!open && summary && (
        <CardContent className="pb-3 pt-0 text-gray-600 text-sm">{summary}</CardContent>
      )}
    </Card>
  );
}

function ScoreSummary({ score, label, color = 'blue' }: { score: number; label: string; color?: string }) {
  // Enhanced score visualization
  const getScoreColor = () => {
    if (score >= 80) return "text-green-700";
    if (score >= 60) return "text-blue-700";
    return "text-amber-700";
  };
  
  return (
    <div className="flex flex-col items-center transition-all duration-300 hover:scale-105">
      <CircularProgress 
        progress={score} 
        size={70} 
        color={
          score >= 80 ? 'green' :
          score >= 60 ? 'blue' :
          'amber'
        } 
        strokeWidth={8}
      />
      <span className={`mt-2 text-xl font-bold ${getScoreColor()}`}>{score}/100</span>
      <span className="text-xs font-medium text-gray-700 mt-1">{label}</span>
    </div>
  );
}

function PreferencesCard({ preferences }: { preferences: GroupedMatchReport['shared']['preferences_analysis'] }) {
  return (
    <div className="space-y-3">
      {(preferences || []).map((pref, i) => (
        <Card key={i} className="bg-slate-50 border p-3 mb-2 transition-all duration-200 hover:shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-semibold text-gray-800">{pref.title}</span>
            <Badge className={
              pref.match_level === 'excellent' ? 'bg-green-100 text-green-700 font-medium'
              : pref.match_level === 'good' ? 'bg-blue-100 text-blue-700 font-medium'
              : 'bg-amber-100 text-amber-700 font-medium'
            }>
              {pref.match_level}
            </Badge>
          </div>
          <div className="text-gray-700 mb-2 text-sm">{pref.description}</div>
          <div className="flex gap-3 text-xs">
            <span className="capitalize flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              {pref.preference_type}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {pref.impact} impact
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SkillsCard({ analysis }: { analysis: GroupedMatchReport['shared']['skills_analysis'] }) {
  return (
    <div className="space-y-4">
      <div className="mb-2">
        <div className="font-semibold text-green-700 mb-2 flex items-center gap-1.5">
          <CheckSquare className="h-4 w-4" />
          Matching Skills
        </div>
        <div className="flex flex-wrap gap-2">
          {(analysis.matching_skills || []).length > 0 ? (
            analysis.matching_skills.map((s, i) => (
              <Badge key={i} className="bg-green-100 text-green-800 py-1 px-2.5">{s}</Badge>
            ))
          ) : (
            <span className="text-sm text-gray-500 italic">No matching skills found</span>
          )}
        </div>
      </div>
      <div>
        <div className="font-semibold text-red-700 mb-2 flex items-center gap-1.5">
          <XSquare className="h-4 w-4" />
          Missing/Desired Skills
        </div>
        <div className="flex flex-wrap gap-2">
          {(analysis.missing_skills || []).length > 0 ? (
            analysis.missing_skills.map((s, i) => (
              <Badge key={i} className="bg-red-100 text-red-800 py-1 px-2.5">{s}</Badge>
            ))
          ) : (
            <span className="text-sm text-gray-500 italic">No missing skills identified</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ExperienceCard({ analysis }: { analysis: GroupedMatchReport['shared']['experience_analysis'] }) {
  return (
    <div className="space-y-4">
    <div>
        <div className="font-semibold text-green-700 mb-2 flex items-center gap-1.5">
          <CheckSquare className="h-4 w-4" />
          Relevant Experience
        </div>
        {analysis.relevant_experience && analysis.relevant_experience.length > 0 ? (
          <ul className="list-none space-y-1.5">
            {analysis.relevant_experience.map((exp, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-600 font-bold text-sm mt-0.5">•</span>
                <span className="text-gray-700 text-sm">{exp}</span>
              </li>
        ))}
      </ul>
        ) : (
          <span className="text-sm text-gray-500 italic">No relevant experience found</span>
        )}
      </div>
      <div>
        <div className="font-semibold text-red-700 mb-2 flex items-center gap-1.5">
          <XSquare className="h-4 w-4" />
          Experience Gaps
        </div>
        {analysis.experience_gaps && analysis.experience_gaps.length > 0 ? (
          <ul className="list-none space-y-1.5">
            {analysis.experience_gaps.map((gap, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-sm mt-0.5">•</span>
                <span className="text-gray-700 text-sm">{gap}</span>
              </li>
        ))}
      </ul>
        ) : (
          <span className="text-sm text-gray-500 italic">No significant experience gaps identified</span>
        )}
      </div>
    </div>
  );
}

function CultureFitCard({ analysis }: { analysis: GroupedMatchReport['shared']['culture_fit_analysis'] }) {
  const getRatingColor = (rating: string | number) => {
    const value = String(rating).toLowerCase();
    switch(value) {
      case 'excellent': return 'text-green-700';
      case 'good': return 'text-blue-700';
      case 'average': return 'text-amber-700';
      default: return 'text-gray-700';
    }
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-3 border bg-slate-50">
          <div className="text-sm font-medium mb-1">Teamwork</div>
          <div className={`font-bold ${getRatingColor(analysis.teamwork)}`}>{String(analysis.teamwork)}</div>
        </Card>
        <Card className="p-3 border bg-slate-50">
          <div className="text-sm font-medium mb-1">Values Alignment</div>
          <div className={`font-bold ${getRatingColor(analysis.values_alignment)}`}>{String(analysis.values_alignment)}</div>
        </Card>
        <Card className="p-3 border bg-slate-50">
          <div className="text-sm font-medium mb-1">Communication</div>
          <div className={`font-bold ${getRatingColor(analysis.communication)}`}>{String(analysis.communication)}</div>
        </Card>
      </div>
    </div>
  );
}

function GrowthPotentialCard({ analysis }: { analysis: GroupedMatchReport['shared']['growth_potential_analysis'] }) {
  const getRatingColor = (rating: string | number) => {
    const value = String(rating).toLowerCase();
    switch(value) {
      case 'excellent': return 'text-green-700';
      case 'good': return 'text-blue-700';
      case 'average': return 'text-amber-700';
      default: return 'text-gray-700';
    }
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-3 border bg-slate-50">
          <div className="text-sm font-medium mb-1">Learning Agility</div>
          <div className={`font-bold ${getRatingColor(analysis.learning_agility)}`}>{String(analysis.learning_agility)}</div>
        </Card>
        <Card className="p-3 border bg-slate-50">
          <div className="text-sm font-medium mb-1">Upskilling History</div>
          <div className={`font-bold ${getRatingColor(analysis.upskilling_history)}`}>{String(analysis.upskilling_history)}</div>
        </Card>
        <Card className="p-3 border bg-slate-50">
          <div className="text-sm font-medium mb-1">Motivation</div>
          <div className={`font-bold ${getRatingColor(analysis.motivation)}`}>{String(analysis.motivation)}</div>
        </Card>
      </div>
    </div>
  );
}

function TruncatedText({ text, maxLength = 160 }: { text: string; maxLength?: number }) {
  const [expanded, setExpanded] = useState(false);
  if (text.length <= maxLength) return <span>{text}</span>;
  return (
    <span>
      {expanded ? text : text.slice(0, maxLength) + '...'}
      <button
        className="ml-1 text-blue-600 hover:underline text-xs font-medium"
        onClick={() => setExpanded(e => !e)}
        type="button"
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
    </span>
  );
}

function ConclusionSectionStudent({ data }: { data: GroupedMatchReport['student_view'] }) {
  return (
    <Card className="mt-4 border-t-4 border-t-blue-500 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Lightbulb className="h-5 w-5" />
          Career Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Encouragement at the top, full width, always fully visible */}
        <div className="w-full mb-2">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <span className="text-sm text-green-800">{data.encouragement}</span>
          </div>
        </div>
        {/* Insights */}
        <div>
          <h4 className="font-medium mb-3 text-gray-800 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-500" />
            Key Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.career_insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded bg-slate-50 border border-slate-200">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  insight.type === "strength" ? "bg-green-500"
                  : insight.type === "opportunity" ? "bg-blue-500"
                  : insight.type === "warning" ? "bg-red-500"
                  : "bg-amber-500"
                }`} />
                <div>
                  <div className="font-medium text-gray-800 text-sm mb-0.5">{insight.title}</div>
                  <div className="text-xs text-gray-600 whitespace-pre-line">{insight.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Recommendations */}
        <div>
          <h4 className="font-medium mb-3 text-gray-800 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-purple-500" />
            Personalized Recommendations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.personalized_recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded bg-slate-50 border border-slate-200 flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="font-medium text-gray-800 text-sm">{rec.title}</div>
                  <Badge variant={rec.priority === "high" ? "destructive" : "secondary"} className={
                    rec.priority === "high" ? "bg-red-100 text-red-800 font-medium" : 
                    rec.priority === "medium" ? "bg-amber-100 text-amber-800 font-medium" :
                    "bg-blue-100 text-blue-800 font-medium"
                  }>
                    {rec.priority}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 whitespace-pre-line">{rec.description}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Next Career Goal at the bottom, full width, always fully visible */}
        <div className="w-full mt-2">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Target className="h-5 w-5 text-blue-600 shrink-0" />
            <span className="text-sm font-medium text-blue-800">Next Career Goal:</span>
            <span className="text-sm text-blue-700">{data.next_career_goal}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConclusionSectionEmployer({ data }: { data: GroupedMatchReport['employer_view'] }) {
  return (
    <Card className="mt-4 border-t-4 border-t-purple-500 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Building className="h-5 w-5" />
          Recruiter Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Flags */}
        {data.risk_flags.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-red-700 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Risk Flags
            </h4>
            <div className="space-y-2.5">
              {data.risk_flags.map((risk, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-1" />
                  <div>
                    <div className="font-medium text-red-800">{risk.title}</div>
                    <div className="text-sm text-red-700 mt-1">{risk.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Opportunity Flags */}
        {data.opportunity_flags.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-green-700 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" />
              Opportunity Flags
            </h4>
            <div className="space-y-2.5">
              {data.opportunity_flags.map((opp, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                  <div>
                    <div className="font-medium text-green-800">{opp.title}</div>
                    <div className="text-sm text-green-700 mt-1">{opp.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recruiter Recommendations */}
        {data.recruiter_recommendations.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-gray-800 flex items-center gap-1.5">
              <BarChart4 className="h-4 w-4 text-blue-600" />
              Recruiter Recommendations
            </h4>
            <div className="space-y-2.5">
              {data.recruiter_recommendations.map((rec, i) => (
                <div key={i} className="p-3 rounded border hover:shadow-sm transition-all duration-200">
                  <div className="font-medium text-gray-800">{rec.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{rec.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Bottom Section with Fit Summary and Follow-up Questions */}
        <div className="grid grid-cols-1 gap-4 pt-2">
        {/* Fit Summary */}
        {data.fit_summary && (
            <div className="p-4 bg-slate-50 rounded-lg border flex items-start gap-2">
              <User className="h-5 w-5 text-slate-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-slate-800 mb-1">Fit Summary</div>
                <div className="text-sm text-slate-700">{data.fit_summary}</div>
              </div>
          </div>
        )}
          
        {/* Follow-up Questions */}
        {data.follow_up_questions.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium mb-2 text-blue-800">Follow-up Questions</h4>
              <div className="space-y-2">
              {data.follow_up_questions.map((question, i) => (
                <div key={i} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">{i + 1}.</span>
                    <div className="text-sm text-blue-700">{question}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Enhanced AI Match Analysis Component
export function AIMatchAnalysis({ 
  data, 
  isLoading, 
  error, 
  processing, 
  audience 
}: { 
  data?: GroupedMatchReport | null; 
  isLoading?: boolean; 
  error?: string | null; 
  processing?: boolean; 
  audience: 'student' | 'employer'; 
}) {
  if (isLoading || processing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-800">Analyzing job match...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a moment as we process your profile against the job requirements</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 text-center border rounded-lg bg-red-50 border-red-200">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-red-500" />
        <p className="text-red-700 font-medium">Error loading analysis</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="p-6 text-center border rounded-lg bg-gray-50">
        <Target className="h-10 w-10 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-600 font-medium">No analysis data available</p>
        <p className="text-sm text-gray-500 mt-1">Try uploading your resume or selecting a different job</p>
      </div>
    );
  }
  
  const { shared, student_view, employer_view } = data;

  // --- New: Tab/Button state for analysis section ---
  const [selectedSection, setSelectedSection] = useState<'skills'|'experience'|'culture'|'growth'|'preferences'>('skills');

  // --- Button group for selecting analysis ---
  const sectionButtons = [
    { key: 'skills', label: 'Skills', icon: <Target className="h-5 w-5" /> },
    { key: 'experience', label: 'Experience', icon: <Briefcase className="h-5 w-5" /> },
    { key: 'culture', label: 'Culture Fit', icon: <User className="h-5 w-5" /> },
    { key: 'growth', label: 'Growth Potential', icon: <TrendingUp className="h-5 w-5" /> },
    { key: 'preferences', label: 'Preferences +', icon: <Lightbulb className="h-5 w-5" /> },
  ];

  // --- Render selected analysis section ---
  let analysisSection = null;
  if (selectedSection === 'skills') {
    analysisSection = (
      <Card className="mt-4 border-blue-200">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Target className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-base font-semibold">Skills Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-gray-800 text-sm">
          <div className="mb-2">{shared.skills_analysis.summary}</div>
          <SkillsCard analysis={shared.skills_analysis} />
        </CardContent>
      </Card>
    );
  } else if (selectedSection === 'experience') {
    analysisSection = (
      <Card className="mt-4 border-green-200">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Briefcase className="h-5 w-5 text-green-500" />
          <CardTitle className="text-base font-semibold">Experience Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-gray-800 text-sm">
          <div className="mb-2">{shared.experience_analysis.summary}</div>
          <ExperienceCard analysis={shared.experience_analysis} />
        </CardContent>
      </Card>
    );
  } else if (selectedSection === 'culture') {
    analysisSection = (
      <Card className="mt-4 border-purple-200">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <User className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-base font-semibold">Culture & Team Fit</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-gray-800 text-sm">
          <div className="mb-2">{shared.culture_fit_analysis.summary}</div>
          <CultureFitCard analysis={shared.culture_fit_analysis} />
        </CardContent>
      </Card>
    );
  } else if (selectedSection === 'growth') {
    analysisSection = (
      <Card className="mt-4 border-orange-200">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <CardTitle className="text-base font-semibold">Growth Potential</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-gray-800 text-sm">
          <div className="mb-2">{shared.growth_potential_analysis.summary}</div>
          <GrowthPotentialCard analysis={shared.growth_potential_analysis} />
        </CardContent>
      </Card>
    );
  } else if (selectedSection === 'preferences') {
    analysisSection = (
      <Card className="mt-4 border-pink-200">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Lightbulb className="h-5 w-5 text-pink-500" />
          <CardTitle className="text-base font-semibold">Preferences Match</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-gray-800 text-sm">
          <PreferencesCard preferences={shared.preferences_analysis} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* OVERALL SCORE */}
      <Card className="border-t-4 border-t-blue-500 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex gap-2 items-center text-lg text-blue-700">
            <Target className="h-6 w-6" />
            Overall Match Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center">
              <ScoreSummary 
                score={shared.overall_score} 
                label={
              shared.overall_score >= 80 ? "Excellent Match" :
              shared.overall_score >= 60 ? "Good Match" :
              "Needs Improvement"
                } 
              />
              <span className="mt-2 text-sm text-gray-600 max-w-[200px] text-center">
                {shared.overall_score >= 80 ? "You're an excellent fit for this role!" :
                 shared.overall_score >= 60 ? "You're a good match with some areas to improve" :
                 "With some targeted improvements, you could be a better fit"}
              </span>
            </div>
            <div className="flex flex-1 gap-4 justify-around flex-wrap">
              <ScoreSummary score={shared.skills_score} label="Skills" />
              <ScoreSummary score={shared.experience_score} label="Experience" />
              <ScoreSummary score={shared.culture_fit_score} label="Culture Fit" />
              <ScoreSummary score={shared.growth_potential_score} label="Growth Potential" />
              <ScoreSummary score={shared.preferences_bonus * 20} label="Preferences +" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Button group for analysis sections */}
      <div className="flex justify-center gap-2 mt-2">
        {sectionButtons.map(btn => (
          <button
            key={btn.key}
            onClick={() => setSelectedSection(btn.key as any)}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-colors font-medium text-sm
              ${selectedSection === btn.key
                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
            `}
            aria-pressed={selectedSection === btn.key}
            type="button"
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}
      </div>

      {/* Selected analysis section */}
      {analysisSection}

      {/* Audience-Specific Conclusion */}
      {audience === 'student' ? (
        <ConclusionSectionStudent data={student_view} />
      ) : (
        <ConclusionSectionEmployer data={employer_view} />
      )}
    </div>
  );
} 