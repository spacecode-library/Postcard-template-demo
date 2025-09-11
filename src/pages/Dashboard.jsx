import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import EmptyState from '../components/dashboard/EmptyState';
import CampaignCard from '../components/dashboard/CampaignCard';
import AnalyticsChart from '../components/dashboard/AnalyticsChart';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('12 months');
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Campaign Name',
      status: 'Active',
      isActive: true,
      targetArea: 'ZIP',
      postcardsSent: 200,
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      name: 'Campaign Name',
      status: 'Drafted',
      isActive: false,
      targetArea: 'Radius',
      postcardsSent: 200,
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'
    }
  ]);

  const periods = ['12 months', '30 days', '7 days', '24 hours'];

  const handleCreateCampaign = () => {
    navigate('/create-campaign');
  };

  const handleNavigateToHistory = () => {
    navigate('/history');
  };

  const handleEditCampaign = (campaignId) => {
    console.log('Edit campaign:', campaignId);
  };

  const handleDeleteCampaign = (campaignId) => {
    console.log('Delete campaign:', campaignId);
  };

  const handleDuplicateCampaign = (campaignId) => {
    console.log('Duplicate campaign:', campaignId);
  };

  const toggleCampaignStatus = (campaignId) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, isActive: !campaign.isActive, status: campaign.isActive ? 'Paused' : 'Active' }
        : campaign
    ));
  };

  // Empty state when no campaigns
  if (campaigns.length === 0) {
    return (
      <DashboardLayout>
        <EmptyState onCreateCampaign={handleCreateCampaign} />
      </DashboardLayout>
    );
  }

  // Dashboard with campaigns
  return (
    <DashboardLayout>
      <div className="dashboard-page">
          {/* Header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">Dashboard</h1>
            <button className="create-campaign-button" onClick={handleCreateCampaign}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Create Campaign
            </button>
          </div>

          {/* Time Period Filters */}
          <div className="filters-section">
            <div className="period-filters">
              {periods.map((period) => (
                <button
                  key={period}
                  className={`period-button ${selectedPeriod === period ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period}
                </button>
              ))}
            </div>
            <div className="filter-controls">
              <button className="date-select-button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 1V5M11 1V5M2 7H14" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Select dates
              </button>
              <button className="filters-button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1 4H15M3 8H13M5 12H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Filters
              </button>
            </div>
          </div>

          {/* Analytics Chart */}
          <AnalyticsChart data={[]} total={400} />

          {/* Campaigns Grid */}
          <div className="campaigns-grid">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onToggleStatus={toggleCampaignStatus}
                onEdit={handleEditCampaign}
                onDelete={handleDeleteCampaign}
                onDuplicate={handleDuplicateCampaign}
              />
            ))}
          </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;