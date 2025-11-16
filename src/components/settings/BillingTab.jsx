import React, { useState, useEffect } from 'react';
import { Layers, Check, ExternalLink, MapPin, DollarSign, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { paymentService } from '../../supabase/api/paymentService';
import campaignService from '../../supabase/api/campaignService';
import toast from 'react-hot-toast';
import './BillingTab.css';

const BillingTab = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [zipAggregation, setZipAggregation] = useState(null);

  useEffect(() => {
    loadZipCodeAggregation();
  }, []);

  const loadZipCodeAggregation = async () => {
    try {
      setIsLoading(true);

      // Get all campaigns
      const { campaigns } = await campaignService.getCampaigns();

      // Aggregate ZIP code usage
      const zipMap = new Map();
      let totalPostcardsSent = 0;

      campaigns.forEach(campaign => {
        const zips = campaign.target_zip_codes || [];
        const postcardsSent = campaign.postcards_sent || 0;

        totalPostcardsSent += postcardsSent;

        zips.forEach(zip => {
          if (!zipMap.has(zip)) {
            zipMap.set(zip, {
              zipCode: zip,
              campaignCount: 0,
              totalPostcards: 0,
              totalCost: 0
            });
          }

          const zipData = zipMap.get(zip);
          zipData.campaignCount += 1;
          zipData.totalPostcards += postcardsSent;
          zipData.totalCost += postcardsSent * 3.00; // $3 per postcard
          zipMap.set(zip, zipData);
        });
      });

      const zipList = Array.from(zipMap.values())
        .sort((a, b) => b.totalPostcards - a.totalPostcards);

      const totalCost = zipList.reduce((sum, zip) => sum + zip.totalCost, 0);

      setZipAggregation({
        totalZipCodes: zipList.length,
        totalPostcardsSent,
        totalCost,
        zipList
      });
    } catch (error) {
      console.error('Error loading ZIP code aggregation:', error);
      toast.error('Failed to load billing data');
      setZipAggregation({
        totalZipCodes: 0,
        totalPostcardsSent: 0,
        totalCost: 0,
        zipList: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    try {
      setIsLoadingPortal(true);
      toast.loading('Opening billing portal...', { id: 'billing-portal' });

      // Create customer portal session
      const returnUrl = window.location.href;
      const { url } = await paymentService.createCustomerPortalSession(returnUrl);

      // Redirect to Stripe Customer Portal
      window.location.href = url;

      toast.success('Redirecting to billing portal...', { id: 'billing-portal' });
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error(error.message || 'Failed to open billing portal', { id: 'billing-portal' });
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className="billing-tab">
      {/* Billing & Invoices Header */}
      <h2 className="billing-title">Billing & Usage</h2>

      {/* Current Plan Card */}
      <div className="plan-card">
        <div className="plan-card-header">
          <div className="plan-icon">
            <Layers size={20} />
          </div>
          <div className="plan-info">
            <h3 className="plan-name">Pay As You Go</h3>
          </div>
          <div className="plan-status">
            <Check size={20} color="#20B2AA" strokeWidth={2} />
          </div>
        </div>
        <div className="plan-details">
          <div className="plan-price">
            <span className="price-amount">$3.00</span>
            <span className="price-period">per postcard</span>
          </div>
          <p className="plan-description">Only pay for postcards you send. No monthly fees or hidden charges.</p>
          <div className="plan-badge">
            • No commitment • Cancel anytime
          </div>
        </div>
      </div>

      {/* Billing Portal Button */}
      <div className="billing-portal-section">
        <div className="portal-description">
          <h3>Manage Billing Details</h3>
          <p className="section-subtitle">
            Update payment methods, view invoices, and manage your billing information through our secure Stripe portal.
          </p>
        </div>
        <motion.button
          className="billing-portal-button"
          onClick={handleOpenBillingPortal}
          disabled={isLoadingPortal}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoadingPortal ? (
            <>
              <div className="button-spinner"></div>
              Opening Portal...
            </>
          ) : (
            <>
              <ExternalLink size={18} />
              Edit Billing Details
            </>
          )}
        </motion.button>
      </div>

      {/* Usage Summary */}
      {isLoading ? (
        <div className="loading-section">
          <div className="spinner"></div>
          <p>Loading usage data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="usage-summary">
            <h3>Usage Summary</h3>
            <div className="summary-cards">
              <motion.div
                className="summary-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0 }}
              >
                <div className="card-icon zip-icon">
                  <MapPin size={24} />
                </div>
                <div className="card-content">
                  <div className="card-value">{zipAggregation.totalZipCodes}</div>
                  <div className="card-label">ZIP Code{zipAggregation.totalZipCodes !== 1 ? 's' : ''} Used</div>
                </div>
              </motion.div>

              <motion.div
                className="summary-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="card-icon postcards-icon">
                  <Send size={24} />
                </div>
                <div className="card-content">
                  <div className="card-value">{zipAggregation.totalPostcardsSent.toLocaleString()}</div>
                  <div className="card-label">Postcard{zipAggregation.totalPostcardsSent !== 1 ? 's' : ''} Sent</div>
                </div>
              </motion.div>

              <motion.div
                className="summary-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="card-icon cost-icon">
                  <DollarSign size={24} />
                </div>
                <div className="card-content">
                  <div className="card-value">${zipAggregation.totalCost.toFixed(2)}</div>
                  <div className="card-label">Total Spent</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ZIP Code Breakdown */}
          {zipAggregation.zipList.length > 0 && (
            <div className="zip-breakdown-section">
              <div className="breakdown-header">
                <h3>ZIP Code Usage Breakdown</h3>
                <p className="breakdown-subtitle">View your postcard costs by ZIP code</p>
              </div>

              <div className="zip-breakdown-table">
                <div className="table-header">
                  <div className="table-cell zip-cell">ZIP Code</div>
                  <div className="table-cell campaigns-cell">Campaigns</div>
                  <div className="table-cell postcards-cell">Postcards</div>
                  <div className="table-cell cost-cell">Cost</div>
                </div>

                {zipAggregation.zipList.map((zip, index) => (
                  <motion.div
                    key={zip.zipCode}
                    className="table-row"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <div className="table-cell zip-cell">
                      <MapPin size={16} className="zip-icon-small" />
                      <span className="zip-code-value">{zip.zipCode}</span>
                    </div>
                    <div className="table-cell campaigns-cell">
                      <span className="campaign-count">{zip.campaignCount}</span>
                    </div>
                    <div className="table-cell postcards-cell">
                      <span className="postcards-count">{zip.totalPostcards.toLocaleString()}</span>
                    </div>
                    <div className="table-cell cost-cell">
                      <span className="cost-value">${zip.totalCost.toFixed(2)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pricing-note">
                <DollarSign size={14} />
                <span>All postcards are charged at $3.00 per postcard, per ZIP code.</span>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        .loading-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #E2E8F0;
          border-top-color: #20B2AA;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-section p {
          color: #718096;
          font-size: 14px;
          margin: 0;
        }

        .billing-portal-section {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 24px;
          margin-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .portal-description h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1A202C;
          margin: 0 0 8px 0;
        }

        .section-subtitle {
          font-size: 14px;
          color: #718096;
          margin: 0;
          line-height: 1.6;
        }

        .billing-portal-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          background: #20B2AA;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .billing-portal-button:hover:not(:disabled) {
          background: #17a097;
          box-shadow: 0 6px 16px rgba(32, 178, 170, 0.3);
        }

        .billing-portal-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff40;
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .usage-summary {
          margin-top: 32px;
        }

        .usage-summary h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1A202C;
          margin: 0 0 20px 0;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .summary-card {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s ease;
        }

        .summary-card:hover {
          border-color: #CBD5E0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .zip-icon {
          background: #EBF8FF;
          color: #3182CE;
        }

        .postcards-icon {
          background: #F0FFF4;
          color: #38A169;
        }

        .cost-icon {
          background: #FFFBEB;
          color: #D97706;
        }

        .card-content {
          flex: 1;
        }

        .card-value {
          font-size: 24px;
          font-weight: 700;
          color: #1A202C;
          margin-bottom: 4px;
        }

        .card-label {
          font-size: 13px;
          color: #718096;
          font-weight: 500;
        }

        .zip-breakdown-section {
          margin-top: 32px;
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 24px;
        }

        .breakdown-header {
          margin-bottom: 24px;
        }

        .breakdown-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1A202C;
          margin: 0 0 6px 0;
        }

        .breakdown-subtitle {
          font-size: 14px;
          color: #718096;
          margin: 0;
        }

        .zip-breakdown-table {
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1fr;
          background: #F7FAFC;
          border-bottom: 1px solid #E2E8F0;
          font-size: 12px;
          font-weight: 600;
          color: #4A5568;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-cell {
          padding: 14px 16px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1fr;
          border-bottom: 1px solid #E2E8F0;
          transition: all 0.2s ease;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row:hover {
          background: #F7FAFC;
        }

        .zip-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #2D3748;
        }

        .zip-icon-small {
          color: #3182CE;
          flex-shrink: 0;
        }

        .zip-code-value {
          font-family: 'Courier New', monospace;
        }

        .campaign-count,
        .postcards-count {
          color: #4A5568;
        }

        .cost-value {
          font-weight: 600;
          color: #2D3748;
        }

        .pricing-note {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          padding: 12px 16px;
          background: #FFFBEB;
          border-left: 3px solid #F59E0B;
          border-radius: 6px;
          font-size: 13px;
          color: #92400E;
        }

        .pricing-note svg {
          flex-shrink: 0;
          color: #F59E0B;
        }

        @media (max-width: 768px) {
          .billing-portal-section {
            flex-direction: column;
            align-items: stretch;
          }

          .billing-portal-button {
            width: 100%;
            justify-content: center;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1.5fr 0.8fr 1fr 0.8fr;
            font-size: 13px;
          }

          .table-cell {
            padding: 12px 10px;
          }

          .zip-cell {
            gap: 6px;
          }

          .card-value {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default BillingTab;
