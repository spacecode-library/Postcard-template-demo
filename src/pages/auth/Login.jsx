import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../contexts/AuthContext'
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn'
import { Eye, EyeOff } from 'lucide-react'
import './auth.css'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const { renderGoogleButton } = useGoogleSignIn()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  useEffect(() => {
    // Render Google button after component mounts
    const timer = setTimeout(() => {
      renderGoogleButton('google-signin-button')
    }, 100)
    return () => clearTimeout(timer)
  }, [renderGoogleButton])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await login(data.email, data.password)
      const loggedInUser = response.data.user
      if (!loggedInUser.onboardingCompleted) {
        navigate('/onboarding')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <div className="logo-placeholder">
            <span>Postcard</span>
          </div>
        </div>

        <div className="auth-content">
          <div className="auth-header">
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-section">
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  {...register('email')}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && (
                  <span className="error-message">{errors.email.message}</span>
                )}
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot password?
                  </Link>
                </div>
                <div className="password-input-container">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className={errors.password ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password.message}</span>
                )}
              </div>

              <div className="checkbox-group">
                <input
                  id="rememberMe"
                  type="checkbox"
                  {...register('rememberMe')}
                />
                <label htmlFor="rememberMe">Remember me for 30 days</label>
              </div>
            </div>

            <div className="button-section">
              <button
                type="submit"
                className={`primary-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>

              <div className="divider">
                <span>or</span>
              </div>

              <div id="google-signin-button" style={{ width: '100%' }}></div>
            </div>
          </form>

          <div className="auth-footer">
            <span>Don't have an account?</span>
            <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login