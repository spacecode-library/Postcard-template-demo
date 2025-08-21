import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../contexts/AuthContext'
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn'
import { Eye, EyeOff } from 'lucide-react'
import './auth.css'

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register: signUp } = useAuth()
  const navigate = useNavigate()
  const { renderGoogleButton } = useGoogleSignIn()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
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
      await signUp(data)
      navigate('/onboarding')
    } catch (error) {
      console.error('Signup error:', error)
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
            <h1>Create your account</h1>
            <p>Start sending smart postcards today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-section">
              <div className="input-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  {...register('firstName')}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName.message}</span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  {...register('lastName')}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName.message}</span>
                )}
              </div>

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
                  <span className="password-hint">8+ characters</span>
                </div>
                <div className="password-input-container">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
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
            </div>

            <div className="button-section">
              <button
                type="submit"
                className={`primary-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>

              <div className="divider">
                <span>or</span>
              </div>

              <div id="google-signin-button" style={{ width: '100%' }}></div>
            </div>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp