import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Eye,
  Download,
  RefreshCw,
  FileText,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Brain,
  Target,
  Calendar,
} from "lucide-react";
import api from "../../lib/axios";
import { jobService } from "@/services/jobService";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface CVData {
  id: string;
  original_filename: string;
  uploaded_at: string;
  is_parsed: boolean;
  is_active: boolean;
  file_size?: number;
  file_url?: string;
}

interface CVAnalysis {
  overall_score: number;
  strengths: string[];
  improvements: string[];
  keywords_found: string[];
  keywords_missing: string[];
  sections_analysis: {
    [key: string]: {
      score: number;
      feedback: string;
    };
  };
}

export function ResumeManagement() {
  const [currentCV, setCurrentCV] = useState<CVData | null>(null);
  const [cvAnalysis, setCVAnalysis] = useState<CVAnalysis | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [topMatches, setTopMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCurrentCV();
    loadTopMatches();
    // eslint-disable-next-line
  }, []);

  const loadCurrentCV = async () => {
    setLoading(true);
    setError("");
    setPdfError(false);
    try {
      const response = await api.get("/cv/active/");
      setCurrentCV(response.data);
      if (response.data?.id) {
        await loadCVAnalysis(response.data.id);
      } else {
        setCvAnalysisToNull();
      }
    } catch (err: any) {
      setCurrentCV(null);
      setCvAnalysisToNull();
      if (err.response?.status === 404) {
        // No resume uploaded yet (normal state)
      } else {
        setError("Failed to load CV information. Please refresh.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCVAnalysis = async (cvId: string) => {
    setError("");
    setPdfError(false);
    try {
      const response = await api.get(`/cv/analyze/?resume_id=${cvId}`);
      setCVAnalysis(response.data);
    } catch (err: any) {
      setCVAnalysis(null);
      if (err.response?.status === 400) {
        setError("Analysis unavailable for this resume. Please re-upload or try a different file.");
      } else {
        setError("Failed to analyze resume. Try again or upload a new one.");
      }
    }
  };

  const loadTopMatches = async () => {
    try {
      const response = await api.get("/jobs/top-matches/?limit=3");
      setTopMatches(response.data.top_matches || []);
    } catch {
      setTopMatches([]);
    }
  };

  // --- File Upload Logic (drag-drop & click) ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | File) => {
    let file: File | null = null;
    if (event instanceof File) {
      file = event;
    } else {
      file = event.target.files?.[0] ?? null;
    }
    setPdfError(false);
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file only.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/cv/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      setSuccess("CV uploaded successfully!");
      setCurrentCV(response.data.cv);
      setShowPreview(false);
      setPdfError(false);
      jobService.clearAIJobMatchCache();

      if (response.data.cv?.id) {
        await loadCVAnalysis(response.data.cv.id);
        await loadTopMatches();
      }
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      setCvAnalysisToNull();
      setError(err.response?.data?.error || "Failed to upload CV. Please ensure your file is a valid PDF.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setDragActive(false);
    }
  };

  // Drag and Drop Handlers
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  // --- Preview/Download/Analysis Actions ---
  const handleDownload = () => {
    if (currentCV?.id && currentCV.file_url && currentCV.is_parsed && !pdfError) {
      const link = document.createElement("a");
      link.href = `/api/cv/${currentCV.id}/download/`;
      link.download = currentCV.original_filename;
      link.click();
    }
  };

  const handleReanalyze = async () => {
    if (!currentCV?.id) return;
    setIsAnalyzing(true);
    setError("");
    try {
      jobService.clearAIJobMatchCache();
      await loadCVAnalysis(currentCV.id);
      await loadTopMatches();
      setSuccess("CV re-analyzed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to re-analyze CV.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "—";
    const k = 1024, sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const setCvAnalysisToNull = () => {
    setCVAnalysis(null);
  };

  const handlePdfError = () => {
    setPdfError(true);
    setError("Failed to preview or download the PDF. The file may be corrupted or unavailable.");
  };

  // --- PDF preview: get number of pages
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // --- Job Card click: Open job details in new tab
  const handleJobClick = (job: any) => {
    // If you use react-router, replace this with: navigate(`/jobs/${job.id}`)
    window.open(`/jobs/${job.id}`, "_blank");
  };

  // --- Main Render ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="text-center animate-pulse">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-indigo-600" />
          <p className="text-gray-500 font-medium">Loading your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-7">
      {/* Header */}
      <div className="bg-white rounded-2xl px-6 py-5 shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gray-50">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-7 w-7 text-indigo-600" />
            Resume Management
          </h1>
          <p className="mt-1 text-gray-500 text-base">
            Manage your resume and get <b>AI-powered insights</b>
          </p>
        </div>
        {cvAnalysis && (
          <div className={`px-4 py-2 rounded-full text-base font-semibold shadow ${getScoreBgColor(cvAnalysis.overall_score)} ${getScoreColor(cvAnalysis.overall_score)}`}>
            <Star className="h-5 w-5 inline-block mr-1" />
            {cvAnalysis.overall_score}% Resume Score
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-700 font-medium">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700 font-medium">{success}</span>
        </div>
      )}

      {/* PDF Preview Modal (All Pages) */}
      {showPreview && currentCV?.file_url && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-[95vw] p-4 relative overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 p-1 text-gray-400 hover:text-indigo-600" onClick={() => setShowPreview(false)}>
              <svg width="26" height="26" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="2" /></svg>
            </button>
            <Document
              file={currentCV.file_url}
              loading={<p className="text-center py-6 text-lg">Loading preview…</p>}
              onLoadError={handlePdfError}
              onSourceError={handlePdfError}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              {numPages && Array.from({ length: numPages }, (_, i) => (
                <Page key={i + 1} pageNumber={i + 1} width={700} className="mx-auto mb-5 border rounded" />
              ))}
            </Document>
            {pdfError && (
              <div className="mt-6 text-center text-red-500">
                <AlertCircle className="inline-block mr-1" />
                Unable to display preview. File may be corrupted.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
        {/* Resume Card (Main) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Your Active Resume
            </h2>
            {currentCV ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50 p-5 rounded-lg border">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-indigo-100 rounded-lg flex items-center">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{currentCV.original_filename}</h3>
                    <div className="mt-1 text-gray-500 text-sm space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Uploaded: {formatDate(currentCV.uploaded_at)}</span>
                      </div>
                      {currentCV.file_size && (
                        <div>Size: {formatFileSize(currentCV.file_size)}</div>
                      )}
                    </div>
                    <div className="flex items-center mt-2 gap-3">
                      {currentCV.is_parsed ? (
                        <span className="flex items-center text-green-600 font-medium gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Processed & Ready
                        </span>
                      ) : (
                        <span className="flex items-center text-yellow-600 gap-1 font-medium">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Processing… <span className="ml-1 animate-pulse">(Please wait)</span>
                        </span>
                      )}
                      {pdfError && (
                        <span className="flex items-center text-red-500 gap-1 font-medium">
                          <AlertCircle className="h-4 w-4" />
                          Corrupted PDF
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-center md:items-end">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreview(true)}
                      className="p-2 rounded-lg hover:bg-indigo-50 transition"
                      title="Preview Resume"
                      disabled={!currentCV.is_parsed || !currentCV.file_url || pdfError || !!error}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 rounded-lg hover:bg-green-50 transition"
                      title="Download Resume"
                      disabled={!currentCV.is_parsed || pdfError}
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleReanalyze}
                      disabled={isAnalyzing || !currentCV.is_parsed || pdfError}
                      className="p-2 rounded-lg hover:bg-blue-50 transition disabled:opacity-60"
                      title="Re-analyze Resume"
                    >
                      <RefreshCw className={`h-5 w-5 ${isAnalyzing ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="mb-2">No resume uploaded yet</div>
                <div className="text-sm text-gray-400">Upload your resume below to get started.</div>
              </div>
            )}

            {/* Upload Section */}
            <div className="mt-7 pt-7 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentCV ? "Upload New Resume" : "Upload Your Resume"}
              </h3>
              <div
                className={`border-2 border-dashed rounded-xl p-7 text-center hover:border-indigo-400 transition-colors bg-gray-50 relative ${dragActive ? "border-indigo-500 bg-indigo-50" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{ cursor: isUploading ? "not-allowed" : "pointer" }}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={e => handleFileUpload(e)}
                  disabled={isUploading}
                  className="hidden"
                  ref={fileInputRef}
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className={`cursor-pointer block ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                  tabIndex={0}
                  onKeyDown={e => (e.key === "Enter" ? fileInputRef.current?.click() : undefined)}
                >
                  <Upload className="h-9 w-9 text-gray-400 mx-auto mb-2" />
                  <div className="font-medium text-gray-600 mb-2">
                    {isUploading
                      ? "Uploading..."
                      : "Click to upload or drag and drop your resume"}
                  </div>
                  <div className="text-xs text-gray-400">PDF files only, max 10MB</div>
                  {dragActive && (
                    <div className="absolute inset-0 rounded-xl bg-indigo-100/30 border-2 border-indigo-500 border-dashed flex items-center justify-center z-10 pointer-events-none">
                      <span className="text-indigo-600 text-lg font-bold">Drop to upload!</span>
                    </div>
                  )}
                </label>
                {isUploading && (
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-500 mt-2">{uploadProgress}% uploaded</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Analysis Card */}
          {cvAnalysis && (
            <div className="bg-white rounded-2xl p-6 shadow border border-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-600" />
                AI Resume Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(cvAnalysis.overall_score)}`}>
                    {cvAnalysis.overall_score}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {cvAnalysis.strengths?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Strengths</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {cvAnalysis.keywords_found?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Keywords Found</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {cvAnalysis.strengths?.slice(0, 3).map((strength, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-yellow-600" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {cvAnalysis.improvements?.slice(0, 3).map((improvement, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Job Matches Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              Top Job Matches
            </h2>
            {topMatches.length > 0 ? (
              <div className="space-y-4">
                {topMatches.map((match: any, idx) => (
                  <div
                    key={idx}
                    className="p-4 border rounded-lg hover:border-indigo-300 bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleJobClick(match)}
                    title="View job details"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-base">
                        {match.title}
                      </h3>
                      {typeof match.vector_score === "number" && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${getScoreBgColor(
                            match.vector_score
                          )} ${getScoreColor(match.vector_score)}`}
                        >
                          {match.vector_score}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{match.company?.name}</p>
                    <p className="text-xs text-gray-500">{match.location}</p>
                    {match.key_skills && match.key_skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {match.key_skills.slice(0, 3).map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Target className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                <div className="text-gray-400">Upload a resume to see job matches</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
