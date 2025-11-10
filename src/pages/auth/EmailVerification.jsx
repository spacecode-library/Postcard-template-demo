import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import supabaseAuthService from '../../supabase/api/authService';
import { supabase } from '../../supabase/integration/client';
import toast from 'react-hot-toast';
import './EmailVerification.css';

const EmailVerification = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const autoCheckIntervalRef = useRef(null);

  // Get email from user or localStorage
  const userEmail = user?.email || localStorage.getItem('pendingVerificationEmail') || '';

  // Auto-check email verification status every 5 seconds
  // Start checking after initial delay to let user see the verification screen
  useEffect(() => {
    if (!user) return;

    const checkVerificationStatus = async () => {
      try {
        // First check if session exists to avoid AuthSessionMissingError
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          // No session available, skip check
          return;
        }

        // Refresh user session to get latest email_confirmed_at
        const currentUser = await supabaseAuthService.getCurrentUser();

        if (currentUser?.email_confirmed_at) {
          setIsVerified(true);
          if (autoCheckIntervalRef.current) {
            clearInterval(autoCheckIntervalRef.current);
            autoCheckIntervalRef.current = null;
          }
          toast.success('Email verified successfully!');
        }
      } catch (error) {
        console.error('Error checking verification:', error);
      }
    };

    // Don't check immediately on mount - let user see the "Check your email" screen first
    // Start auto-checking after 5 seconds to give user time to read instructions
    const interval = setInterval(() => {
      if (!isVerified) {
        checkVerificationStatus();
      }
    }, 5000); // Check every 5 seconds

    autoCheckIntervalRef.current = interval;

    return () => {
      if (autoCheckIntervalRef.current) {
        clearInterval(autoCheckIntervalRef.current);
        autoCheckIntervalRef.current = null;
      }
    };
  }, [user, isVerified]);

  // Load resend cooldown from localStorage
  useEffect(() => {
    const lastResent = localStorage.getItem('emailResendLastSent');
    if (lastResent) {
      const timeSince = Math.floor((Date.now() - parseInt(lastResent)) / 1000);
      const remaining = 60 - timeSince;
      if (remaining > 0) {
        setResendCooldown(remaining);
      }
    }
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleManualCheck = async () => {
    if (checking) return;

    setChecking(true);
    try {
      // First check if session exists to avoid AuthSessionMissingError
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast('No active session. Please try logging in again.');
        return;
      }

      const currentUser = await supabaseAuthService.getCurrentUser();

      if (currentUser?.email_confirmed_at) {
        setIsVerified(true);
        toast.success('Email verified successfully!');
      } else {
        toast('Email not verified yet. Please check your inbox.');
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      toast.error('Failed to check verification status');
    } finally {
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;

    try {
      await supabaseAuthService.resendVerificationEmail(userEmail);
      toast.success('Verification email resent! Please check your inbox.');

      // Set cooldown
      setResendCooldown(60);
      localStorage.setItem('emailResendLastSent', Date.now().toString());
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error(error.error || 'Failed to resend email');
    }
  };

  const handleGoToLogin = () => {
    localStorage.removeItem('pendingVerificationEmail');
    localStorage.removeItem('emailResendLastSent');
    navigate('/login?verified=true');
  };

  const handleLogout = async () => {
    try {
      await supabaseAuthService.logout();
      localStorage.removeItem('pendingVerificationEmail');
      localStorage.removeItem('emailResendLastSent');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // If already verified, show success screen
  if (isVerified) {
    return (
      <div className="email-verification-container">
        <div className="email-verification-card success">
          <div className="success-icon-wrapper">
            <CheckCircle size={64} className="success-icon" />
          </div>

          <h1 className="verification-title">Email Verified!</h1>
          <p className="verification-subtitle">
            Your email has been successfully verified. You can now log in to start creating your first campaign.
          </p>

          <button
            onClick={handleGoToLogin}
            className="verification-button primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show verification pending screen
  return (
    <div className="email-verification-container">
      <div className="email-verification-card">
        <div className="mail-icon-wrapper">
          <Mail size={56} className="mail-icon" />
          <div className="mail-icon-badge">
            <Clock size={16} className="pending-icon" />
          </div>
        </div>

        <h1 className="verification-title">Check your email</h1>
        <p className="verification-subtitle">
          We sent a verification link to
        </p>
        <p className="user-email">{userEmail}</p>

        <div className="verification-instructions">
          <ol>
            <li>Open the email we sent you</li>
            <li>Click the verification link</li>
            <li>You'll be redirected to login</li>
          </ol>
        </div>

        <div className="verification-actions">
          <button
            onClick={handleManualCheck}
            disabled={checking}
            className="verification-button secondary"
          >
            <RefreshCw size={18} className={checking ? 'spinning' : ''} />
            {checking ? 'Checking...' : 'I verified my email'}
          </button>

          <button
            onClick={handleResendEmail}
            disabled={resendCooldown > 0}
            className="verification-button tertiary"
          >
            {resendCooldown > 0 ? (
              <>
                <Clock size={18} />
                Resend in {resendCooldown}s
              </>
            ) : (
              <>
                <Mail size={18} />
                Resend verification email
              </>
            )}
          </button>
        </div>

        <div className="verification-footer">
          <p className="help-text">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
          <button onClick={handleLogout} className="logout-link">
            Back to Login
          </button>
        </div>

        <div className="auto-check-notice">
          <RefreshCw size={14} className="auto-refresh-icon" />
          <span>Auto-checking every 5 seconds...</span>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
