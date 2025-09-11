import React, { useState } from 'react';
import './BillingTab.css';

const BillingTab = () => {
  const [selectedCard, setSelectedCard] = useState(true);
  const [billingData, setBillingData] = useState({
    streetAddress: '100 Smith Street',
    city: 'Collingwood',
    state: 'VIC',
    postalCode: '3066',
    country: 'Australia'
  });

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

  return (
    <div className="billing-tab">
      {/* Billing & Invoices Header */}
      <h2 className="billing-title">Billing & Invoices</h2>

      {/* Current Plan Card */}
      <div className="plan-card">
        <div className="plan-card-header">
          <div className="plan-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L2 7L10 12L18 7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 13L10 18L18 13" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="plan-info">
            <h3 className="plan-name">Basic plan</h3>
          </div>
          <div className="plan-status">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 10L8 13L15 6" stroke="#20B2AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2V14M10 14L6 10M10 14L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 17H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
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
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2V14M10 14L6 10M10 14L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 17H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="payment-section">
        <h3>Payment method</h3>
        <p className="section-subtitle">Update your billing details and address.</p>
        
        <div className="payment-method">
          <div className="card-selection">
            <span className="card-label">Card details</span>
            <span className="required-asterisk">*</span>
          </div>
          <div className="selected-payment">
            <p className="payment-note">Select default payment method.</p>
            <div className="payment-card">
              <input 
                type="checkbox" 
                checked={selectedCard}
                onChange={(e) => setSelectedCard(e.target.checked)}
                className="card-checkbox"
              />
              <div className="card-logo">
                <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                  <rect width="40" height="24" rx="4" fill="#5469D4"/>
                  <path d="M8 8H16V10H8V8Z" fill="white"/>
                  <path d="M8 14H12V16H8V14Z" fill="white"/>
                  <circle cx="30" cy="12" r="6" fill="white" fillOpacity="0.5"/>
                  <circle cx="34" cy="12" r="6" fill="white" fillOpacity="0.5"/>
                </svg>
              </div>
              <div className="card-info">
                <span className="card-number">Stripe ending in 1234</span>
                <span className="card-expiry">Expiry 06/2025</span>
              </div>
              <button className="set-default-btn">Set as default</button>
              <button className="edit-btn">Edit</button>
            </div>
            <button className="add-payment-btn">
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
                  <option value="Australia">🇦🇺 Australia</option>
                  <option value="United States">🇺🇸 United States</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                </select>
                <svg className="select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingTab;