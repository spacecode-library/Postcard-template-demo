import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Table from '../components/common/Table';
import StatusBadge from '../components/common/StatusBadge';
import EngagementValue from '../components/common/EngagementValue';
import ActionButtons from '../components/common/ActionButtons';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { mockCampaigns } from '../services/mockData';
import './History.css';

const History = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState(mockCampaigns);

  const handleCreateNewBlast = () => {
    navigate('/create-blast');
  };

  const handleEditCampaign = (campaignId) => {
    console.log('Edit campaign:', campaignId);
  };

  const handleCopyCampaign = (campaignId) => {
    console.log('Copy campaign:', campaignId);
  };

  const handleRefreshCampaign = (campaignId) => {
    console.log('Refresh campaign:', campaignId);
  };

  const handleDeleteCampaign = (campaignId) => {
    setCampaigns(campaigns.filter(campaign => campaign.id !== campaignId));
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
                Create New Blast
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
          <Table 
            columns={columns}
            data={filteredCampaigns}
            className="history-table"
          />
      </div>
    </DashboardLayout>
  );
};

export default History;