import React, { useState } from 'react';
import './Step5Payment.css';

const Step5Payment = ({ formData, onChange, onContinue, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState(formData.paymentMethod || 'card');
  const [billingInfo, setBillingInfo] = useState({
    cardNumber: formData.cardNumber || '',
    expiryDate: formData.expiryDate || '',
    cvv: formData.cvv || '',
    cardholderName: formData.cardholderName || '',
    billingAddress: formData.billingAddress || '',
    city: formData.city || '',
    state: formData.state || '',
    zipCode: formData.zipCode || ''
  });

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    onChange({ ...formData, paymentMethod: method });
  };

  const handleFieldChange = (field, value) => {
    const updated = { ...billingInfo, [field]: value };
    setBillingInfo(updated);
    onChange({ ...formData, ...updated });
  };

  const isFormValid = () => {
    if (paymentMethod === 'card') {
      return billingInfo.cardNumber && billingInfo.expiryDate && 
             billingInfo.cvv && billingInfo.cardholderName;
    }
    return true;
  };

  const handleContinue = () => {
    if (isFormValid()) {
      onContinue();
    }
  };

  return (
    <div className="payment-step">
      <h1 className="step-title">Payment Information</h1>
      <p className="step-subtitle">Choose your payment method</p>
      
      <div className="payment-container">
        <div className="payment-methods">
          <label className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => handlePaymentMethodChange('card')}
            />
            <div className="method-content">
              <span className="method-icon">💳</span>
              <span className="method-label">Credit/Debit Card</span>
            </div>
          </label>
          
          <label className={`payment-method ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={() => handlePaymentMethodChange('paypal')}
            />
            <div className="method-content">
              <span className="method-icon">🅿️</span>
              <span className="method-label">PayPal</span>
            </div>
          </label>
          
          <label className={`payment-method ${paymentMethod === 'invoice' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="invoice"
              checked={paymentMethod === 'invoice'}
              onChange={() => handlePaymentMethodChange('invoice')}
            />
            <div className="method-content">
              <span className="method-icon">📄</span>
              <span className="method-label">Invoice (Net 30)</span>
            </div>
          </label>
        </div>

        {paymentMethod === 'card' && (
          <div className="payment-form">
            <div className="form-group">
              <label className="form-label">Cardholder Name</label>
              <input
                type="text"
                className="form-input"
                value={billingInfo.cardholderName}
                onChange={(e) => handleFieldChange('cardholderName', e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input
                type="text"
                className="form-input"
                value={billingInfo.cardNumber}
                onChange={(e) => handleFieldChange('cardNumber', e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
            </div>

            <div className="form-row-half">
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input
                  type="text"
                  className="form-input"
                  value={billingInfo.expiryDate}
                  onChange={(e) => handleFieldChange('expiryDate', e.target.value)}
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>

              <div className="form-group">
                <label className="form-label">CVV</label>
                <input
                  type="text"
                  className="form-input"
                  value={billingInfo.cvv}
                  onChange={(e) => handleFieldChange('cvv', e.target.value)}
                  placeholder="123"
                  maxLength="4"
                />
              </div>
            </div>

            <h3 className="section-subtitle">Billing Address</h3>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                className="form-input"
                value={billingInfo.billingAddress}
                onChange={(e) => handleFieldChange('billingAddress', e.target.value)}
                placeholder="123 Main St"
              />
            </div>

            <div className="form-row-third">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={billingInfo.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="New York"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  value={billingInfo.state}
                  onChange={(e) => handleFieldChange('state', e.target.value)}
                  placeholder="NY"
                  maxLength="2"
                />
              </div>

              <div className="form-group">
                <label className="form-label">ZIP Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={billingInfo.zipCode}
                  onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                  placeholder="10001"
                  maxLength="10"
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'paypal' && (
          <div className="payment-message">
            <p>You will be redirected to PayPal to complete your payment.</p>
          </div>
        )}

        {paymentMethod === 'invoice' && (
          <div className="payment-message">
            <p>An invoice will be sent to your email address. Payment is due within 30 days.</p>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button className="step-button back" onClick={onBack}>
          Back
        </button>
        <button 
          className="step-button continue" 
          onClick={handleContinue}
          disabled={!isFormValid()}
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
};

export default Step5Payment;