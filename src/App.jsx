import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import SignUp from './pages/auth/SignUp'
import Login from './pages/auth/Login'
import Onboarding from './pages/onboarding/Onboarding'
import Dashboard from './pages/Dashboard'
import CreateCampaign from './pages/CreateCampaign'
import CreateBlast from './pages/CreateBlast'
import History from './pages/History'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import SidebarTest from './components/layout/SidebarTest'
import TemplateDemo from './pages/TemplateDemoRefactored'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  // TEMPORARY: Log reminder to revert routing after client demo
  console.warn('TEMPORARY: Default route is set to /template-demo for client presentation. Remember to revert to /login after demo!');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sidebar-test" element={<SidebarTest />} />
            <Route path="/template-demo" element={<TemplateDemo />} />
            <Route
              path="/onboarding/*"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireOnboarding>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-campaign"
              element={
                <ProtectedRoute requireOnboarding>
                  <CreateCampaign />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-blast"
              element={
                <ProtectedRoute requireOnboarding>
                  <CreateBlast />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute requireOnboarding>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute requireOnboarding>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireOnboarding>
                  <Profile />
                </ProtectedRoute>
              }
            />
            {/* TEMPORARY: Redirecting to template-demo for client presentation - REVERT TO "/login" AFTER DEMO */}
            <Route path="/" element={<Navigate to="/template-demo" replace />} />
          </Routes>
          </Router>
          <Toaster position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
