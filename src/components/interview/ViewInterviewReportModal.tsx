import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2,
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  X,
  Loader2,
  ServerCrash,
  TrendingUp,
  Users,
  MessageCircle,
  Code,
  Target,
  Lightbulb,
  Clock,
  Star
} from 'lucide-react';
import { jobService } from '../../services/jobService';
import type { AIInterviewReportData } from '../../types/analysis';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ViewInterviewReportModalProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewInterviewReportModal({ applicationId, isOpen, onClose }: ViewInterviewReportModalProps) {
  const [report, setReport] = useState<AIInterviewReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!applicationId || !isOpen) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await jobService.getInterviewReport(applicationId, 'employer');
        setReport(data);
      } catch (err) {
        setError("Failed to load the interview report.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [applicationId, isOpen]);

  const handleRetry = async () => {
    if (!applicationId) return;
    setIsRetrying(true);
    setError(null);
    try {
      await jobService.generateInterviewReport(applicationId);
      const data = await jobService.getInterviewReport(applicationId, 'employer');
      setReport(data);
    } catch (err) {
      setError("Failed to regenerate the interview report. Please try again.");
    } finally {
      setIsRetrying(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Star className="h-4 w-4" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4" />;
    if (score >= 40) return <Target className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getNextStepColor = (step: string) => {
    switch (step?.toLowerCase()) {
      case 'hire':
      case 'offer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'interview':
      case 'further interview':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reject':
      case 'not suitable':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogTitle>Loading Interview Report</DialogTitle>
          <DialogDescription>Please wait while we load the interview report.</DialogDescription>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            <p className="mt-4 text-lg text-gray-700">Loading interview report...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !report) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogTitle>Error Loading Report</DialogTitle>
          <DialogDescription>There was an error loading the interview report.</DialogDescription>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ServerCrash className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="mt-4 text-xl font-semibold">Could not load report</h3>
            <p className="mt-2 text-gray-600">{error || "An unknown error occurred."}</p>
            <Button 
              onClick={handleRetry} 
              className="mt-4"
              variant="outline"
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                'Regenerate Report'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <BarChart2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Interview Report</h2>
                <div className="text-indigo-100 text-sm">
                  Generated on {report.created_at ? new Date(report.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '...'}
                </div>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Error Report Warning */}
          {report.summary === "Error generating report." && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ServerCrash className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800">Report Generation Failed</h4>
                    <p className="text-sm text-red-600">The AI interview report failed to generate properly.</p>
                  </div>
                </div>
                <Button 
                  onClick={handleRetry} 
                  size="sm"
                  variant="outline"
                  disabled={isRetrying}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    'Regenerate'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
          
          {/* Summary Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg text-gray-800">
                  <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{report.summary}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Score Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-600">Fit Score</span>
                  </div>
                  {getScoreIcon(report.fit_score || 0)}
                </div>
                <div className="text-3xl font-bold text-indigo-600">{report.fit_score ?? 'N/A'}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((report.fit_score || 0), 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Culture Fit</span>
                  </div>
                  {getScoreIcon(report.culture_fit_score || 0)}
                </div>
                <div className="text-3xl font-bold text-green-600">{report.culture_fit_score ?? 'N/A'}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((report.culture_fit_score || 0), 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Communication</span>
                  </div>
                  {getScoreIcon(report.communication_score || 0)}
                </div>
                <div className="text-3xl font-bold text-blue-600">{report.communication_score ?? 'N/A'}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((report.communication_score || 0), 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Code className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Technical Depth</span>
                  </div>
                  {getScoreIcon(report.technical_depth_score || 0)}
                </div>
                <div className="text-3xl font-bold text-purple-600">{report.technical_depth_score ?? 'N/A'}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((report.technical_depth_score || 0), 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Strengths & Weaknesses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg text-green-700">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.strengths?.map((strength, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-700 leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.weaknesses?.map((weakness, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-700 leading-relaxed">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Next Steps & Rationale */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Next Step */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg text-gray-800">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  Recommended Action
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Badge className={`px-3 py-1 text-sm font-medium ${getNextStepColor(report.suggested_next_step || '')}`}>
                    {report.suggested_next_step}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Rationale</h4>
                  <p className="text-gray-700 leading-relaxed">{report.rationale}</p>
                </div>
              </CardContent>
            </Card>

            {/* Follow-up Questions */}
            {report.follow_up_questions && report.follow_up_questions.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg text-gray-800">
                    <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                    Follow-up Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.follow_up_questions.map((question, i) => (
                      <div key={i} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{question}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
 
 
 
 
 
 
 
 
 
 
 