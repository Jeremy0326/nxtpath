import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Target, Users, DollarSign, TrendingUp, 
  BarChart3, PieChart, Activity, Zap, Info
} from 'lucide-react';
import { universityService, AIInsights } from '../../services/universityService';
import { useToast } from '../../hooks/useToast';

function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
}

const TABS = [
  { key: 'skills', label: 'Skill Distribution' },
  { key: 'gaps', label: 'Skill Gaps' },
  { key: 'paths', label: 'Career Paths' },
  { key: 'salary', label: 'Salary Stats' },
];

const TableHeader = ({ columns }: { columns: string[] }) => (
  <thead className="sticky top-0 bg-white z-10">
    <tr>
      {columns.map(col => (
        <th key={col} className="px-3 py-2 text-xs font-semibold text-gray-500 text-left whitespace-nowrap border-b border-gray-200">{col}</th>
      ))}
    </tr>
  </thead>
);

const TableCell = ({ children, tooltip }: { children: React.ReactNode, tooltip?: string }) => (
  <td className="px-3 py-2 whitespace-normal text-sm text-gray-700 max-w-[400px] overflow-hidden text-ellipsis" title={tooltip} style={{wordBreak: 'break-word'}}>{children}</td>
);

// Update AIInsights interface for variants
// (in src/services/universityService.ts, but for now, extend here)
type SkillWithVariants = {
  skill: string;
  students: number;
  averageScore: number;
  variants?: string[];
};
type GapWithVariants = {
  skill: string;
  demand: number;
  supply: number;
  gap: number;
  variants?: string[];
};
type PathWithVariants = {
  path: string;
  students: number;
  variants?: string[];
};

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('skills');
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllGaps, setShowAllGaps] = useState(false);
  const [showAllPaths, setShowAllPaths] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const data = await universityService.getAIInsights();
      console.log('AI Insights:', data);
      if (data.topSkills) console.log('Skill count:', data.topSkills.length);
      if (data.skillGaps) console.log('Skill gap count:', data.skillGaps.length);
      if (data.careerPaths) console.log('Career path count:', data.careerPaths.length);
      setInsights(data);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load AI insights data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No AI insights available</h3>
        <p className="text-gray-600">AI insights will appear once students have completed AI match reports.</p>
      </div>
    );
  }

  // --- Tab Content Renderers ---
  const renderSkillDistribution = () => {
    const skills = (insights.topSkills as SkillWithVariants[]) || [];
    const maxStudents = Math.max(...skills.map(s => s.students), 1);
    const displaySkills = showAllSkills ? skills : skills.slice(0, 10);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            Skill Distribution
            <span className="ml-2" title="Shows the most common skills among students. Hover for variants."><Info className="h-4 w-4 text-gray-400" /></span>
          </CardTitle>
          <p className="text-xs text-gray-500 mt-1">Shows the most common, normalized skills among students. Hover skill for variants.</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <TableHeader columns={["Skill", "Students", "Bar"]} />
              <tbody>
                {displaySkills.map(skill => (
                  <tr key={skill.skill} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell tooltip={skill.variants && skill.variants.length > 1 ? `Variants: ${skill.variants.join(', ')}` : undefined}>
                      {skill.skill}
                    </TableCell>
                    <TableCell>{skill.students}</TableCell>
                    <TableCell>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(skill.students / maxStudents) * 100}%` }}
                        />
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {skills.length > 10 && (
            <button
              className="mt-2 text-indigo-600 hover:underline text-xs flex items-center gap-1"
              onClick={() => setShowAllSkills(v => !v)}
            >
              {showAllSkills ? 'Show Top 10' : `Show All (${skills.length})`}
            </button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSkillGaps = () => {
    const gaps = (insights.skillGaps as GapWithVariants[]) || [];
    const maxDemand = Math.max(...gaps.map(g => g.demand), 1);
    const displayGaps = showAllGaps ? gaps : gaps.slice(0, 10);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            Skill Gaps Analysis
            <span className="ml-2" title="Shows the gap between industry demand and student supply for each skill. Hover for variants."><Info className="h-4 w-4 text-gray-400" /></span>
          </CardTitle>
          <p className="text-xs text-gray-500 mt-1">Shows the gap between industry demand and student supply for each normalized skill. Hover skill for variants.</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <TableHeader columns={["Skill", "Demand", "Supply", "Gap", "Bar"]} />
              <tbody>
                {displayGaps.map(gap => (
                  <tr key={gap.skill} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell tooltip={gap.variants && gap.variants.length > 1 ? `Variants: ${gap.variants.join(', ')}` : undefined}>
                      {gap.skill}
                    </TableCell>
                    <TableCell>{gap.demand}</TableCell>
                    <TableCell>{gap.supply}</TableCell>
                    <TableCell>{gap.gap}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className="w-1/2 bg-blue-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(gap.demand / maxDemand) * 100}%` }}
                            title={`Industry Demand: ${gap.demand}`}
                          />
                        </div>
                        <div className="w-1/2 bg-green-100 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(gap.supply / maxDemand) * 100}%` }}
                            title={`Student Supply: ${gap.supply}`}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {gaps.length > 10 && (
            <button
              className="mt-2 text-indigo-600 hover:underline text-xs flex items-center gap-1"
              onClick={() => setShowAllGaps(v => !v)}
            >
              {showAllGaps ? 'Show Top 10' : `Show All (${gaps.length})`}
            </button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCareerPaths = () => {
    const paths = (insights.careerPaths as PathWithVariants[]) || [];
    const displayPaths = showAllPaths ? paths : paths.slice(0, 10);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Career Path Distribution
            <span className="ml-2" title="Shows the most common, normalized career paths. Hover for variants."><Info className="h-4 w-4 text-gray-400" /></span>
          </CardTitle>
          <p className="text-xs text-gray-500 mt-1">Shows the most common, normalized career paths. Hover path for variants.</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <TableHeader columns={["Career Path", "Students"]} />
              <tbody>
                {displayPaths.map(path => (
                  <tr key={path.path} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell tooltip={path.variants && path.variants.length > 1 ? `Variants: ${path.variants.join(', ')}` : undefined}>
                      {path.path}
                    </TableCell>
                    <TableCell>{path.students}</TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {paths.length > 10 && (
            <button
              className="mt-2 text-indigo-600 hover:underline text-xs flex items-center gap-1"
              onClick={() => setShowAllPaths(v => !v)}
            >
              {showAllPaths ? 'Show Top 10' : `Show All (${paths.length})`}
            </button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSalaryStats = () => {
    const stats = insights.salaryStats || {};
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-indigo-600" />
            Salary Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-gray-700">Average Salary:</span>
              <span className="text-lg font-bold text-purple-700">RM {stats.average || 0}</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-gray-700">Minimum Salary:</span>
              <span className="text-lg font-bold text-purple-700">RM {stats.min || 0}</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-gray-700">Maximum Salary:</span>
              <span className="text-lg font-bold text-purple-700">RM {stats.max || 0}</span>
            </div>
            {stats.distribution && stats.distribution.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Salary Distribution:</div>
                <div className="space-y-1">
                  {stats.distribution.map((d: any) => (
                    <div key={d.range} className="flex items-center gap-2">
                      <span className="w-24 text-xs text-gray-500">{d.range}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(d.count / Math.max(...stats.distribution.map((x: any) => x.count), 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 min-w-[24px] text-right">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // --- Main Render ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Match Insights</h1>
        <p className="text-gray-600 mt-2">Comprehensive analysis of student AI match reports and skill development</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sticky top-0 bg-white z-10 pb-2">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Reports</p>
                <p className="text-2xl font-bold text-blue-900">{insights.totalReports}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Top Skills</p>
                <p className="text-2xl font-bold text-green-900">{insights.topSkills.length}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Career Paths</p>
                <p className="text-2xl font-bold text-purple-900">{insights.careerPaths.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg Salary</p>
                <p className="text-2xl font-bold text-orange-900">
                  RM {insights.salaryStats?.average || 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${activeTab === tab.key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-indigo-600'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'skills' && renderSkillDistribution()}
      {activeTab === 'gaps' && renderSkillGaps()}
      {activeTab === 'paths' && renderCareerPaths()}
      {activeTab === 'salary' && renderSalaryStats()}
    </div>
  );
} 