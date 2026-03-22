import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext.jsx'
import { ToastProvider } from '@/components/Toast.jsx'
import ProtectedRoute from '@/components/ProtectedRoute.jsx'

import { HomePage } from '@/pages/home/HomePage.jsx'
import LoginPage from '@/pages/auth/Login.jsx'
import RegisterPage from '@/pages/auth/Register.jsx'
import { UnauthorizedPage } from '@/pages/auth/UnauthorizedPage.jsx'

import StudentLayout from '@/layouts/StudentLayout.jsx'
import StudentDashboard from '@/pages/student/Dashboard.jsx'
import StudentApplications from '@/pages/student/Applications.jsx'
import StudentLogbook from '@/pages/student/Logbook.jsx'
import StudentProfile from '@/pages/student/Profile.jsx'

import SupervisorLayout from '@/layouts/SupervisorLayout.jsx'
import SupervisorDashboard from '@/pages/supervisor/Dashboard.jsx'
import SupervisorStudents from '@/pages/supervisor/Students.jsx'
import SupervisorApprovals from '@/pages/supervisor/Approvals.jsx'
import SupervisorReports from '@/pages/supervisor/Reports.jsx'
import StudentDetail from '@/pages/supervisor/StudentDetail.jsx'
import ApprovalDetail from '@/pages/supervisor/ApprovalDetail.jsx'
import ReportDetail from '@/pages/supervisor/ReportDetail.jsx'

import CompanyLayout from '@/layouts/CompanyLayout.jsx'
import CompanyDashboard from '@/pages/company/Dashboard.jsx'
import CompanyPostInternship from '@/pages/company/PostInternship.jsx'
import CompanyInternships from '@/pages/company/Internships.jsx'
import CompanyApplicants from '@/pages/company/Applicants.jsx'
import CompanyApplicantDetail from '@/pages/company/ApplicantDetail.jsx'
import CompanyMessages from '@/pages/company/Messages.jsx'
import CompanySettings from '@/pages/company/Settings.jsx'

import { CoordinatorDashboardPage } from '@/pages/coordinator/CoordinatorDashboardPage.jsx'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage.jsx'

function RootRedirect() {
  const { role } = useAuth()
  const routes: Record<string, string> = {
    student: '/student/dashboard',
    supervisor: '/supervisor/dashboard',
    coordinator: '/coordinator/dashboard',
    company: '/company/dashboard',
    admin: '/admin/dashboard',
  }
  return <Navigate to={(role && routes[role]) || '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Student */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<StudentLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="applications" element={<StudentApplications />} />
                <Route path="logbook" element={<StudentLogbook />} />
                <Route path="profile" element={<StudentProfile />} />
              </Route>
            </Route>

            {/* Supervisor */}
            <Route element={<ProtectedRoute allowedRoles={['supervisor']} />}>
              <Route path="/supervisor" element={<SupervisorLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<SupervisorDashboard />} />
                <Route path="students" element={<SupervisorStudents />} />
                <Route path="students/:studentId" element={<StudentDetail />} />
                <Route path="approvals" element={<SupervisorApprovals />} />
                <Route path="approvals/:approvalId" element={<ApprovalDetail />} />
                <Route path="reports" element={<SupervisorReports />} />
                <Route path="reports/:reportId" element={<ReportDetail />} />
              </Route>
            </Route>

            {/* Company */}
            <Route element={<ProtectedRoute allowedRoles={['company']} />}>
              <Route path="/company" element={<CompanyLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<CompanyDashboard />} />
                <Route path="post-internship" element={<CompanyPostInternship />} />
                <Route path="internships" element={<CompanyInternships />} />
                <Route path="applicants" element={<CompanyApplicants />} />
                <Route path="applicants/:applicationId" element={<CompanyApplicantDetail />} />
                <Route path="messages" element={<CompanyMessages />} />
                <Route path="settings" element={<CompanySettings />} />
              </Route>
            </Route>

            {/* Coordinator */}
            <Route element={<ProtectedRoute allowedRoles={['coordinator']} />}>
              <Route path="/coordinator">
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<CoordinatorDashboardPage />} />
              </Route>
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin">
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
              </Route>
            </Route>

            {/* Redirect /dashboard to role-specific dashboard */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<RootRedirect />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
