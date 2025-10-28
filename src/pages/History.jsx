import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Table from '../components/common/Table';
import StatusBadge from '../components/common/StatusBadge';
import EngagementValue from '../components/common/EngagementValue';
import ActionButtons from '../components/common/ActionButtons';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import campaignService from '../supabase/api/campaignService';
import toast from 'react-hot-toast';
import './History.css';

const History = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load campaigns on mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const result = await campaignService.getCampaigns();

      if (result.success) {
        // Transform campaign data to match table format
        const transformedCampaigns = result.campaigns.map(campaign => ({
          id: campaign.id,
          blastName: campaign.campaign_name || 'Untitled Campaign',
          status: campaign.status || 'draft',
          createdDate: campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'N/A',
          sentDate: campaign.launched_at ? new Date(campaign.launched_at).toLocaleDateString() : '-',
          recipients: campaign.total_recipients ? campaign.total_recipients.toLocaleString() : '0',
          engagement: campaign.response_rate || 0,
          // Keep original data for editing
          _original: campaign
        }));

        setCampaigns(transformedCampaigns);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewBlast = () => {
    // Clear any existing blast data
    sessionStorage.removeItem('blastData');
    navigate('/blast/step1');
  };

  const handleEditCampaign = (campaignId) => {
    navigate(`/campaign/${campaignId}/edit`);
  };

  const handleCopyCampaign = async (campaignId) => {
    try {
      toast.loading('Duplicating campaign...', { id: 'copy-campaign' });

      const result = await campaignService.duplicateCampaign(campaignId);

      if (result.success) {
        toast.success('Campaign duplicated successfully!', { id: 'copy-campaign' });
        // Reload campaigns to show the new copy
        loadCampaigns();
      }
    } catch (error) {
      console.error('Error copying campaign:', error);
      toast.error('Failed to duplicate campaign', { id: 'copy-campaign' });
    }
  };

  const handleRefreshCampaign = () => {
    loadCampaigns();
    toast.success('Campaigns refreshed');
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      toast.loading('Deleting campaign...', { id: 'delete-campaign' });

      const result = await campaignService.deleteCampaign(campaignId);

      if (result.success) {
        toast.success('Campaign deleted successfully', { id: 'delete-campaign' });
        // Remove from local state
        setCampaigns(campaigns.filter(campaign => campaign.id !== campaignId));
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign', { id: 'delete-campaign' });
    }
  };


  // Filter campaigns based on search query
  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.blastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.recipients.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'blastName',
      title: 'Blast Name',
      sortable: true,
      className: 'blast-name-header',
      cellClassName: 'blast-name-cell'
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      className: 'status-header',
      cellClassName: 'status-cell',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'createdDate',
      title: 'Created Date',
      sortable: true,
      className: 'date-header',
      cellClassName: 'date-cell'
    },
    {
      key: 'sentDate',
      title: 'Sent Date',
      sortable: true,
      className: 'date-header',
      cellClassName: 'date-cell'
    },
    {
      key: 'recipients',
      title: 'Recipients',
      sortable: true,
      className: 'recipients-header',
      cellClassName: 'recipients-cell'
    },
    {
      key: 'engagement',
      title: 'Engagement',
      sortable: true,
      className: 'engagement-header',
      cellClassName: 'engagement-cell',
      render: (value) => <EngagementValue value={value} />
    },
    {
      key: 'actions',
      title: '',
      className: 'actions-header',
      cellClassName: 'actions-cell',
      render: (_, campaign) => (
        <ActionButtons
          onEdit={() => handleEditCampaign(campaign.id)}
          onCopy={() => handleCopyCampaign(campaign.id)}
          onRefresh={() => handleRefreshCampaign(campaign.id)}
          onDelete={() => handleDeleteCampaign(campaign.id)}
        />
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="history-page">
          {/* Header */}
          <div className="history-header">
            <h1 className="history-title">New Mover</h1>
            <div className="header-actions">
              <Button 
                variant="secondary"
                onClick={() => navigate('/settings')}
              >
                Settings
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateNewBlast}
                icon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                }
              >
                New Blast
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="history-search-section">
            <div className="history-search-input-container">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search" 
                className="history-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-shortcut">⌘K</span>
            </div>
          </div>

          {/* Data Table */}
          {isLoading ? (
            <div className="loading-container">
              <div>
                <div className="spinner"></div>
                <p>Loading campaigns...</p>
              </div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="8" y="16" width="48" height="32" rx="4" stroke="#CBD5E0" strokeWidth="2"/>
                <circle cx="20" cy="28" r="4" fill="#E2E8F0"/>
                <path d="M8 40L24 28L36 36L56 20" stroke="#CBD5E0" strokeWidth="2"/>
              </svg>
              <h3>No campaigns yet</h3>
              <p>Create your first campaign to get started</p>
              <Button variant="primary" onClick={handleCreateNewBlast}>
                Create New Campaign
              </Button>
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredCampaigns}
              className="history-table"
            />
          )}
      </div>

      <style>{`
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 300px);
          width: 100%;
          padding: 40px 20px;
        }

        .loading-container > div {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        .loading-container p {
          color: #718096;
          font-size: 14px;
          margin: 0;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 400px);
          padding: 80px 20px;
          gap: 20px;
          text-align: center;
          animation: fadeIn 0.4s ease-out;
        }

        .empty-state svg {
          opacity: 0.6;
          margin-bottom: 12px;
        }

        .empty-state h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #1A202C;
        }

        .empty-state p {
          margin: 0;
          font-size: 16px;
          color: #718096;
          line-height: 1.6;
          max-width: 400px;
          margin-bottom: 12px;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default History;