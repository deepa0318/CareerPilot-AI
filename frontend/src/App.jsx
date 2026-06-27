import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import ToastContainer from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import InterviewCoach from './pages/InterviewCoach';
import SkillGap from './pages/SkillGap';
import CareerChat from './pages/CareerChat';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function AppContent() {
  const { toasts, toast, removeToast } = useToast();

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/resume" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ResumeAnalyzer />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/interview" element={
          <ProtectedRoute>
            <DashboardLayout>
              <InterviewCoach />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/skills" element={
          <ProtectedRoute>
            <DashboardLayout>
              <SkillGap />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/chat" element={
          <ProtectedRoute>
            <DashboardLayout>
              <CareerChat />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/profile" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/settings" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}