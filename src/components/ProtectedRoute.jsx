import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, requireOnboarding = false, requireEmailVerification = false }) => {
  const { user, loading, onboardingCompleted, currentOnboardingStep, onboardingLoading } = useAuth()

  // Show loading while checking authentication or onboarding status
  if (loading || onboardingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if email verification is required and user hasn't verified
  if (requireEmailVerification && !user.email_confirmed_at) {
    return <Navigate to="/verify-email" replace />
  }

  // Check if onboarding is required and user hasn't completed it
  if (requireOnboarding && !onboardingCompleted) {
    // Redirect to current onboarding step
    const step = currentOnboardingStep || 1
    return <Navigate to={`/onboarding/step${step}`} replace />
  }

  return children
}

export default ProtectedRoute