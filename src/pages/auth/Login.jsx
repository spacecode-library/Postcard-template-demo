import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import Logo from '../../components/common/Logo';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/onboarding');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleLogin('mock-google-token');
      navigate('/onboarding');
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    // Handle forgot password
    console.log('Forgot password clicked');
  };

  const testimonial = {
    text: "We've been using 0 to kick start every new project and can't imagine working without it. It's incredible.",
    author: "Fleur Cook",
    title: "Founder, Catalog",
    company: "Web Design Agency"
  };

  return (
    <AuthLayout testimonial={testimonial}>
      <div className="login-form-container">
        <Logo variant="auth" className="login-logo" />
          
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Welcome back! Please enter your details.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  {showPassword ? (
                    <path d="M2.5 10C2.5 10 5 4 10 4C15 4 17.5 10 17.5 10C17.5 10 15 16 10 16C5 16 2.5 10 2.5 10Z" stroke="currentColor" strokeWidth="1.5"/>
                  ) : (
                    <path d="M13.65 13.65C12.79 14.51 11.61 15 10.35 15C7.96 15 6 13.04 6 10.65C6 9.39 6.49 8.21 7.35 7.35M8.5 3.13C9 3.04 9.5 3 10 3C15 3 17.5 9 17.5 9C17.5 9 16.67 10.94 15.5 12.5M8.5 16.87C5.5 15.5 3.5 11.5 2.5 9C2.5 9 3.33 7.06 4.5 5.5M2 2L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="checkbox-input"
              />
              <span>Remember for 30 days</span>
            </label>
            <a href="#" onClick={handleForgotPassword} className="forgot-link">
              Forgot password
            </a>
          </div>

          <button type="submit" className="auth-button">
            Sign in
          </button>
        </form>

        <button className="google-button" onClick={handleGoogleSignIn}>
          <svg className="google-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M18.1713 8.36791H17.5V8.33329H10V11.6666H14.7096C14.0225 13.6071 12.1763 15 10 15C7.23877 15 5.00002 12.7612 5.00002 9.99996C5.00002 7.23871 7.23877 4.99996 10 4.99996C11.2746 4.99996 12.4342 5.48079 13.3171 6.26621L15.6738 3.90954C14.1863 2.52204 12.195 1.66663 10 1.66663C5.39752 1.66663 1.66669 5.39746 1.66669 9.99996C1.66669 14.6025 5.39752 18.3333 10 18.3333C14.6025 18.3333 18.3334 14.6025 18.3334 9.99996C18.3334 9.44121 18.2759 8.89579 18.1713 8.36791Z" fill="#FFC107"/>
            <path d="M2.62752 6.12121L5.36544 8.12913C6.10627 6.29538 7.90044 4.99996 10 4.99996C11.2746 4.99996 12.4342 5.48079 13.3171 6.26621L15.6738 3.90954C14.1863 2.52204 12.195 1.66663 10 1.66663C6.79919 1.66663 4.02335 3.47371 2.62752 6.12121Z" fill="#FF3D00"/>
            <path d="M10 18.3333C12.1525 18.3333 14.1084 17.5095 15.5871 16.17L13.0079 13.9875C12.1431 14.6452 11.0865 15.0009 10 15C7.83255 15 5.99213 13.6179 5.29879 11.6891L2.58046 13.7829C3.96046 16.4816 6.76129 18.3333 10 18.3333Z" fill="#4CAF50"/>
            <path d="M18.1713 8.36795H17.5V8.33333H10V11.6667H14.7096C14.3809 12.5902 13.7889 13.3972 13.0067 13.9879L13.0079 13.9871L15.5871 16.1696C15.4046 16.3354 18.3334 14.1667 18.3334 10C18.3334 9.44129 18.2759 8.89587 18.1713 8.36795Z" fill="#1976D2"/>
          </svg>
          Sign in with Google
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;