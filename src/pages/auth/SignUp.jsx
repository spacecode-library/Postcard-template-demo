import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import Logo from '../../components/common/Logo';
import './signup.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const testimonial = {
    text: "We've been using 0 to kick start every new project and can't imagine working without it. It's incredible.",
    author: "Caitlyn King",
    title: "Lead Designer, Layers",
    company: "Web Development Agency"
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/onboarding');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await googleLogin('mock-google-token');
      navigate('/onboarding');
    } catch (error) {
      console.error('Google signup error:', error);
    }
  };


  return (
    <AuthLayout testimonial={testimonial}>
      <div className="signup-form-container">
        <Logo variant="auth" className="signup-logo" />
          
        <h1 className="auth-title">Sign up</h1>
        <p className="auth-subtitle">Start your 30-day free trial.</p>
          
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
            
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
            
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
            />
            <span className="helper-text">Must be at least 8 characters.</span>
          </div>
            
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <span className="helper-text">
              This password must be the same with previous password.
            </span>
          </div>
            
          <button type="submit" className="auth-button">
            Get started
          </button>
        </form>
          
        <button onClick={handleGoogleSignUp} className="google-button">
          <svg className="google-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M18.1713 8.36791H17.5V8.33329H10V11.6666H14.7096C14.0225 13.6071 12.1763 15 10 15C7.23877 15 5.00002 12.7612 5.00002 9.99996C5.00002 7.23871 7.23877 4.99996 10 4.99996C11.2746 4.99996 12.4342 5.48079 13.3171 6.26621L15.6738 3.90954C14.1863 2.52204 12.195 1.66663 10 1.66663C5.39752 1.66663 1.66669 5.39746 1.66669 9.99996C1.66669 14.6025 5.39752 18.3333 10 18.3333C14.6025 18.3333 18.3334 14.6025 18.3334 9.99996C18.3334 9.44121 18.2759 8.89579 18.1713 8.36791Z" fill="#FFC107"/>
            <path d="M2.62752 6.12121L5.36544 8.12913C6.10627 6.29538 7.90044 4.99996 10 4.99996C11.2746 4.99996 12.4342 5.48079 13.3171 6.26621L15.6738 3.90954C14.1863 2.52204 12.195 1.66663 10 1.66663C6.79919 1.66663 4.02335 3.47371 2.62752 6.12121Z" fill="#FF3D00"/>
            <path d="M10 18.3333C12.1525 18.3333 14.1084 17.5095 15.5871 16.17L13.0079 13.9875C12.1431 14.6452 11.0865 15.0009 10 15C7.83255 15 5.99213 13.6179 5.29879 11.6891L2.58046 13.7829C3.96046 16.4816 6.76129 18.3333 10 18.3333Z" fill="#4CAF50"/>
            <path d="M18.1713 8.36795H17.5V8.33333H10V11.6667H14.7096C14.3809 12.5902 13.7889 13.3972 13.0067 13.9879L13.0079 13.9871L15.5871 16.1696C15.4046 16.3354 18.3334 14.1667 18.3334 10C18.3334 9.44129 18.2759 8.89587 18.1713 8.36795Z" fill="#1976D2"/>
          </svg>
          Sign up with Google
        </button>
          
        <p className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Log in</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUp;