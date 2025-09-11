# MovePost Backend Development Plan - Phase 1

## Executive Summary

This document outlines the complete backend architecture, API endpoints, and integration logic for MovePost Phase 1. The system is designed to support automated postcard campaigns targeting new movers, with integrations for brand data extraction, AI-powered template generation, direct mail fulfillment, and payment processing.

## Technology Stack

### Core Infrastructure
- **Backend Framework**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **API Layer**: Next.js API Routes + Supabase Edge Functions
- **Authentication**: Supabase Auth with Google OAuth
- **File Storage**: Supabase Storage
- **Background Jobs**: Supabase Cron Functions
- **Hosting**: Netlify (frontend) + Supabase (backend)

### Third-Party Services (Phase 1)
1. **Stripe** - Payment processing
2. **Brandfetch API** - Brand data extraction  
3. **DynaPictures** - Postcard template generation
4. **Lob** - Direct mail printing and fulfillment
5. **PostHog** - Analytics tracking
6. **Google Places API** - Address validation and geocoding

### Phase 2 Services
- **Speedeon/Focus USA** - New mover data providers
- **SendGrid** - Email notifications

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    auth_provider TEXT, -- 'google' or 'email'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Companies Table
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    website TEXT,
    industry TEXT,
    logo_url TEXT,
    brand_colors JSONB, -- {primary: '#hex', secondary: '#hex'}
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    phone TEXT,
    brandfetch_data JSONB, -- Raw response from Brandfetch
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Postcards Table
```sql
CREATE TABLE postcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_id TEXT, -- DynaPictures template ID
    design_data JSONB, -- All customization data
    front_image_url TEXT,
    back_image_url TEXT,
    status TEXT DEFAULT 'draft', -- draft, active
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Campaigns Table
```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    postcard_id UUID REFERENCES postcards(id),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'draft', -- draft, active, paused, completed
    targeting_type TEXT, -- 'radius' or 'zip_codes'
    targeting_data JSONB, -- {radius: 5, center: {lat, lng}} or {zip_codes: []}
    postcard_format TEXT, -- standard, premium, deluxe
    price_per_card DECIMAL(10,2),
    estimated_monthly_volume INTEGER,
    estimated_monthly_cost DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Recipients Table
```sql
CREATE TABLE recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    name TEXT,
    mailed_at TIMESTAMPTZ,
    lob_id TEXT, -- Lob tracking ID
    cost DECIMAL(10,2),
    converted BOOLEAN DEFAULT FALSE,
    conversion_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Billing Table
```sql
CREATE TABLE billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    payment_method_last4 TEXT,
    payment_method_brand TEXT,
    current_month_usage DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Block List Table
```sql
CREATE TABLE block_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    address_line1 TEXT NOT NULL,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
**Purpose**: Register new user with email/password
```javascript
Request Body: {
    email: string,
    password: string,
    firstName: string,
    lastName: string
}

Response: {
    user: User,
    session: Session,
    token: string
}

Logic Flow:
1. Validate email format and password strength
2. Check if email already exists
3. Create user in Supabase Auth
4. Create user record in users table
5. Return user data and session token
```

#### POST /api/auth/google
**Purpose**: Authenticate via Google OAuth
```javascript
Request Body: {
    idToken: string
}

Response: {
    user: User,
    session: Session,
    token: string,
    isNewUser: boolean
}

Logic Flow:
1. Verify Google ID token
2. Extract user info (email, name)
3. Check if user exists
4. Create/update user record
5. Return session and flag for new users
```

### Company/Onboarding Endpoints

#### POST /api/company/analyze
**Purpose**: Extract brand data from website URL
```javascript
Request Body: {
    websiteUrl: string
}

Response: {
    companyName: string,
    logo: string,
    brandColors: {primary: string, secondary: string},
    industry: string,
    description: string
}

Logic Flow:
1. Validate URL format
2. Call Brandfetch API with URL
3. Parse response for brand assets
4. If Brandfetch fails, scrape basic meta tags
5. Return extracted brand data
```

#### POST /api/company/setup
**Purpose**: Save company information
```javascript
Request Body: {
    name: string,
    website: string,
    industry: string,
    logo: string,
    brandColors: object,
    address: string,
    city: string,
    state: string,
    zipCode: string
}

Response: {
    company: Company
}

Logic Flow:
1. Validate all required fields
2. Geocode address using Google Places API
3. Create/update company record
4. Store logo in Supabase Storage if provided
5. Return company data
```

### Postcard Design Endpoints

#### POST /api/postcards/generate-templates
**Purpose**: Generate AI postcard templates
```javascript
Request Body: {
    companyId: string,
    industry: string,
    brandColors: object,
    logo: string
}

Response: {
    templates: [{
        id: string,
        thumbnailUrl: string,
        category: string,
        suggestedOffer: string
    }]
}

Logic Flow:
1. Fetch company data
2. Prepare DynaPictures API request with:
   - Industry-specific templates
   - Brand colors
   - Logo placement
3. Generate 30 template variations
4. Store thumbnails in Supabase Storage
5. Return template gallery
```

#### POST /api/postcards/customize
**Purpose**: Save customized postcard design
```javascript
Request Body: {
    templateId: string,
    customizations: {
        headline: string,
        offerText: string,
        callToAction: string,
        testimonial: string,
        businessDetails: object
    }
}

Response: {
    postcard: Postcard,
    previewUrls: {
        front: string,
        back: string
    }
}

Logic Flow:
1. Validate all text fields
2. Generate front design via DynaPictures
3. Generate back design with address area
4. Store images in Supabase Storage
5. Save postcard record
6. Return postcard data with preview URLs
```

### Campaign Management Endpoints

#### POST /api/campaigns/calculate-targeting
**Purpose**: Calculate targeting estimates and costs
```javascript
Request Body: {
    targetingType: 'radius' | 'zip_codes',
    targetingData: {
        // For radius:
        center: {address: string} | {lat: number, lng: number},
        radiusMiles: number
        // For zip codes:
        zipCodes: string[]
    },
    postcardFormat: 'standard' | 'premium' | 'deluxe'
}

Response: {
    estimatedMonthlyVolume: number,
    coverageArea: {
        zipCodes: string[],
        totalPopulation: number
    },
    pricing: {
        basePrice: number,
        premiumZips: string[],
        averagePrice: number,
        estimatedMonthlyCost: number,
        volumeDiscount: number
    },
    conversionEstimate: {
        rate: string,
        monthlyCustomers: string
    }
}

Logic Flow:
1. If radius targeting:
   - Geocode center address
   - Calculate ZIP codes within radius
2. Check each ZIP against premium list
3. Calculate volume based on historical data
4. Apply volume discount tiers:
   - 0-199: $3.00
   - 200-499: $2.80  
   - 500+: $2.50
5. Add premium charges where applicable
6. Calculate conversion estimates by industry
7. Return comprehensive targeting data
```

#### POST /api/campaigns/create
**Purpose**: Create new campaign
```javascript
Request Body: {
    name: string,
    postcardId: string,
    targetingType: string,
    targetingData: object,
    postcardFormat: string,
    autoActivate: boolean
}

Response: {
    campaign: Campaign
}

Logic Flow:
1. Validate postcard exists
2. Recalculate targeting estimates
3. Create campaign record
4. If autoActivate, set status to 'active'
5. Schedule initial mailing check
6. Return campaign data
```

#### PUT /api/campaigns/{id}/status
**Purpose**: Toggle campaign active/paused
```javascript
Request Body: {
    status: 'active' | 'paused'
}

Response: {
    campaign: Campaign,
    message: string
}

Logic Flow:
1. Validate campaign exists
2. Check if payment method on file
3. Update campaign status
4. If activating:
   - Schedule mailing job
   - Check for immediate sends
5. If pausing:
   - Cancel scheduled jobs
6. Return updated campaign
```

### Mailing Endpoints

#### POST /api/mailings/send-batch
**Purpose**: Send postcards to new movers (called by cron job)
```javascript
Request Body: {
    campaignId: string,
    recipients: [{
        name: string,
        addressLine1: string,
        addressLine2: string,
        city: string,
        state: string,
        zipCode: string
    }]
}

Response: {
    sent: number,
    failed: number,
    results: [{
        recipientId: string,
        lobId: string,
        status: string
    }]
}

Logic Flow:
1. Fetch campaign and postcard data
2. Check block list for each recipient
3. Check for duplicates in last 90 days
4. For each valid recipient:
   - Call Lob API to send postcard
   - Store Lob tracking ID
   - Create recipient record
   - Update billing usage
5. Handle failures gracefully
6. Return batch results
```

#### GET /api/mailings/history
**Purpose**: Get mailing history with filters
```javascript
Query Parameters: {
    campaignId?: string,
    startDate?: string,
    endDate?: string,
    converted?: boolean,
    page?: number,
    limit?: number
}

Response: {
    recipients: Recipient[],
    total: number,
    page: number,
    totalPages: number
}

Logic Flow:
1. Build query with filters
2. Join with campaign data
3. Apply pagination
4. Return recipient list
```

### Billing Endpoints

#### POST /api/billing/setup-payment
**Purpose**: Add payment method via Stripe
```javascript
Request Body: {
    paymentMethodId: string
}

Response: {
    billing: Billing,
    message: string
}

Logic Flow:
1. Create/retrieve Stripe customer
2. Attach payment method
3. Set as default payment method
4. Create/update billing record
5. Enable campaigns if first payment method
6. Return billing data
```

#### GET /api/billing/current-usage
**Purpose**: Get current month usage and estimate
```javascript
Response: {
    currentMonth: {
        postcardsSent: number,
        totalCost: number,
        campaigns: [{
            name: string,
            sent: number,
            cost: number
        }]
    },
    estimate: {
        remainingDays: number,
        projectedTotal: number
    }
}

Logic Flow:
1. Query recipients for current month
2. Group by campaign
3. Calculate totals
4. Project based on daily average
5. Return usage breakdown
```

### Settings Endpoints

#### POST /api/settings/block-list
**Purpose**: Add addresses to block list
```javascript
Request Body: {
    addresses: [{
        addressLine1: string,
        city: string,
        state: string,
        zipCode: string
    }]
}

Response: {
    added: number,
    duplicates: number
}

Logic Flow:
1. Validate address format
2. Check for duplicates
3. Batch insert addresses
4. Return count of added
```

## Background Jobs

### Daily New Mover Check (Cron: 0 9 * * *)
```javascript
Purpose: Check for new movers and trigger mailings

Logic Flow:
1. Get all active campaigns
2. For each campaign:
   - Query new mover data for target area
   - Filter by move-in date (last 7 days)
   - Check block list
   - Check for prior mailings
   - Batch send via mailing endpoint
3. Log results
4. Update campaign statistics
```

### Monthly Billing (Cron: 0 0 1 * *)
```javascript
Purpose: Process monthly billing

Logic Flow:
1. Get all companies with usage
2. For each company:
   - Calculate total postcards sent
   - Apply volume discounts
   - Create Stripe invoice
   - Charge payment method
   - Reset monthly usage
3. Send email receipts
4. Handle failed payments
```

## Integration Details

### Brandfetch Integration
```javascript
Endpoint: https://api.brandfetch.com/v2/brands/{domain}
Headers: {
    'Authorization': 'Bearer {API_KEY}'
}

Response mapping:
- logo: response.logos[0].formats[0].src
- colors: response.colors (filter for primary/secondary)
- name: response.name
- industry: response.classification.category
```

### DynaPictures Integration
```javascript
Endpoint: https://api.dynapictures.com/v1/templates/{templateId}/images
Headers: {
    'Authorization': 'Bearer {API_KEY}'
}

Request: {
    layers: {
        headline: customizations.headline,
        offer: customizations.offerText,
        logo: {url: company.logoUrl},
        backgroundColor: company.brandColors.primary
    }
}
```

### Lob Integration
```javascript
Endpoint: https://api.lob.com/v1/postcards
Headers: {
    'Authorization': 'Basic {API_KEY}'
}

Request: {
    to: {
        name: recipient.name,
        address_line1: recipient.addressLine1,
        address_city: recipient.city,
        address_state: recipient.state,
        address_zip: recipient.zipCode
    },
    from: {
        name: company.name,
        address_line1: company.address,
        address_city: company.city,
        address_state: company.state,
        address_zip: company.zipCode
    },
    front: postcardFrontUrl,
    back: postcardBackUrl,
    size: "4x6", // or "6x9", "6x11"
}
```

### Google Places Integration
```javascript
Purpose: Address validation and geocoding

Autocomplete endpoint for address input:
- Use Places Autocomplete for address fields
- Validate and standardize addresses
- Extract lat/lng for radius calculations

Geocoding for radius targeting:
- Convert addresses to coordinates
- Calculate distances
- Find ZIP codes within radius
```

## Security Considerations

### Authentication & Authorization
- All endpoints require authenticated user (except auth endpoints)
- Row Level Security (RLS) on all tables
- Users can only access their own company data
- API keys stored in environment variables

### Data Protection
- PII (addresses) encrypted at rest
- HTTPS enforced for all API calls
- Input validation on all endpoints
- SQL injection prevention via parameterized queries

### Rate Limiting
- 100 requests/minute per user
- 1000 postcards/day per campaign
- Webhook signature validation for Stripe

## Error Handling

### Standard Error Response
```javascript
{
    error: {
        code: string,
        message: string,
        details: object
    },
    statusCode: number
}
```

### Common Error Codes
- `AUTH_REQUIRED`: User not authenticated
- `INVALID_INPUT`: Validation failed
- `PAYMENT_REQUIRED`: No payment method
- `QUOTA_EXCEEDED`: Rate limit hit
- `EXTERNAL_API_ERROR`: Third-party service failed

## Phase 1 Implementation Priority

1. **Week 1**: Core Infrastructure
   - Supabase setup and schema
   - Authentication flow
   - Company/brand data extraction

2. **Week 2**: Design & Campaign Creation
   - Template generation
   - Postcard customization
   - Campaign setup and targeting

3. **Week 3**: Mailing & Billing
   - Lob integration
   - Payment processing
   - Basic dashboard and history

## Testing Considerations

### Test Data
- Use Lob test API key (test mode)
- Stripe test cards
- Mock new mover data for development
- Sample ZIP codes with known demographics

### Integration Tests
- Full onboarding flow
- Campaign creation and activation
- Mailing simulation
- Payment processing

## Monitoring & Analytics

### PostHog Events
- User signup
- Campaign created
- Postcard sent
- Payment processed
- Conversion marked

### Metrics to Track
- Onboarding completion rate
- Average postcards per campaign
- Conversion rates by industry
- Payment success rate

## Future Considerations (Phase 2)

### New Mover Data Integration
- Integrate Speedeon or Focus USA APIs
- Real-time mover webhooks
- Advanced filtering (homeowners vs renters)

### Advanced Features
- A/B testing postcards
- Automated follow-up sequences
- QR code tracking
- Email notifications
- Referral program implementation

This backend development plan provides a complete blueprint for implementing MovePost Phase 1, with all necessary endpoints, integrations, and logic flows to support the frontend application.