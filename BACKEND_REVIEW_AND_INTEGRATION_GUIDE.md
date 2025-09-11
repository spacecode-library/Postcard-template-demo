# Backend Review and Integration Guide for MovePost

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Service Integration Analysis](#service-integration-analysis)
3. [Frontend-to-Backend Endpoint Mapping](#frontend-to-backend-endpoint-mapping)
4. [Detailed Service Integration Guides](#detailed-service-integration-guides)
5. [Professional Backend Architecture](#professional-backend-architecture)
6. [Missing Endpoints and Corrections](#missing-endpoints-and-corrections)
7. [Implementation Timeline](#implementation-timeline)

## Executive Summary

After comprehensive review of the frontend implementation and available services, this document provides:
- Complete mapping of all frontend screens to required backend endpoints
- Detailed integration guides for each service based on actual API documentation
- Professional backend architecture patterns for reliability and scalability
- Corrections and additions to the original backend plan

### Key Findings
1. **Frontend has 6-step onboarding flow** that requires specific endpoint sequencing
2. **Services confirmed via email invites**: Supabase, Stripe, PostHog, Netlify, GitHub, Postman, Namecheap
3. **API keys provided**: Brandfetch and DynaPictures
4. **Missing from original plan**: Settings page endpoints, email verification flow, session management
5. **Phase 2 features** (Blast) are partially implemented in frontend

## Service Integration Analysis

### Available Services (Confirmed via Email Invites)

| Service | Purpose | Status | Integration Priority |
|---------|---------|---------|---------------------|
| **Supabase** | Backend Infrastructure | ✅ Invited (2x) | Critical - Day 1 |
| **Stripe** | Payment Processing | ✅ Invited | Critical - Week 2 |
| **PostHog** | Analytics | ✅ Invited | High - Week 1 |
| **Netlify** | Frontend Hosting | ✅ Invited (3x) | Critical - Day 1 |
| **GitHub** | Version Control | ✅ Repository Created | Critical - Day 1 |
| **Postman** | API Documentation | ✅ Team Invited | High - Week 1 |
| **Brandfetch** | Brand Data | ✅ API Key Provided | Critical - Week 1 |
| **DynaPictures** | Design Generation | ✅ API Key Provided | Critical - Week 1 |
| **Lob** | Direct Mail | ❌ Not Yet | Critical - Week 2 |

### Service Not Yet Integrated
- **Google OAuth** - Needs Google Cloud Console setup
- **Google Places API** - For address validation
- **New Mover Data Provider** - Phase 2

## Frontend-to-Backend Endpoint Mapping

### Authentication Flow (/login, /signup)

#### Login Page Requirements
```javascript
// Frontend: src/pages/auth/Login.jsx
Endpoints Required:
1. POST /api/auth/login
2. POST /api/auth/google
3. POST /api/auth/forgot-password
4. GET /api/auth/verify-session

Missing from original plan:
- Session verification on app load
- Remember me functionality
- Password reset flow
```

#### SignUp Page Requirements
```javascript
// Frontend: src/pages/auth/SignUp.jsx
Endpoints Required:
1. POST /api/auth/register
2. POST /api/auth/google
3. POST /api/auth/verify-email
4. POST /api/auth/resend-verification

Missing from original plan:
- Email verification endpoints
- Terms acceptance tracking
```

### Onboarding Flow (6 Steps)

#### Step 1: Business Information (/onboarding/step1)
```javascript
// Frontend: src/pages/onboarding/OnboardingStep1.jsx
Current Implementation:
- Collects: firstName, lastName, email, businessName, website, businessCategory
- Stores in localStorage

Required Endpoints:
1. POST /api/company/analyze - Extract brand data from website
2. POST /api/user/profile - Update user profile
3. GET /api/company/categories - Get business categories list

Backend Changes Needed:
- Add business category to company schema
- Create categories lookup table
- Add profile completion tracking
```

#### Step 2: Template Selection (/onboarding/step2)
```javascript
// Frontend: src/pages/onboarding/OnboardingStep2.jsx
Required Endpoints:
1. POST /api/postcards/generate-templates
2. GET /api/postcards/templates/:id
3. GET /api/postcards/categories

Additional Requirements:
- Template caching for performance
- Industry-specific template filtering
```

#### Step 3: Postcard Editor (/onboarding/step3)
```javascript
// Frontend: src/pages/onboarding/OnboardingStep3.jsx
Required Endpoints:
1. POST /api/postcards/customize
2. POST /api/postcards/preview
3. POST /api/storage/upload-logo
4. GET /api/postcards/:id

Missing from original plan:
- Real-time preview generation
- Logo upload endpoint
- Auto-save functionality
```

#### Step 4: Targeting & Budget (/onboarding/step4)
```javascript
// Frontend: src/pages/onboarding/OnboardingStep4.jsx
Current Implementation:
- Business Radius with map integration
- ZIP code selection
- Home owners vs renters filter

Required Endpoints:
1. POST /api/campaigns/calculate-targeting
2. POST /api/geocoding/address-to-coords
3. GET /api/geocoding/zips-in-radius
4. GET /api/pricing/volume-tiers

Missing from original plan:
- Map integration endpoints
- Real-time pricing updates
- Home owners/renters filtering
```

#### Step 5: Payment Setup (/onboarding/step5)
```javascript
// Frontend: src/pages/onboarding/OnboardingStep5.jsx
Required Endpoints:
1. POST /api/billing/create-setup-intent
2. POST /api/billing/confirm-payment-method
3. GET /api/billing/payment-methods
4. POST /api/billing/set-default-payment

Integration with Stripe:
- Use Stripe Elements for secure card collection
- Setup Intent for future charges
```

#### Step 6: Launch Campaign (/onboarding/step6)
```javascript
// Frontend: src/pages/onboarding/OnboardingStep6.jsx
Required Endpoints:
1. POST /api/campaigns/create
2. POST /api/campaigns/activate
3. GET /api/campaigns/:id/summary
4. POST /api/onboarding/complete

Missing from original plan:
- Onboarding completion tracking
- Welcome email trigger
```

### Dashboard (/dashboard)

```javascript
// Frontend: src/pages/Dashboard.jsx
Current Implementation:
- Campaign cards with status toggle
- Analytics chart
- Time period filters

Required Endpoints:
1. GET /api/campaigns/list
2. PUT /api/campaigns/:id/toggle-status
3. GET /api/analytics/dashboard
4. GET /api/analytics/chart-data
5. DELETE /api/campaigns/:id
6. POST /api/campaigns/:id/duplicate

Missing from original plan:
- Campaign duplication
- Time period filtering for analytics
- Real-time status updates
```

### History Page (/history)

```javascript
// Frontend: src/pages/History.jsx
Current Implementation:
- Shows all mailings with status
- Search functionality
- Action buttons (edit, copy, refresh, delete)

Required Endpoints:
1. GET /api/mailings/history
2. GET /api/mailings/search
3. POST /api/mailings/:id/resend
4. GET /api/mailings/:id/details
5. PUT /api/mailings/:id/notes

Missing from original plan:
- Search endpoint
- Resend functionality
- Detailed mailing view
```

### Settings Page (/settings)

```javascript
// Frontend: src/pages/Settings.jsx
Components: ProfileTab, BusinessTab

Required Endpoints:
1. GET /api/user/profile
2. PUT /api/user/profile
3. PUT /api/user/change-password
4. GET /api/company
5. PUT /api/company
6. GET /api/billing/subscription
7. GET /api/settings/referral-code
8. DELETE /api/user/account

Missing from original plan:
- Complete settings endpoints
- Referral code generation
- Account deletion flow
```

### Create Campaign (/create-campaign)

```javascript
// Frontend: src/pages/CreateCampaign.jsx
6-step flow similar to onboarding

Additional Endpoints:
1. GET /api/postcards/saved-designs
2. POST /api/campaigns/save-draft
3. GET /api/campaigns/drafts
```

### Create Blast (/create-blast) - Phase 2

```javascript
// Frontend: src/pages/CreateBlast.jsx
Required Endpoints:
1. POST /api/blast/calculate-recipients
2. POST /api/blast/create
3. GET /api/blast/history
```

## Detailed Service Integration Guides

### 1. Supabase Integration

```javascript
// Installation
npm install @supabase/supabase-js

// Configuration (supabase.config.js)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Public client for frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service client for backend
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
```

#### Authentication Setup
```javascript
// Enable Google OAuth in Supabase Dashboard
// Configure redirect URLs:
// - http://localhost:3000/auth/callback
// - https://yourdomain.com/auth/callback

// Auth implementation
export const authService = {
  // Email/Password signup
  async signUp(email, password, metadata) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    return { data, error }
  },

  // Google OAuth
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'email profile'
      }
    })
    return { data, error }
  },

  // Session management
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}
```

#### Database Setup
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own company" ON companies
  FOR ALL USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

#### Storage Configuration
```javascript
// Create buckets in Supabase Dashboard:
// - logos (public)
// - postcards (public)
// - temp-uploads (private)

// Storage implementation
export const storageService = {
  async uploadLogo(file, companyId) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${companyId}-${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName)
    
    return publicUrl
  }
}
```

### 2. Stripe Integration

```javascript
// Installation
npm install stripe @stripe/stripe-js

// Backend configuration
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Frontend configuration
import { loadStripe } from '@stripe/stripe-js'
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
```

#### Payment Setup Implementation
```javascript
// Backend: Create Setup Intent
export async function createSetupIntent(req, res) {
  const { companyId } = req.body
  
  // Create or retrieve Stripe customer
  let customer = await getStripeCustomer(companyId)
  if (!customer) {
    const company = await getCompany(companyId)
    customer = await stripe.customers.create({
      email: company.email,
      name: company.name,
      metadata: { companyId }
    })
  }
  
  // Create setup intent
  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    payment_method_types: ['card'],
    usage: 'off_session',
  })
  
  return res.json({ 
    clientSecret: setupIntent.client_secret,
    customerId: customer.id 
  })
}

// Frontend: Payment form
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

function PaymentForm({ clientSecret }) {
  const stripe = useStripe()
  const elements = useElements()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const { error } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: companyName }
      }
    })
    
    if (!error) {
      // Save payment method on backend
      await savePaymentMethod(paymentMethodId)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Save Card</button>
    </form>
  )
}
```

#### Usage-Based Billing
```javascript
// Track postcard usage
export async function recordUsage(companyId, quantity, unitAmount) {
  const record = await supabase
    .from('usage_records')
    .insert({
      company_id: companyId,
      quantity,
      unit_amount: unitAmount,
      total_amount: quantity * unitAmount,
      period_start: startOfMonth(),
      period_end: endOfMonth()
    })
  
  return record
}

// Monthly billing job
export async function processMonthlyBilling() {
  const companies = await getCompaniesWithUsage()
  
  for (const company of companies) {
    const invoice = await stripe.invoices.create({
      customer: company.stripe_customer_id,
      collection_method: 'charge_automatically',
      auto_advance: true,
      metadata: { 
        company_id: company.id,
        period: currentMonth() 
      }
    })
    
    // Add line items for postcards
    await stripe.invoiceItems.create({
      customer: company.stripe_customer_id,
      invoice: invoice.id,
      quantity: company.postcards_sent,
      price_data: {
        currency: 'usd',
        unit_amount: calculateUnitPrice(company.postcards_sent),
        product_data: {
          name: 'Postcards Sent',
          description: `${company.postcards_sent} postcards in ${currentMonth()}`
        }
      }
    })
    
    // Finalize and charge
    await stripe.invoices.finalizeInvoice(invoice.id)
    await stripe.invoices.pay(invoice.id)
  }
}
```

### 3. Brandfetch Integration

```javascript
// API Configuration
const BRANDFETCH_API_KEY = 'mc30VsdsPg7ipaZ8WyJoQQj3NKEJC6RsqdlNIhhvycE='
const BRANDFETCH_API_URL = 'https://api.brandfetch.com/v2'

// Implementation
export async function analyzeBrand(websiteUrl) {
  try {
    // Clean URL
    const domain = new URL(websiteUrl).hostname.replace('www.', '')
    
    // Fetch brand data
    const response = await fetch(`${BRANDFETCH_API_URL}/brands/${domain}`, {
      headers: {
        'Authorization': `Bearer ${BRANDFETCH_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Brand not found')
    }
    
    const brandData = await response.json()
    
    // Extract relevant data
    const extracted = {
      name: brandData.name || domain,
      logo: extractLogo(brandData.logos),
      colors: extractColors(brandData.colors),
      description: brandData.description,
      industry: brandData.classification?.category,
      fonts: extractFonts(brandData.fonts)
    }
    
    return extracted
  } catch (error) {
    // Fallback to web scraping
    return await fallbackWebScraping(websiteUrl)
  }
}

function extractLogo(logos) {
  if (!logos || logos.length === 0) return null
  
  // Prefer SVG, then PNG
  const logo = logos.find(l => l.type === 'logo')
  if (!logo) return null
  
  const format = logo.formats.find(f => f.format === 'svg') || 
                 logo.formats.find(f => f.format === 'png') ||
                 logo.formats[0]
  
  return format?.src || null
}

function extractColors(colors) {
  if (!colors || colors.length === 0) return { primary: '#000000', secondary: '#ffffff' }
  
  // Sort by prominence
  const sorted = colors.sort((a, b) => (b.prominence || 0) - (a.prominence || 0))
  
  return {
    primary: sorted[0]?.hex || '#000000',
    secondary: sorted[1]?.hex || sorted[0]?.hex || '#ffffff',
    palette: sorted.slice(0, 5).map(c => c.hex)
  }
}
```

### 4. DynaPictures Integration

```javascript
// API Configuration
const DYNAPICTURES_API_KEY = '20626fa775ee1e845ae758ece87aaba1577e3bedbb0775b1'
const DYNAPICTURES_API_URL = 'https://api.dynapictures.com/v1'

// Template Setup (one-time)
export async function setupPostcardTemplates() {
  // Create base templates for each industry
  const industries = ['restaurant', 'retail', 'services', 'healthcare', 'realestate']
  
  for (const industry of industries) {
    const template = await createTemplate({
      name: `${industry}_postcard_template`,
      width: 1875,  // 6.25" at 300 DPI
      height: 1275, // 4.25" at 300 DPI
      layers: [
        {
          type: 'rectangle',
          name: 'background',
          x: 0,
          y: 0,
          width: 1875,
          height: 1275,
          fill: '{{brandColor}}'
        },
        {
          type: 'image',
          name: 'logo',
          x: 100,
          y: 100,
          width: 300,
          height: 150,
          url: '{{logoUrl}}'
        },
        {
          type: 'text',
          name: 'headline',
          x: 100,
          y: 300,
          text: '{{headline}}',
          fontSize: 72,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          color: '{{textColor}}'
        },
        {
          type: 'text',
          name: 'offer',
          x: 100,
          y: 500,
          text: '{{offerText}}',
          fontSize: 48,
          fontFamily: 'Helvetica',
          color: '{{textColor}}'
        },
        {
          type: 'shape',
          name: 'coupon_box',
          x: 100,
          y: 700,
          width: 500,
          height: 200,
          borderStyle: 'dashed',
          borderWidth: 4,
          borderColor: '{{accentColor}}'
        },
        {
          type: 'text',
          name: 'coupon_code',
          x: 350,
          y: 800,
          text: '{{couponCode}}',
          fontSize: 36,
          fontFamily: 'Courier',
          textAlign: 'center',
          color: '{{accentColor}}'
        }
      ]
    })
  }
}

// Generate postcard variations
export async function generatePostcardTemplates(brandData, industry) {
  const templates = []
  const baseTemplateId = `${industry}_postcard_template`
  
  // Generate 30 variations
  const variations = [
    { headline: 'Welcome to the Neighborhood!', offer: 'Get {{discount}}% off your first order' },
    { headline: 'New Neighbor Special', offer: 'Free {{freeItem}} with any purchase' },
    { headline: 'Grand Opening for You!', offer: 'Buy One Get One Free' },
    // ... 27 more variations
  ]
  
  for (const [index, variation] of variations.entries()) {
    const imageUrl = await generateImage(baseTemplateId, {
      brandColor: brandData.colors.primary,
      logoUrl: brandData.logo,
      headline: variation.headline,
      offerText: variation.offer.replace('{{discount}}', '20').replace('{{freeItem}}', 'Dessert'),
      textColor: getContrastColor(brandData.colors.primary),
      accentColor: brandData.colors.secondary,
      couponCode: 'WELCOME20'
    })
    
    templates.push({
      id: `template_${index}`,
      thumbnailUrl: imageUrl,
      category: getCategoryFromVariation(index),
      suggestedOffer: variation.offer,
      data: variation
    })
  }
  
  return templates
}

// Generate final postcard
export async function generateFinalPostcard(templateId, customizations) {
  const frontUrl = await generateImage(templateId, {
    ...customizations,
    side: 'front'
  })
  
  const backUrl = await generateImage('postcard_back_template', {
    returnAddress: customizations.businessAddress,
    permitNumber: 'PERMIT #123',
    side: 'back'
  })
  
  return { frontUrl, backUrl }
}

async function generateImage(templateId, params) {
  const response = await fetch(`${DYNAPICTURES_API_URL}/templates/${templateId}/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DYNAPICTURES_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ params })
  })
  
  const { imageUrl } = await response.json()
  return imageUrl
}
```

### 5. PostHog Analytics Integration

```javascript
// Installation
npm install posthog-js posthog-node

// Frontend initialization
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  autocapture: true,
  capture_pageview: true,
  capture_pageleave: true
})

// Track user identification
export function identifyUser(user) {
  posthog.identify(user.id, {
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    company_id: user.companyId,
    created_at: user.createdAt
  })
}

// Track events
export const analytics = {
  // Onboarding events
  trackOnboardingStarted: () => posthog.capture('onboarding_started'),
  trackOnboardingStepCompleted: (step) => posthog.capture('onboarding_step_completed', { step }),
  trackOnboardingCompleted: () => posthog.capture('onboarding_completed'),
  
  // Campaign events
  trackCampaignCreated: (campaignData) => posthog.capture('campaign_created', campaignData),
  trackCampaignActivated: (campaignId) => posthog.capture('campaign_activated', { campaign_id: campaignId }),
  trackCampaignPaused: (campaignId) => posthog.capture('campaign_paused', { campaign_id: campaignId }),
  
  // Postcard events
  trackPostcardSent: (data) => posthog.capture('postcard_sent', data),
  trackPostcardDesigned: (templateId) => posthog.capture('postcard_designed', { template_id: templateId }),
  
  // Conversion events
  trackConversionMarked: (recipientId) => posthog.capture('conversion_marked', { recipient_id: recipientId }),
  
  // Revenue events
  trackRevenue: (amount) => posthog.capture('revenue', { amount })
}

// Backend tracking
import { PostHog } from 'posthog-node'
const posthogServer = new PostHog(process.env.POSTHOG_API_KEY)

export async function trackServerEvent(distinctId, event, properties) {
  posthogServer.capture({
    distinctId,
    event,
    properties: {
      ...properties,
      $ip: properties.ip,
      $current_url: properties.url
    }
  })
}
```

### 6. Lob Integration (Direct Mail)

```javascript
// Installation
npm install @lob/lob-typescript-sdk

// Configuration
import { Configuration, PostcardsApi } from '@lob/lob-typescript-sdk'

const config = new Configuration({
  username: process.env.LOB_API_KEY
})

const postcardApi = new PostcardsApi(config)

// Send postcard implementation
export async function sendPostcard(recipient, campaign, postcardDesign) {
  try {
    const postcard = await postcardApi.create({
      to: {
        name: recipient.name || 'Current Resident',
        address_line1: recipient.address_line1,
        address_line2: recipient.address_line2,
        address_city: recipient.city,
        address_state: recipient.state,
        address_zip: recipient.zip_code,
        address_country: 'US'
      },
      from: {
        name: campaign.company.name,
        address_line1: campaign.company.address,
        address_city: campaign.company.city,
        address_state: campaign.company.state,
        address_zip: campaign.company.zip_code,
        address_country: 'US'
      },
      size: mapPostcardSize(campaign.postcard_format),
      front: postcardDesign.front_url,
      back: postcardDesign.back_url,
      mail_type: 'usps_standard',
      merge_variables: {
        name: recipient.name,
        offer_code: campaign.offer_code
      },
      metadata: {
        campaign_id: campaign.id,
        recipient_id: recipient.id
      },
      send_date: new Date().toISOString()
    })
    
    return {
      lobId: postcard.id,
      expectedDeliveryDate: postcard.expected_delivery_date,
      trackingNumber: postcard.tracking_number,
      url: postcard.url,
      cost: parseFloat(postcard.price)
    }
  } catch (error) {
    console.error('Lob send error:', error)
    throw new Error(`Failed to send postcard: ${error.message}`)
  }
}

// Webhook handler for tracking
export async function handleLobWebhook(req, res) {
  const event = req.body
  
  switch (event.event_type.id) {
    case 'postcard.rendered_pdf':
      await updateMailingStatus(event.body.metadata.recipient_id, 'rendered')
      break
      
    case 'postcard.in_transit':
      await updateMailingStatus(event.body.metadata.recipient_id, 'in_transit')
      break
      
    case 'postcard.delivered':
      await updateMailingStatus(event.body.metadata.recipient_id, 'delivered')
      break
      
    case 'postcard.returned':
      await updateMailingStatus(event.body.metadata.recipient_id, 'returned')
      await addToBlockList(event.body.to)
      break
  }
  
  res.status(200).send('OK')
}

function mapPostcardSize(format) {
  const sizes = {
    'standard': '4x6',
    'premium': '6x9', 
    'deluxe': '6x11'
  }
  return sizes[format] || '4x6'
}
```

### 7. Google Services Integration

```javascript
// Google OAuth Setup (via Supabase)
// In Supabase Dashboard:
// 1. Authentication > Providers > Google
// 2. Add Client ID and Secret from Google Cloud Console
// 3. Configure redirect URLs

// Google Places API for Address Validation
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

export async function validateAddress(addressInput) {
  const autocompleteService = new google.maps.places.AutocompleteService()
  
  const predictions = await new Promise((resolve, reject) => {
    autocompleteService.getPlacePredictions({
      input: addressInput,
      types: ['address'],
      componentRestrictions: { country: 'us' }
    }, (predictions, status) => {
      if (status === 'OK') resolve(predictions)
      else reject(status)
    })
  })
  
  // Get detailed place info
  const placeService = new google.maps.places.PlacesService(document.createElement('div'))
  const placeDetails = await new Promise((resolve, reject) => {
    placeService.getDetails({
      placeId: predictions[0].place_id,
      fields: ['address_components', 'geometry', 'formatted_address']
    }, (place, status) => {
      if (status === 'OK') resolve(place)
      else reject(status)
    })
  })
  
  return {
    formatted: placeDetails.formatted_address,
    lat: placeDetails.geometry.location.lat(),
    lng: placeDetails.geometry.location.lng(),
    components: parseAddressComponents(placeDetails.address_components)
  }
}

// Calculate ZIP codes in radius
export async function getZipsInRadius(centerLat, centerLng, radiusMiles) {
  // Using a ZIP code database or service
  const query = `
    SELECT zip_code, city, state
    FROM zip_codes
    WHERE (
      3959 * acos(
        cos(radians($1)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians($2)) + 
        sin(radians($1)) * sin(radians(latitude))
      )
    ) <= $3
  `
  
  const { data } = await supabase.rpc('get_zips_in_radius', {
    center_lat: centerLat,
    center_lng: centerLng,
    radius_miles: radiusMiles
  })
  
  return data
}
```

## Professional Backend Architecture

### 1. Project Structure
```
backend/
├── src/
│   ├── api/
│   │   ├── auth/
│   │   ├── campaigns/
│   │   ├── postcards/
│   │   ├── billing/
│   │   └── admin/
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── campaign.service.js
│   │   ├── postcard.service.js
│   │   ├── billing.service.js
│   │   └── mailing.service.js
│   ├── integrations/
│   │   ├── supabase/
│   │   ├── stripe/
│   │   ├── brandfetch/
│   │   ├── dynapictures/
│   │   ├── lob/
│   │   └── posthog/
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   ├── validation.middleware.js
│   │   └── error.middleware.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validator.js
│   │   └── helpers.js
│   ├── jobs/
│   │   ├── dailyMailingCheck.job.js
│   │   ├── monthlyBilling.job.js
│   │   └── dataCleanup.job.js
│   └── config/
│       ├── database.js
│       ├── services.js
│       └── constants.js
├── tests/
├── docs/
└── scripts/
```

### 2. API Design Patterns

#### RESTful Conventions
```javascript
// Resource naming
GET    /api/campaigns          // List all campaigns
POST   /api/campaigns          // Create new campaign
GET    /api/campaigns/:id      // Get specific campaign
PUT    /api/campaigns/:id      // Update campaign
DELETE /api/campaigns/:id      // Delete campaign

// Actions on resources
POST   /api/campaigns/:id/activate
POST   /api/campaigns/:id/pause
POST   /api/campaigns/:id/duplicate

// Nested resources
GET    /api/campaigns/:id/recipients
POST   /api/campaigns/:id/recipients
```

#### Error Handling
```javascript
class APIError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
  }
}

// Centralized error handler
export function errorHandler(err, req, res, next) {
  let error = err
  
  // Supabase errors
  if (err.code === '23505') {
    error = new APIError('Duplicate entry', 409, 'DUPLICATE_ERROR')
  }
  
  // Stripe errors
  if (err.type === 'StripeCardError') {
    error = new APIError(err.message, 400, 'PAYMENT_ERROR')
  }
  
  // Log error
  logger.error({
    error: error.message,
    stack: error.stack,
    request: req.url,
    user: req.user?.id
  })
  
  // Send response
  res.status(error.statusCode || 500).json({
    error: {
      message: error.message,
      code: error.errorCode || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  })
}
```

#### Request Validation
```javascript
import { z } from 'zod'

// Define schemas
export const createCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  postcardId: z.string().uuid(),
  targetingType: z.enum(['radius', 'zip_codes']),
  targetingData: z.union([
    z.object({
      center: z.object({
        lat: z.number(),
        lng: z.number()
      }),
      radiusMiles: z.number().min(1).max(50)
    }),
    z.object({
      zipCodes: z.array(z.string().regex(/^\d{5}$/))
    })
  ]),
  postcardFormat: z.enum(['standard', 'premium', 'deluxe']),
  autoActivate: z.boolean().optional()
})

// Validation middleware
export function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      res.status(400).json({
        error: {
          message: 'Validation failed',
          details: error.errors
        }
      })
    }
  }
}

// Usage
router.post('/campaigns', 
  authenticate,
  validate(createCampaignSchema),
  campaignController.create
)
```

### 3. Database Patterns

#### Connection Pooling
```javascript
// Supabase handles connection pooling automatically
// But for direct PostgreSQL connections:

import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect()
}
```

#### Transaction Management
```javascript
export async function createCampaignWithPostcard(campaignData, postcardData) {
  const client = await db.getClient()
  
  try {
    await client.query('BEGIN')
    
    // Create postcard
    const postcardResult = await client.query(
      'INSERT INTO postcards (...) VALUES (...) RETURNING *',
      postcardValues
    )
    
    // Create campaign
    const campaignResult = await client.query(
      'INSERT INTO campaigns (...) VALUES (...) RETURNING *',
      [...campaignValues, postcardResult.rows[0].id]
    )
    
    await client.query('COMMIT')
    return campaignResult.rows[0]
    
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
```

### 4. Performance Optimization

#### Caching Strategy
```javascript
import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL)

// Cache templates
export async function getTemplates(industry) {
  const cacheKey = `templates:${industry}`
  
  // Check cache
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)
  
  // Generate templates
  const templates = await generateTemplates(industry)
  
  // Cache for 24 hours
  await redis.setex(cacheKey, 86400, JSON.stringify(templates))
  
  return templates
}

// Cache with invalidation
export async function updateCompany(companyId, data) {
  const result = await supabase
    .from('companies')
    .update(data)
    .eq('id', companyId)
  
  // Invalidate cache
  await redis.del(`company:${companyId}`)
  
  return result
}
```

#### Query Optimization
```javascript
// Efficient campaign list with aggregations
export async function getCampaignsWithStats(userId) {
  const query = `
    SELECT 
      c.*,
      COUNT(DISTINCT r.id) as recipient_count,
      COUNT(DISTINCT CASE WHEN r.converted THEN r.id END) as conversion_count,
      SUM(r.cost) as total_cost
    FROM campaigns c
    LEFT JOIN recipients r ON r.campaign_id = c.id
    WHERE c.user_id = $1
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `
  
  const { data } = await db.query(query, [userId])
  return data
}
```

### 5. Security Implementation

#### Authentication Middleware
```javascript
export async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      throw new APIError('No token provided', 401, 'AUTH_REQUIRED')
    }
    
    // Verify with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error) {
      throw new APIError('Invalid token', 401, 'INVALID_TOKEN')
    }
    
    // Attach user to request
    req.user = user
    req.supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    })
    
    next()
  } catch (error) {
    next(error)
  }
}
```

#### Rate Limiting
```javascript
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'

export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate_limit:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests, please try again later'
})

export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'auth_limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skipSuccessfulRequests: true
})
```

### 6. Monitoring & Logging

#### Structured Logging
```javascript
import winston from 'winston'

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    })
  ]
})

// Usage
logger.info('Campaign created', {
  campaignId: campaign.id,
  userId: user.id,
  targetingType: campaign.targeting_type
})
```

#### Health Checks
```javascript
export async function healthCheck(req, res) {
  const checks = {
    database: false,
    stripe: false,
    storage: false,
    services: {}
  }
  
  // Check database
  try {
    await supabase.from('health_check').select('*').limit(1)
    checks.database = true
  } catch (error) {
    logger.error('Database health check failed', error)
  }
  
  // Check Stripe
  try {
    await stripe.customers.list({ limit: 1 })
    checks.stripe = true
  } catch (error) {
    logger.error('Stripe health check failed', error)
  }
  
  const allHealthy = Object.values(checks).every(v => v === true)
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks
  })
}
```

## Missing Endpoints and Corrections

### Additional Endpoints Needed

1. **Email Verification Flow**
```javascript
POST /api/auth/verify-email
POST /api/auth/resend-verification
GET  /api/auth/verify-email/:token
```

2. **Session Management**
```javascript
GET  /api/auth/session
POST /api/auth/refresh
POST /api/auth/logout
```

3. **Settings Page Endpoints**
```javascript
GET  /api/settings/preferences
PUT  /api/settings/preferences
GET  /api/settings/referral-info
POST /api/settings/generate-referral-code
```

4. **Map Integration**
```javascript
POST /api/geocoding/address-lookup
POST /api/geocoding/reverse-geocode
GET  /api/geocoding/zip-demographics/:zip
```

5. **Real-time Updates**
```javascript
// WebSocket endpoints for live updates
ws://api/campaigns/:id/status
ws://api/analytics/live
```

### Schema Corrections

1. **Add to Users table**
```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN referred_by UUID REFERENCES users(id);
```

2. **Add Preferences table**
```sql
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    email_notifications JSONB DEFAULT '{"campaigns": true, "billing": true, "updates": false}',
    timezone TEXT DEFAULT 'America/New_York',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. **Add Analytics tables**
```sql
CREATE TABLE campaign_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id),
    date DATE NOT NULL,
    postcards_sent INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    UNIQUE(campaign_id, date)
);
```

## Implementation Timeline

### Week 1: Foundation (Days 1-7)
- **Day 1-2**: Supabase setup, database schema, authentication
- **Day 3**: Google OAuth, email verification
- **Day 4**: Brandfetch integration, company setup
- **Day 5**: DynaPictures template creation
- **Day 6-7**: Onboarding flow endpoints

### Week 2: Core Features (Days 8-14)
- **Day 8-9**: Campaign management endpoints
- **Day 10**: Stripe payment integration
- **Day 11**: Lob integration setup
- **Day 12**: Targeting calculations, pricing
- **Day 13-14**: Dashboard and analytics

### Week 3: Polish & Testing (Days 15-21)
- **Day 15-16**: Settings, preferences, block list
- **Day 17**: Background jobs setup
- **Day 18**: PostHog analytics integration
- **Day 19-20**: Testing, error handling
- **Day 21**: Documentation, deployment

## Conclusion

This comprehensive review ensures:
1. All frontend screens have corresponding backend endpoints
2. Service integrations use actual API documentation
3. Professional architecture patterns for scalability
4. Complete error handling and security
5. Performance optimizations built-in

The backend is designed to be:
- **Efficient**: Using caching, connection pooling, and optimized queries
- **Reliable**: With proper error handling and transaction management
- **Clean**: Following RESTful conventions and separation of concerns
- **Scalable**: Using serverless functions and managed services

All corrections and additions have been identified to ensure the backend fully supports the frontend implementation for MovePost Phase 1.