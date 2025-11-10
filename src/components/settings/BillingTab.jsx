import React, { useState, useEffect } from 'react';
import { Layers, Check, Download, CreditCard, Trash2, ChevronDown, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentService } from '../../supabase/api/paymentService';
import toast from 'react-hot-toast';
import './BillingTab.css';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Stripe CardElement styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1A202C',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#A0AEC0',
      },
    },
    invalid: {
      color: '#E53E3E',
      iconColor: '#E53E3E',
    },
  },
};

// Add Payment Method Form Component (uses Stripe hooks)
const AddPaymentMethodForm = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!cardholderName.trim()) {
      toast.error('Please enter cardholder name');
      return;
    }

    setIsProcessing(true);

    try {
      toast.loading('Adding payment method...', { id: 'add-payment' });

      // Step 1: Create SetupIntent on backend
      const { data: { user } } = await import('../../supabase/integration/client').then(m => m.supabase.auth.getUser());

      if (!user?.email) {
        throw new Error('User email not found');
      }

      const setupIntentData = await paymentService.createSetupIntent(user.email);

      // Step 2: Confirm card setup with Stripe
      const cardElement = elements.getElement(CardElement);

      const { setupIntent, error } = await stripe.confirmCardSetup(
        setupIntentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardholderName,
              email: user.email,
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      // Step 3: Save payment method to database
      await paymentService.addPaymentMethod(setupIntent);

      toast.success('Payment method added successfully!', { id: 'add-payment' });
      onSuccess();
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error(error.message || 'Failed to add payment method', { id: 'add-payment' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="modal-form-group">
          <label>Cardholder Name *</label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="John Doe"
            className="modal-input"
            disabled={isProcessing}
          />
        </div>

        <div className="modal-form-group">
          <label>Card Details *</label>
          <div className="stripe-card-element">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button
          type="button"
          className="modal-btn cancel-btn"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="modal-btn add-btn"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Add Payment Method'}
        </button>
      </div>
    </form>
  );
};

const BillingTab = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [billingData, setBillingData] = useState({
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States'
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const paymentMethodsData = await paymentService.getPaymentMethods();
      setPaymentMethods(paymentMethodsData || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
      setPaymentMethods([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Billing history will be loaded from real data in future implementation
  const billingHistory = [];

  const handleInputChange = (field, value) => {
    setBillingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSetDefault = async (paymentMethodId) => {
    try {
      toast.loading('Setting default payment method...', { id: 'set-default' });
      await paymentService.setDefaultPaymentMethod(paymentMethodId);
      await loadPaymentMethods();
      toast.success('Default payment method updated', { id: 'set-default' });
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error('Failed to set default payment method', { id: 'set-default' });
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      toast.loading('Removing payment method...', { id: 'remove-payment' });
      await paymentService.removePaymentMethod(paymentMethodId);
      await loadPaymentMethods();
      toast.success('Payment method removed', { id: 'remove-payment' });
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast.error('Failed to remove payment method', { id: 'remove-payment' });
    }
  };

  const handlePaymentSuccess = async () => {
    setShowAddModal(false);
    await loadPaymentMethods();
  };

  const getCardBrandName = (brand) => {
    const brands = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover'
    };
    return brands[brand] || brand;
  };

  return (
    <div className="billing-tab">
      {/* Billing & Invoices Header */}
      <h2 className="billing-title">Billing & Invoices</h2>

      {/* Current Plan Card */}
      <div className="plan-card">
        <div className="plan-card-header">
          <div className="plan-icon">
            <Layers size={20} />
          </div>
          <div className="plan-info">
            <h3 className="plan-name">Basic plan</h3>
          </div>
          <div className="plan-status">
            <Check size={20} color="#20B2AA" strokeWidth={2} />
          </div>
        </div>
        <div className="plan-details">
          <div className="plan-price">
            <span className="price-amount">$10</span>
            <span className="price-period">per month</span>
          </div>
          <p className="plan-description">Includes up to 10 users, 20 GB individual data and access to all features.</p>
          <div className="plan-badge">
            • Limited time only
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="billing-history">
        <div className="billing-history-header">
          <h3>Billing history</h3>
          {billingHistory.length > 0 && (
            <button className="download-all-btn">
              <Download size={18} />
              Download all
            </button>
          )}
        </div>

        {billingHistory.length === 0 ? (
          <div className="no-billing-history">
            <p>No billing history available yet.</p>
            <p className="no-billing-subtext">Your invoices and payment history will appear here.</p>
          </div>
        ) : (
          <div className="billing-table">
            <div className="table-header">
              <div className="table-cell invoice-cell">Invoice</div>
              <div className="table-cell period-cell">Period</div>
              <div className="table-cell amount-cell">Amount</div>
              <div className="table-cell status-cell">Status</div>
              <div className="table-cell action-cell"></div>
            </div>

            {billingHistory.map((item) => (
              <div key={item.id} className="table-row">
                <div className="table-cell invoice-cell">
                  <input type="checkbox" className="row-checkbox" />
                  <span>{item.invoice}</span>
                </div>
                <div className="table-cell period-cell">{item.period}</div>
                <div className="table-cell amount-cell">{item.amount}</div>
                <div className="table-cell status-cell">
                  <span className="status-badge paid">{item.status}</span>
                </div>
                <div className="table-cell action-cell">
                  <button className="download-btn" onClick={() => handleDownload(item.id)}>
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="payment-section">
        <h3>Payment method</h3>
        <p className="section-subtitle">Manage your payment methods.</p>

        <div className="payment-method">
          <div className="card-selection">
            <span className="card-label">Card details</span>
            <span className="required-asterisk">*</span>
          </div>
          <div className="selected-payment">
            {isLoading ? (
              <div className="loading-payment">
                <div className="spinner-small"></div>
                <p>Loading payment methods...</p>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="no-payment-methods">
                <p>No payment methods added yet.</p>
              </div>
            ) : (
              <>
                <p className="payment-note">Your saved payment methods:</p>
                {paymentMethods.map((method) => (
                  <div key={method.id} className="payment-card">
                    <div className="card-logo">
                      <CreditCard size={32} strokeWidth={1.5} />
                    </div>
                    <div className="card-info">
                      <span className="card-number">{getCardBrandName(method.brand)} ending in {method.last4}</span>
                      <span className="card-expiry">Expiry {String(method.exp_month).padStart(2, '0')}/{method.exp_year}</span>
                    </div>
                    {method.is_default ? (
                      <span className="default-badge">Default</span>
                    ) : (
                      <button
                        className="set-default-btn"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set as default
                      </button>
                    )}
                    <button
                      className="remove-btn"
                      onClick={() => handleRemovePaymentMethod(method.id)}
                      title="Remove payment method"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </>
            )}
            <button
              className="add-payment-btn"
              onClick={() => setShowAddModal(true)}
            >
              + Add new payment method
            </button>
          </div>
        </div>

        {/* Billing Address */}
        <div className="billing-address">
          <div className="form-row">
            <div className="form-group">
              <label>Street address <span className="required">*</span></label>
              <input 
                type="text"
                value={billingData.streetAddress}
                onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>City <span className="required">*</span></label>
              <input 
                type="text"
                value={billingData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>State / Province <span className="required">*</span></label>
              <div className="state-postal-wrapper">
                <input 
                  type="text"
                  value={billingData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="form-input state-input"
                />
                <input 
                  type="text"
                  value={billingData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="form-input postal-input"
                />
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Country <span className="required">*</span></label>
              <div className="country-select-wrapper">
                <select
                  value={billingData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="form-select"
                >
                  <option value="Australia">Australia</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
                <ChevronDown className="select-arrow" size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Payment Method</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <Elements stripe={stripePromise}>
              <AddPaymentMethodForm
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowAddModal(false)}
              />
            </Elements>
          </div>
        </div>
      )}

      <style>{`
        .loading-payment {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
        }

        .spinner-small {
          width: 20px;
          height: 20px;
          border: 3px solid #E2E8F0;
          border-top-color: #20B2AA;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .no-payment-methods {
          padding: 20px;
          text-align: center;
          color: #718096;
        }

        .no-billing-history {
          padding: 40px 20px;
          text-align: center;
          background: #F7FAFC;
          border-radius: 8px;
          margin-top: 16px;
        }

        .no-billing-history p {
          margin: 0;
          color: #4A5568;
          font-size: 15px;
          font-weight: 500;
        }

        .no-billing-subtext {
          margin-top: 8px !important;
          color: #718096 !important;
          font-size: 14px !important;
          font-weight: 400 !important;
        }

        .default-badge {
          background: #D1FAE5;
          color: #059669;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
        }

        .remove-btn {
          padding: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #718096;
          transition: all 0.2s;
          border-radius: 6px;
        }

        .remove-btn:hover {
          background: #FEE2E2;
          color: #DC2626;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #E2E8F0;
        }

        .modal-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1A202C;
          margin: 0;
        }

        .modal-close {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #718096;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #F7FAFC;
          color: #1A202C;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-form-group {
          margin-bottom: 16px;
        }

        .modal-form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .modal-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          border: 1.5px solid #E2E8F0;
          border-radius: 8px;
          transition: all 0.2s;
          font-family: inherit;
        }

        .modal-input:focus {
          outline: none;
          border-color: #20B2AA;
          box-shadow: 0 0 0 3px rgba(32, 178, 170, 0.1);
        }

        .modal-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #E2E8F0;
        }

        .modal-btn {
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .cancel-btn {
          background: white;
          color: #4A5568;
          border: 1.5px solid #E2E8F0;
        }

        .cancel-btn:hover {
          background: #F7FAFC;
        }

        .add-btn {
          background: #20B2AA;
          color: white;
        }

        .add-btn:hover {
          background: #17a097;
          box-shadow: 0 4px 12px rgba(32, 178, 170, 0.3);
        }

        .stripe-card-element {
          padding: 12px 16px;
          border: 1.5px solid #E2E8F0;
          border-radius: 8px;
          transition: all 0.2s;
          background: white;
        }

        .stripe-card-element:focus-within {
          border-color: #20B2AA;
          box-shadow: 0 0 0 3px rgba(32, 178, 170, 0.1);
        }

        .stripe-card-element .StripeElement {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default BillingTab;