import React, { useState, useEffect } from 'react';
import { Layers, Check, Download, CreditCard, Trash2, ChevronDown, X } from 'lucide-react';
import { mockPaymentService } from '../../services/mockDataService';
import toast from 'react-hot-toast';
import './BillingTab.css';

const BillingTab = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [billingData, setBillingData] = useState({
    streetAddress: '100 Smith Street',
    city: 'Collingwood',
    state: 'VIC',
    postalCode: '3066',
    country: 'Australia'
  });
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const result = await mockPaymentService.getPaymentMethods();
      if (result.success) {
        setPaymentMethods(result.payment_methods);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  // Sample billing history data
  const billingHistory = [
    { id: 1, invoice: 'Basic Plan - Dec 2025', period: 'Dec 1, 2025', amount: 'USD $10.00', status: 'Paid' },
    { id: 2, invoice: 'Basic Plan - Nov 2025', period: 'Nov 1, 2025', amount: 'USD $10.00', status: 'Paid' },
    { id: 3, invoice: 'Basic Plan - Oct 2025', period: 'Oct 1, 2025', amount: 'USD $10.00', status: 'Paid' },
    { id: 4, invoice: 'Basic Plan - Sep 2025', period: 'Sep 1, 2025', amount: 'USD $10.00', status: 'Paid' },
    { id: 5, invoice: 'Basic Plan - Aug 2025', period: 'Aug 1, 2025', amount: 'USD $10.00', status: 'Paid' },
    { id: 6, invoice: 'Basic Plan - Jul 2025', period: 'Jul 1, 2025', amount: 'USD $10.00', status: 'Paid' },
    { id: 7, invoice: 'Basic Plan - Jun 2025', period: 'Jun 1, 2025', amount: 'USD $10.00', status: 'Paid' }
  ];

  const handleDownload = (invoiceId) => {
    console.log('Downloading invoice:', invoiceId);
  };

  const handleInputChange = (field, value) => {
    setBillingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSetDefault = async (paymentMethodId) => {
    try {
      toast.loading('Setting default payment method...', { id: 'set-default' });
      await mockPaymentService.setDefaultPaymentMethod(paymentMethodId);
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
      await mockPaymentService.removePaymentMethod(paymentMethodId);
      await loadPaymentMethods();
      toast.success('Payment method removed', { id: 'remove-payment' });
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast.error('Failed to remove payment method', { id: 'remove-payment' });
    }
  };

  const handleAddPaymentMethod = async () => {
    // Validate card details
    if (!newCard.cardNumber || !newCard.cardholderName || !newCard.expiryMonth || !newCard.expiryYear || !newCard.cvv) {
      toast.error('Please fill in all card details');
      return;
    }

    // Basic validation
    if (newCard.cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Card number must be 16 digits');
      return;
    }

    try {
      toast.loading('Adding payment method...', { id: 'add-payment' });

      // Extract last 4 digits and determine brand
      const last4 = newCard.cardNumber.slice(-4);
      const firstDigit = newCard.cardNumber.charAt(0);
      let brand = 'visa';
      if (firstDigit === '5') brand = 'mastercard';
      else if (firstDigit === '3') brand = 'amex';

      const paymentMethod = {
        brand,
        last4,
        exp_month: parseInt(newCard.expiryMonth),
        exp_year: parseInt(newCard.expiryYear),
        cardholder_name: newCard.cardholderName
      };

      await mockPaymentService.addPaymentMethod(paymentMethod);
      await loadPaymentMethods();

      // Reset form and close modal
      setNewCard({
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
      });
      setShowAddModal(false);

      toast.success('Payment method added successfully', { id: 'add-payment' });
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add payment method', { id: 'add-payment' });
    }
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
          <button className="download-all-btn">
            <Download size={18} />
            Download all
          </button>
        </div>

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

            <div className="modal-body">
              <div className="modal-form-group">
                <label>Cardholder Name *</label>
                <input
                  type="text"
                  value={newCard.cardholderName}
                  onChange={(e) => setNewCard({ ...newCard, cardholderName: e.target.value })}
                  placeholder="John Doe"
                  className="modal-input"
                />
              </div>

              <div className="modal-form-group">
                <label>Card Number *</label>
                <input
                  type="text"
                  value={newCard.cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                    setNewCard({ ...newCard, cardNumber: value });
                  }}
                  placeholder="1234 5678 9012 3456"
                  className="modal-input"
                  maxLength="16"
                />
              </div>

              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label>Expiry Month *</label>
                  <input
                    type="text"
                    value={newCard.expiryMonth}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                        setNewCard({ ...newCard, expiryMonth: value });
                      }
                    }}
                    placeholder="MM"
                    className="modal-input"
                    maxLength="2"
                  />
                </div>

                <div className="modal-form-group">
                  <label>Expiry Year *</label>
                  <input
                    type="text"
                    value={newCard.expiryYear}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setNewCard({ ...newCard, expiryYear: value });
                    }}
                    placeholder="YYYY"
                    className="modal-input"
                    maxLength="4"
                  />
                </div>

                <div className="modal-form-group">
                  <label>CVV *</label>
                  <input
                    type="text"
                    value={newCard.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setNewCard({ ...newCard, cvv: value });
                    }}
                    placeholder="123"
                    className="modal-input"
                    maxLength="4"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-btn cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn add-btn"
                onClick={handleAddPaymentMethod}
              >
                Add Payment Method
              </button>
            </div>
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
      `}</style>
    </div>
  );
};

export default BillingTab;