import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { EmployerLayout } from './components/layout/EmployerLayout';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { JobSearchPage } from './pages/jobs/JobSearchPage';
import { JobApplicationPage } from './pages/jobs/JobApplicationPage';
import { JobTracker } from './pages/student/JobTracker';
import { InterviewPage } from './pages/student/InterviewPage';
import { CareerFairPage } from './pages/student/CareerFairPage';
import { PostFairPage } from './pages/student/PostFairPage';
import { ResumeManagement } from './pages/student/ResumeManagement';
import { StudentProfile } from './pages/student/StudentProfile';
import { FindMentorsPage } from './pages/student/FindMentorsPage';
import { UniversityDashboard } from './pages/university/UniversityDashboard';
import { EmployerDashboard } from './pages/employer/EmployerDashboard';
import { CareerFairProvider } from './contexts/CareerFairContext';
import { EmployerFeedback } from "./pages/university/EmployerFeedback";
import { CareerFairOversight } from "./pages/university/CareerFairOversight";
import { RegistrationManagement } from "./pages/university/RegistrationManagement";
import { EmployerJobs } from "./pages/employer/EmployerJobs";
import { EmployerJobApplicants } from './pages/employer/jobs/EmployerJobApplicants';
import { CandidatesKanbanPage } from './pages/employer/CandidatesKanbanPage';
import { ResumeBank } from "./pages/employer/ResumeBank";
import { CompanyProfile } from "./pages/employer/settings/CompanyProfile";
import { TeamMembers } from "./pages/employer/settings/TeamMembers";
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { PasswordResetRequest } from './components/auth/PasswordResetRequest';
import { PasswordResetConfirm } from './components/auth/PasswordResetConfirm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import { ToastContainer } from './components/ui/Toast';
import { useToast } from './hooks/useToast';
import { EmailVerificationPage } from './components/auth/EmailVerificationPage';
import { CareerFairListPage } from './pages/student/CareerFairListPage';
import { FairManagementPage } from './pages/employer/fairs/FairManagementPage';
import { BoothSetupPage } from './pages/employer/fairs/BoothSetupPage';
import { FairDiscoveryPage } from './pages/employer/fairs/FairDiscoveryPage';

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
            <ProtectedRoute allowedRoles={['student']}>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="jobs" element={<JobSearchPage />} />
                  <Route path="jobs/:jobId/apply" element={<JobApplicationPage />} />
                  <Route path="applications" element={<JobTracker />} />
                  <Route path="interview/:applicationId" element={<InterviewPage />} />
                  <Route path="career-fairs" element={<CareerFairListPage />} />
                  <Route path="career-fairs/:fairId" element={<CareerFairPage />} />
                  <Route path="career-fairs/:fairId/follow-up" element={<PostFairPage />} />
                  <Route path="career-fairs/list" element={<Navigate to="/student/career-fairs" replace />} />
                  <Route path="portfolio" element={<StudentProfile />} />
                  <Route path="resume" element={<ResumeManagement />} />
                  <Route path="mentorship" element={<FindMentorsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
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
            <ProtectedRoute allowedRoles={['university']}>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<UniversityDashboard />} />
                  <Route path="employer-feedback" element={<EmployerFeedback />} />
                  <Route path="career-fair" element={<CareerFairOversight />} />
                  <Route path="registrations" element={<RegistrationManagement />} />
                  <Route path="profile" element={<ProfilePage />} />
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
            <ProtectedRoute allowedRoles={['employer']}>
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
                    <Route path="profile" element={<ProfilePage />} />
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