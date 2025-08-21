import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import analyticsService from '../services/analytics.service'
import campaignService from '../services/campaign.service'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  LogOut, 
  Mail, 
  Target, 
  TrendingUp, 
  DollarSign,
  Plus,
  ChevronRight,
  Calendar
} from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [timeRange, setTimeRange] = useState('30d')

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      const response = await analyticsService.getDashboardAnalytics(timeRange)
      return response.data
    },
  })

  // Fetch recent campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await campaignService.getCampaigns({ limit: 5 })
      return response.data.campaigns
    },
  })

  if (analyticsLoading || campaignsLoading) {
    return <LoadingSpinner fullScreen />
  }

  const stats = [
    {
      label: 'Total Campaigns',
      value: analytics?.overview?.totalCampaigns || 0,
      icon: Mail,
      color: '#7F56D9',
    },
    {
      label: 'Postcards Sent',
      value: analytics?.overview?.totalPostcardsSent || 0,
      icon: Target,
      color: '#12B76A',
    },
    {
      label: 'Delivery Rate',
      value: `${analytics?.overview?.deliveryRate || 0}%`,
      icon: TrendingUp,
      color: '#1570EF',
    },
    {
      label: 'Total Spent',
      value: `$${analytics?.overview?.totalSpent || 0}`,
      icon: DollarSign,
      color: '#F79009',
    },
  ]

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <span>Postcard</span>
            </div>
            <h1>Dashboard</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-email">{user?.email}</span>
            </div>
            <button className="logout-button" onClick={logout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h2>Welcome back, {user?.firstName}!</h2>
          <p>Here's what's happening with your postcard campaigns.</p>
        </section>

        {/* Time Range Selector */}
        <div className="time-range-selector">
          <button 
            className={timeRange === '7d' ? 'active' : ''}
            onClick={() => setTimeRange('7d')}
          >
            Last 7 days
          </button>
          <button 
            className={timeRange === '30d' ? 'active' : ''}
            onClick={() => setTimeRange('30d')}
          >
            Last 30 days
          </button>
          <button 
            className={timeRange === '90d' ? 'active' : ''}
            onClick={() => setTimeRange('90d')}
          >
            Last 90 days
          </button>
          <button 
            className={timeRange === '1y' ? 'active' : ''}
            onClick={() => setTimeRange('1y')}
          >
            Last year
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <h3 className="stat-value">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Campaign Section */}
        <section className="campaigns-section">
          <div className="section-header">
            <h3>Recent Campaigns</h3>
            <button className="new-campaign-button">
              <Plus size={20} />
              <span>New Campaign</span>
            </button>
          </div>

          {campaigns && campaigns.length > 0 ? (
            <div className="campaigns-list">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="campaign-card">
                  <div className="campaign-info">
                    <h4>{campaign.name}</h4>
                    <div className="campaign-meta">
                      <span className={`campaign-status ${campaign.status}`}>
                        {campaign.status}
                      </span>
                      <span className="campaign-date">
                        <Calendar size={16} />
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="campaign-stats">
                    <div className="campaign-stat">
                      <span className="stat-label">Recipients</span>
                      <span className="stat-value">{campaign.totalRecipients}</span>
                    </div>
                    <div className="campaign-stat">
                      <span className="stat-label">Cost</span>
                      <span className="stat-value">${campaign.totalCost}</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="campaign-arrow" />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Mail size={48} className="empty-icon" />
              <h4>No campaigns yet</h4>
              <p>Create your first campaign to start sending postcards</p>
              <button className="new-campaign-button primary">
                <Plus size={20} />
                <span>Create Campaign</span>
              </button>
            </div>
          )}
        </section>

        {/* Recent Activity */}
        {analytics?.recentActivity && analytics.recentActivity.length > 0 && (
          <section className="activity-section">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    <Mail size={16} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">
                      {activity.type === 'campaign_sent' && `Campaign "${activity.campaignName}" sent`}
                      {activity.details && ` - ${activity.details}`}
                    </p>
                    <span className="activity-time">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default Dashboard