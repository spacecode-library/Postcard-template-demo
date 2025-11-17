import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Shield } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import toast from 'react-hot-toast';
import { paymentService } from '../../supabase/api/paymentService';
import onboardingService from '../../supabase/api/onboardingService';
import './onboarding-step5.css';

// Initialize Stripe - make sure this is outside the component
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// // Initialize Stripe - MUST be outside component
let stripePromise;

if (!stripeKey) {
  console.error('❌ VITE_STRIPE_PUBLISHABLE_KEY is missing!');
  console.error('   Add it to your .env file:');
  console.error('   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...');
}  else {
  stripePromise = loadStripe(stripeKey);
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#111827',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#9CA3AF',
      },
      iconColor: '#6B7280',
    },
    invalid: {
      color: '#DC2626',
      iconColor: '#DC2626',
    },
    complete: {
      color: '#059669',
      iconColor: '#059669',
    },
  },
  hidePostalCode: true,
};

const PaymentForm = ({ onSuccess, email }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [cardReady, setCardReady] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);


  useEffect(() => {
    const initializeSetupIntent = async () => {
      if (!email) {
        setIsInitializing(false);
        return;
      }

      try {
        setIsInitializing(true);
        
        const { clientSecret } = await paymentService.createSetupIntent(email);
        
        setClientSecret(clientSecret);
        setError(null);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to initialize payment setup');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSetupIntent();
  }, [email]);

  const handleCardReady = (element) => {
    console.log('✅ Card element ready and mounted');
    setCardReady(true);
    
    // Force focus after a brief delay to ensure interactivity
    setTimeout(() => {
      if (element) {
        element.focus();
      }
    }, 100);
  };

  const handleCardChange = (event) => {
    console.log('💳 Card change event:', {
      complete: event.complete,
      empty: event.empty,
      error: event.error?.message,
    });

    setCardComplete(event.complete);
    
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      console.warn('⚠️ Cannot submit - missing dependencies');
      toast.error('Payment system not ready. Please wait...');
      return;
    }

    if (!cardComplete) {
      setError('Please complete all card details');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: email,
            },
          },
        }
      );

      if (stripeError) {
        console.error('❌ Stripe error:', stripeError);
        throw new Error(stripeError.message);
      }


      if (setupIntent.status === 'succeeded') {
        
        // Confirm with backend
        await paymentService.confirmSetupIntent(setupIntent.id);
        
        // Update onboarding progress
        await paymentService.updateOnboardingProgress(5, {
          payment_completed: true,
        });

        toast.success('Payment method added successfully!');
        onSuccess();
      } else {
        throw new Error(`Setup intent status: ${setupIntent.status}`);
      }
    } catch (err) {
      console.error('❌ Payment error:', err);
      setError(err.message);
      toast.error(err.message || 'Payment setup failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state
  if (isInitializing) {
    return (
      <div className="payment-form-stripe">
        <div className="payment-section">
          <h3 className="section-title">Card Information</h3>
          <div className="loading-state">
            <div className="spinner-small"></div>
            <p>Initializing secure payment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form-stripe">
      <div className="payment-section">
        <h3 className="section-title">Card Information</h3>
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            padding: '8px', 
            background: '#F3F4F6', 
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '12px',
            fontFamily: 'monospace'
          }}>
          </div>
        )}
        
        <div className="card-element-wrapper">
          <CardElement 
            options={CARD_ELEMENT_OPTIONS}
            onReady={handleCardReady}
            onChange={handleCardChange}
          />
        </div>

        {!cardReady && (
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>
            Loading card input...
          </p>
        )}

        {error && (
          <div className="error-message">
            <AlertCircle size={20} color="#EF4444" />
            {error}
          </div>
        )}

        <div className="privacy-notice">
          <Shield size={16} color="#6B7280" />
          Your payment information is securely processed by Stripe. We never store your full card details.
        </div>
      </div>

      <button
        type="submit"
        className="continue-button"
        disabled={!stripe || isProcessing || !clientSecret || !cardReady || !cardComplete}
      >
        {isProcessing ? (
          <>
            <div className="spinner-small"></div>
            Processing...
          </>
        ) : (
          'Save & Continue'
        )}
      </button>
    </form>
  );
};

const OnboardingStep5 = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const steps = [
    { number: 1, title: 'Business URL', subtitle: 'Please provide email' },
    { number: 2, title: 'Select Postcard Template', subtitle: 'Setup your template' },
    { number: 3, title: 'Postcard Editor', subtitle: 'Customize your campaign' },
    { number: 4, title: 'Targeting & Budget', subtitle: 'Setup your business financial goals' },
    { number: 5, title: 'Payment Setup', subtitle: 'Provide payment flow' },
    { number: 6, title: 'Launch Campaign', subtitle: 'Finish your website setup' },
  ];

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setSavedPaymentMethods(methods || []);
    } catch (err) {
      console.error('Failed to load payment methods:', err);
      setSavedPaymentMethods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/onboarding/step4');
  };

  const handlePaymentSuccess = async () => {
    // Mark step 5 as complete
    await onboardingService.markStepComplete(5);
    navigate('/onboarding/step6');
  };

  const handleSkipPayment = async () => {
    toast.success('Payment setup skipped. You can add payment details later.');
    // Mark step 5 as complete
    await onboardingService.markStepComplete(5);
    navigate('/onboarding/step6');
  };

  return (
    <OnboardingLayout
      steps={steps}
      currentStep={5}
      footerMessage="Enter your email address above to add payment details, or click 'Skip for Now' to continue"
      onContinue={handleSkipPayment}
      continueText="Skip for Now"
      continueDisabled={false}
    >
      <div className="main-content">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft size={18} />
          Back
        </button>

        <h1 className="main-title">Payment Setup</h1>
        <p style={{ color: '#718096', fontSize: '0.95rem', marginTop: '8px', marginBottom: '24px' }}>
          Add a payment method now or skip and add it later from your dashboard.
        </p>

        <div className="payment-form">
          {/* Billing Information */}
          <div className="payment-section">
            <h3 className="section-title">Billing Information (Optional)</h3>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Input your email address (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Saved Payment Methods */}
          {!isLoading && savedPaymentMethods.length > 0 && (
            <div className="payment-section">
              <h3 className="section-title">Saved Payment Methods</h3>
              {savedPaymentMethods.map((method) => (
                <div key={method.id} className="payment-method-card saved">
                  <div className="payment-method-header">
                    <div className="card-info">
                      <span className="card-brand">{method.card_brand?.toUpperCase()}</span>
                      <span className="card-number">•••• {method.card_last4}</span>
                    </div>
                    <div className="card-expiry">
                      Expires {method.card_exp_month}/{method.card_exp_year}
                    </div>
                    {method.is_default && (
                      <span className="default-badge">Default</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stripe Elements Form */}
          {email && (
            <Elements stripe={stripePromise}>
              <PaymentForm onSuccess={handlePaymentSuccess} email={email} />
            </Elements>
          )}

          {!email && (
            <div className="payment-section">
              <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem' }}>
                Enter your email address above to add payment details, or click "Skip for Now" to continue
              </p>
            </div>
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default OnboardingStep5;