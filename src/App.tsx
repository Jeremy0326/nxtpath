import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { EmployerLayout } from './components/layout/EmployerLayout';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { JobSearchPage } from './pages/student/JobSearchPage';
import { JobApplicationPage } from './pages/student/JobApplicationPage';
import { JobTracker } from './pages/student/JobTracker';
import { InterviewPage } from './pages/student/InterviewPage';
import { StudentCareerFairs } from "./pages/student/StudentCareerFairs";
import { StudentFairDetails } from "./pages/student/StudentFairDetails";
import { ResumeManagement } from './pages/student/ResumeManagement';
import { StudentProfile } from './pages/student/StudentProfile';
import { FindMentorsPage } from './pages/student/FindMentorsPage';
import { UniversityDashboard } from './pages/university/UniversityDashboard';
import { UniversityProfile } from './pages/university/UniversityProfile';
import { EmployerDashboard } from './pages/employer/EmployerDashboard';
import { EmployerProfile } from './pages/employer/EmployerProfile';
import { CareerFairProvider } from './contexts/CareerFairContext';
import { CareerFairManagement } from "./pages/university/CareerFairManagement";
import { EmployerJobs } from "./pages/employer/EmployerJobs";
import { EmployerJobApplicants } from './pages/employer/EmployerJobApplicants';
import { CandidatesKanbanPage } from './pages/employer/CandidatesKanbanPage';
import { ResumeBank } from "./pages/employer/ResumeBank";
import { CompanyProfile } from "./pages/employer/CompanyProfile";
import { TeamMembers } from "./pages/employer/TeamMembers";
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { PasswordResetRequest } from './components/auth/PasswordResetRequest';
import { PasswordResetConfirm } from './components/auth/PasswordResetConfirm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './pages/landing/LandingPage';
import { ToastContainer } from './components/ui/Toast';
import { useToast } from './hooks/useToast';
import { EmailVerificationPage } from './components/auth/EmailVerificationPage';
import { FairManagementPage } from './pages/employer/FairManagementPage';
import { BoothSetupPage } from './pages/employer/BoothSetupPage';
import { FairDiscoveryPage } from './pages/employer/FairDiscoveryPage';
import { UserRole } from './types/enums';
import AIInsightsPage from "./pages/university/AIInsights";
import Students from "./pages/university/Students";
import { Staff } from "./pages/university/Staff";
import UniversityManagement from "./pages/university/UniversityManagement";
import { FairManagement } from "./pages/university/FairManagement";
import { RegistrationManagement } from "./pages/university/RegistrationManagement";
import { FairReports } from "./pages/university/FairReports";
import { FairAnalytics } from "./pages/university/FairAnalytics";
import { BoothManagement } from "./pages/university/BoothManagement";
import { StudentInterests } from "./pages/university/StudentInterests";

function AppRoutes() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<PasswordResetRequest />} />
        <Route path="/reset-password/:uidb64/:token" element={<PasswordResetConfirm />} />
        <Route path="/verify-email/:uidb64/:token" element={<EmailVerificationPage />} />

        {/* Protected Student Routes */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="jobs" element={<JobSearchPage />} />
                  <Route path="jobs/:jobId/apply" element={<JobApplicationPage />} />
                  <Route path="applications" element={<JobTracker />} />
                  <Route path="interview/:applicationId" element={<InterviewPage />} />
                  <Route path="career-fairs" element={<StudentCareerFairs />} />
                  <Route path="career-fairs/:fairId" element={<StudentFairDetails />} />
                  <Route path="career-fairs/list" element={<Navigate to="/student/career-fairs" replace />} />
                  <Route path="portfolio" element={<StudentProfile />} />
                  <Route path="resume" element={<ResumeManagement />} />
                  <Route path="mentorship" element={<FindMentorsPage />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected University Routes */}
        <Route
          path="/university/*"
          element={
            <ProtectedRoute allowedRoles={[UserRole.UNIVERSITY]}>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<UniversityDashboard />} />
                  <Route path="ai-insights" element={<AIInsightsPage />} />
                  <Route path="students" element={<Students />} />
                  <Route path="staff" element={<Staff />} />
                  <Route path="career-fair" element={<CareerFairManagement />} />
                  <Route path="fairs/:fairId/manage" element={<FairManagement />} />
                  <Route path="fairs/:fairId/booths" element={<BoothManagement />} />
                  <Route path="fairs/:fairId/registrations" element={<RegistrationManagement />} />
                  <Route path="fairs/:fairId/interests" element={<StudentInterests />} />
                  <Route path="fairs/:fairId/reports" element={<FairReports />} />
                  <Route path="fairs/:fairId/analytics" element={<FairAnalytics />} />
                  <Route path="management" element={<UniversityManagement />} />
                  <Route path="profile" element={<UniversityProfile />} />
                  <Route path="interests" element={<StudentInterests />} />
                  <Route path="*" element={<Navigate to="/university/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Employer Routes */}
        <Route
          path="/employer/*"
          element={
            <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
              <CareerFairProvider>
                <EmployerLayout>
                  <Routes>
                    <Route index element={<Navigate to="dashboard" />} />
                    <Route path="dashboard" element={<EmployerDashboard />} />
                    <Route path="jobs" element={<EmployerJobs />} />
                    <Route path="jobs/:jobId/applicants" element={<EmployerJobApplicants />} />
                    <Route path="candidates" element={<CandidatesKanbanPage />} />
                    <Route path="resumes" element={<ResumeBank />} />
                    <Route path="fairs" element={<FairManagementPage />} />
                    <Route path="fairs/discover" element={<FairDiscoveryPage />} />
                    <Route path="fairs/:fairId/booth/:boothId" element={<BoothSetupPage />} />
                    <Route path="settings/profile" element={<CompanyProfile />} />
                    <Route path="settings/team" element={<TeamMembers />} />
                    <Route path="profile" element={<EmployerProfile />} />
                    <Route path="*" element={<Navigate to="/employer/dashboard" replace />} />
                  </Routes>
                </EmployerLayout>
              </CareerFairProvider>
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}