// Mock data for campaigns/blasts
export const mockCampaigns = [
  {
    id: 1,
    blastName: '16th Avenue',
    status: 'Draft',
    createdDate: 'Wed 1:00pm',
    sentDate: 'Wed 1:00pm',
    recipients: 'Michael',
    engagement: -20,
    targetLocation: 'ZIP: 43219',
    postcardsSent: 150,
    clickRate: '2.5%',
    conversionRate: '0.8%'
  },
  {
    id: 2,
    blastName: '16th Avenue',
    status: 'Sent',
    createdDate: 'Wed 7:20am',
    sentDate: 'Wed 7:20am',
    recipients: 'Rob',
    engagement: -50,
    targetLocation: 'Radius: 5 miles',
    postcardsSent: 300,
    clickRate: '3.1%',
    conversionRate: '1.2%'
  },
  {
    id: 3,
    blastName: '16th Avenue',
    status: 'Scheduled',
    createdDate: 'Wed 2:45am',
    sentDate: 'Wed 2:45am',
    recipients: 'Edwin',
    engagement: -10,
    targetLocation: 'ZIP: 43220, 43221',
    postcardsSent: 250,
    clickRate: '1.8%',
    conversionRate: '0.5%'
  },
  {
    id: 4,
    blastName: '16th Avenue',
    status: 'In-Progress',
    createdDate: 'Tue 6:10pm',
    sentDate: 'Tue 6:10pm',
    recipients: 'Micah',
    engagement: 200,
    targetLocation: 'Radius: 10 miles',
    postcardsSent: 500,
    clickRate: '5.2%',
    conversionRate: '2.1%'
  },
  {
    id: 5,
    blastName: '16th Avenue',
    status: 'Sent',
    createdDate: 'Tue 7:52am',
    sentDate: 'Tue 7:52am',
    recipients: 'Leny',
    engagement: -50,
    targetLocation: 'ZIP: 43219',
    postcardsSent: 180,
    clickRate: '2.3%',
    conversionRate: '0.9%'
  },
  {
    id: 6,
    blastName: '16th Avenue',
    status: 'Sent',
    createdDate: 'Tue 12:15pm',
    sentDate: 'Tue 12:15pm',
    recipients: 'Bruno',
    engagement: 100,
    targetLocation: 'Radius: 3 miles',
    postcardsSent: 420,
    clickRate: '4.5%',
    conversionRate: '1.8%'
  },
  {
    id: 7,
    blastName: '16th Avenue',
    status: 'Sent',
    createdDate: 'Tue 5:40am',
    sentDate: 'Tue 5:40am',
    recipients: 'Tyler',
    engagement: 240,
    targetLocation: 'ZIP: 43219, 43220',
    postcardsSent: 650,
    clickRate: '6.1%',
    conversionRate: '2.5%'
  }
];

// Mock data for user profile
export const mockUserProfile = {
  id: 1,
  firstName: 'Olivia',
  lastName: 'Rhye',
  email: 'user@company.com',
  phone: '+1 (555) 987-6543',
  avatar: null,
  role: 'Marketing Manager',
  company: 'Acme Corp',
  timezone: 'America/New_York',
  language: 'English',
  notifications: {
    email: true,
    push: true,
    sms: false
  },
  twoFactorEnabled: true,
  lastLogin: '2025-01-07T10:30:00Z',
  createdAt: '2024-06-15T08:00:00Z'
};

// Mock data for dashboard metrics
export const mockDashboardMetrics = {
  totalCampaigns: 24,
  activeCampaigns: 5,
  totalPostcardsSent: 12500,
  averageEngagement: 3.2,
  monthlyGrowth: 12.5,
  recentActivity: [
    { date: 'Jan', postcards: 1200 },
    { date: 'Feb', postcards: 1500 },
    { date: 'Mar', postcards: 1800 },
    { date: 'Apr', postcards: 2200 },
    { date: 'May', postcards: 2500 },
    { date: 'Jun', postcards: 2800 },
    { date: 'Jul', postcards: 3200 },
    { date: 'Aug', postcards: 3500 },
    { date: 'Sep', postcards: 3800 },
    { date: 'Oct', postcards: 4200 },
    { date: 'Nov', postcards: 4500 },
    { date: 'Dec', postcards: 4800 }
  ]
};