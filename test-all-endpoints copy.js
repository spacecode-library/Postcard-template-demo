const axios = require('axios');
const colors = require('colors');

// Configure colors
colors.setTheme({
  success: 'green',
  error: 'red',
  warning: 'yellow',
  info: 'cyan',
  header: 'magenta'
});

// Base configuration
const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let userId = '';
let companyId = '';
let templateId = '';
let campaignId = '';

// Test data
const testUser = {
  email: `test${Date.now()}@example.com`,
  password: 'Test123!@#',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890'
};

const testCompany = {
  name: 'Test Company Inc',
  website: 'https://testcompany.com',
  industry: 'Technology',
  address: {
    line1: '123 Test Street',
    line2: 'Suite 100',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105'
  }
};

// Helper function to make requests
async function makeRequest(method, endpoint, data = null, useAuth = false) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };

    if (useAuth && authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n' + '=== HEALTH CHECK ==='.header);
  const result = await makeRequest('GET', '/../health');
  
  if (result.success) {
    console.log('✅ Health check passed'.success);
    console.log('Response:', JSON.stringify(result.data, null, 2));
  } else {
    console.log('❌ Health check failed'.error);
    console.log('Error:', result.error);
  }
}

async function testAuthEndpoints() {
  console.log('\n' + '=== AUTHENTICATION ENDPOINTS ==='.header);
  
  // Test registration
  console.log('\n1. Testing user registration...'.info);
  const registerResult = await makeRequest('POST', '/auth/register', testUser);
  
  if (registerResult.success) {
    console.log('✅ Registration successful'.success);
    authToken = registerResult.data.data.token;
    userId = registerResult.data.data.user.id;
    console.log('User ID:', userId);
    console.log('Auth Token:', authToken.substring(0, 20) + '...');
  } else {
    console.log('❌ Registration failed'.error);
    console.log('Error:', registerResult.error);
  }
  
  // Test login
  console.log('\n2. Testing user login...'.info);
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (loginResult.success) {
    console.log('✅ Login successful'.success);
    authToken = loginResult.data.data.token;
    console.log('Response:', JSON.stringify(loginResult.data.data.user, null, 2));
  } else {
    console.log('❌ Login failed'.error);
    console.log('Error:', loginResult.error);
  }
  
  // Test token verification
  console.log('\n3. Testing token verification...'.info);
  const verifyResult = await makeRequest('GET', '/auth/verify', null, true);
  
  if (verifyResult.success) {
    console.log('✅ Token verification successful'.success);
    console.log('User data:', JSON.stringify(verifyResult.data.data.user, null, 2));
  } else {
    console.log('❌ Token verification failed'.error);
    console.log('Error:', verifyResult.error);
  }
  
  // Test invalid login
  console.log('\n4. Testing invalid login...'.info);
  const invalidLoginResult = await makeRequest('POST', '/auth/login', {
    email: testUser.email,
    password: 'wrongpassword'
  });
  
  if (!invalidLoginResult.success && invalidLoginResult.status === 400) {
    console.log('✅ Invalid login correctly rejected'.success);
  } else {
    console.log('❌ Invalid login test failed'.error);
    console.log('Result:', invalidLoginResult);
  }
}

async function testUserEndpoints() {
  console.log('\n' + '=== USER ENDPOINTS ==='.header);
  
  // Test get profile
  console.log('\n1. Testing get user profile...'.info);
  const profileResult = await makeRequest('GET', '/user/profile', null, true);
  
  if (profileResult.success) {
    console.log('✅ Get profile successful'.success);
    console.log('Profile:', JSON.stringify(profileResult.data.data, null, 2));
  } else {
    console.log('❌ Get profile failed'.error);
    console.log('Error:', profileResult.error);
  }
  
  // Test update profile
  console.log('\n2. Testing update user profile...'.info);
  const updateResult = await makeRequest('PUT', '/user/profile', {
    firstName: 'Updated',
    lastName: 'Name',
    phone: '+9876543210'
  }, true);
  
  if (updateResult.success) {
    console.log('✅ Update profile successful'.success);
    console.log('Updated user:', JSON.stringify(updateResult.data.data.user, null, 2));
  } else {
    console.log('❌ Update profile failed'.error);
    console.log('Error:', updateResult.error);
  }
}

async function testCompanyEndpoints() {
  console.log('\n' + '=== COMPANY ENDPOINTS ==='.header);
  
  // Test company setup
  console.log('\n1. Testing company setup...'.info);
  const setupResult = await makeRequest('POST', '/company/setup', testCompany, true);
  
  if (setupResult.success) {
    console.log('✅ Company setup successful'.success);
    companyId = setupResult.data.data.company.id;
    console.log('Company ID:', companyId);
    console.log('Company:', JSON.stringify(setupResult.data.data.company, null, 2));
  } else {
    console.log('❌ Company setup failed'.error);
    console.log('Error:', setupResult.error);
  }
  
  // Test company enrichment
  console.log('\n2. Testing company enrichment...'.info);
  const enrichResult = await makeRequest('POST', '/company/enrich', {
    website: 'https://example.com'
  }, true);
  
  if (enrichResult.success) {
    console.log('✅ Company enrichment successful'.success);
    console.log('Enriched data:', JSON.stringify(enrichResult.data.data, null, 2));
  } else {
    console.log('❌ Company enrichment failed'.error);
    console.log('Error:', enrichResult.error);
  }
}

async function testTemplateEndpoints() {
  console.log('\n' + '=== TEMPLATE ENDPOINTS ==='.header);
  
  // Test get templates
  console.log('\n1. Testing get templates...'.info);
  const getTemplatesResult = await makeRequest('GET', '/templates', null, true);
  
  if (getTemplatesResult.success) {
    console.log('✅ Get templates successful'.success);
    console.log('Templates count:', getTemplatesResult.data.data.templates.length);
    if (getTemplatesResult.data.data.templates.length > 0) {
      templateId = getTemplatesResult.data.data.templates[0].id;
    }
  } else {
    console.log('❌ Get templates failed'.error);
    console.log('Error:', getTemplatesResult.error);
  }
  
  // Test generate template
  console.log('\n2. Testing template generation...'.info);
  const generateResult = await makeRequest('POST', '/templates/generate', {
    prompt: 'Create a modern welcome postcard for new movers with a friendly message',
    category: 'new_mover',
    brandColors: ['#FF0000', '#0000FF'],
    includeCompanyLogo: true
  }, true);
  
  if (generateResult.success) {
    console.log('✅ Template generation successful'.success);
    templateId = generateResult.data.data.template.id;
    console.log('Template ID:', templateId);
    console.log('Template:', JSON.stringify(generateResult.data.data.template, null, 2));
  } else {
    console.log('❌ Template generation failed'.error);
    console.log('Error:', generateResult.error);
  }
}

async function testCampaignEndpoints() {
  console.log('\n' + '=== CAMPAIGN ENDPOINTS ==='.header);
  
  // Test create campaign
  console.log('\n1. Testing campaign creation...'.info);
  const createResult = await makeRequest('POST', '/campaigns', {
    name: 'Test Campaign',
    type: 'new_mover',
    templateId: templateId || 'test-template-id',
    targetCriteria: JSON.stringify({
      radius: 5,
      zipCodes: ['94105', '94107'],
      homeValue: {
        min: 500000,
        max: 2000000
      }
    }),
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }, true);
  
  if (createResult.success) {
    console.log('✅ Campaign creation successful'.success);
    campaignId = createResult.data.data.campaign.id;
    console.log('Campaign ID:', campaignId);
    console.log('Campaign:', JSON.stringify(createResult.data.data.campaign, null, 2));
  } else {
    console.log('❌ Campaign creation failed'.error);
    console.log('Error:', createResult.error);
  }
  
  // Test get campaigns
  console.log('\n2. Testing get campaigns...'.info);
  const getCampaignsResult = await makeRequest('GET', '/campaigns', null, true);
  
  if (getCampaignsResult.success) {
    console.log('✅ Get campaigns successful'.success);
    console.log('Campaigns count:', getCampaignsResult.data.data.campaigns.length);
  } else {
    console.log('❌ Get campaigns failed'.error);
    console.log('Error:', getCampaignsResult.error);
  }
}

async function testAnalyticsEndpoints() {
  console.log('\n' + '=== ANALYTICS ENDPOINTS ==='.header);
  
  // Test dashboard analytics
  console.log('\n1. Testing dashboard analytics...'.info);
  const dashboardResult = await makeRequest('GET', '/analytics/dashboard?period=30d', null, true);
  
  if (dashboardResult.success) {
    console.log('✅ Dashboard analytics successful'.success);
    console.log('Analytics:', JSON.stringify(dashboardResult.data.data, null, 2));
  } else {
    console.log('❌ Dashboard analytics failed'.error);
    console.log('Error:', dashboardResult.error);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Postcard Backend API Tests'.header);
  console.log('Base URL:', BASE_URL);
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    await testHealthCheck();
    await testAuthEndpoints();
    
    // Only run these if we have a valid auth token
    if (authToken) {
      await testUserEndpoints();
      await testCompanyEndpoints();
      await testTemplateEndpoints();
      await testCampaignEndpoints();
      await testAnalyticsEndpoints();
    }
    
    console.log('\n✅ All tests completed!'.success);
  } catch (error) {
    console.log('\n❌ Test suite failed:'.error, error.message);
  }
}

// Check if colors package is installed
try {
  require('colors');
} catch (e) {
  console.log('Installing required packages...');
  require('child_process').execSync('npm install colors', { stdio: 'inherit' });
}

// Run tests
runAllTests();