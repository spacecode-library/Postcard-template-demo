# Detailed Endpoint Documentation for MovePost Backend

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [User Profile Endpoints](#user-profile-endpoints)
3. [Company/Onboarding Endpoints](#companyonboarding-endpoints)
4. [Postcard Design Endpoints](#postcard-design-endpoints)
5. [Campaign Management Endpoints](#campaign-management-endpoints)
6. [Mailing & History Endpoints](#mailing--history-endpoints)
7. [Billing & Payment Endpoints](#billing--payment-endpoints)
8. [Settings & Preferences Endpoints](#settings--preferences-endpoints)
9. [Analytics Endpoints](#analytics-endpoints)
10. [Blast Campaign Endpoints (Phase 2)](#blast-campaign-endpoints-phase-2)
11. [Utility Endpoints](#utility-endpoints)

## Authentication Endpoints

### POST /api/auth/register
**Purpose**: Create a new user account with email and password

**What it does**:
1. Validates email format and checks if it's already in use
2. Validates password strength (min 8 chars, includes number and special char)
3. Creates user in Supabase Auth system
4. Creates corresponding record in users table with profile info
5. Sends verification email to user's email address
6. Returns session token for immediate login

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": false,
    "createdAt": "2025-01-01T00:00:00Z"
  },
  "session": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresAt": "2025-01-02T00:00:00Z"
  },
  "message": "Account created. Please verify your email."
}
```

**Error Cases**:
- 409: Email already exists
- 400: Invalid email format or weak password
- 500: Database error

### POST /api/auth/google
**Purpose**: Authenticate user via Google OAuth

**What it does**:
1. Receives Google ID token from frontend
2. Verifies token with Google servers
3. Extracts user info (email, name, profile picture)
4. Checks if user exists:
   - If exists: Updates last login time
   - If new: Creates user account with Google data
5. Generates session tokens
6. Sets email as verified (Google accounts are pre-verified)

**Request**:
```json
{
  "idToken": "google-id-token-from-oauth"
}
```

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": true,
    "authProvider": "google"
  },
  "session": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  },
  "isNewUser": true,  // Important for onboarding flow
  "message": "Successfully authenticated with Google"
}
```

### POST /api/auth/login
**Purpose**: Login with email and password

**What it does**:
1. Validates credentials against Supabase Auth
2. Checks if email is verified (optional enforcement)
3. Updates last login timestamp
4. Returns session tokens
5. Logs login event to PostHog analytics

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "companyId": "company-uuid",
    "onboardingCompleted": true
  },
  "session": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### POST /api/auth/verify-email
**Purpose**: Verify user's email address

**What it does**:
1. Receives verification token from email link
2. Validates token hasn't expired (24hr expiry)
3. Marks user's email as verified
4. Updates emailVerifiedAt timestamp
5. Triggers welcome email
6. Logs verification event

**Request**:
```json
{
  "token": "verification-token-from-email"
}
```

**Response**:
```json
{
  "message": "Email verified successfully",
  "user": {
    "emailVerified": true,
    "emailVerifiedAt": "2025-01-01T00:00:00Z"
  }
}
```

### POST /api/auth/resend-verification
**Purpose**: Resend verification email

**What it does**:
1. Checks if email already verified
2. Validates rate limit (max 3 per hour)
3. Generates new verification token
4. Sends verification email
5. Records attempt in database

**Request**:
```json
{
  "email": "user@example.com"
}
```

### GET /api/auth/session
**Purpose**: Validate current session and get user data

**What it does**:
1. Validates JWT token from Authorization header
2. Checks if token is expired
3. Retrieves full user profile with company data
4. Returns user state for frontend

**Response**:
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "company": {
      "id": "company-uuid",
      "name": "John's Pizza",
      "logo": "https://..."
    },
    "onboardingStep": 6,  // Indicates completed
    "hasPaymentMethod": true
  }
}
```

### POST /api/auth/logout
**Purpose**: End user session

**What it does**:
1. Invalidates current access token
2. Removes refresh token
3. Logs logout event
4. Clears any server-side session data

## User Profile Endpoints

### GET /api/user/profile
**Purpose**: Get current user's profile information

**What it does**:
1. Retrieves user data from database
2. Includes related company information
3. Calculates profile completion percentage
4. Returns preferences and settings

**Response**:
```json
{
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "profilePicture": "https://...",
    "createdAt": "2025-01-01T00:00:00Z",
    "profileCompletion": 85,
    "preferences": {
      "emailNotifications": true,
      "timezone": "America/New_York"
    }
  }
}
```

### PUT /api/user/profile
**Purpose**: Update user profile information

**What it does**:
1. Validates input fields
2. Updates user record in database
3. If email changed, triggers re-verification
4. Logs profile update event
5. Returns updated profile

**Request**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### PUT /api/user/change-password
**Purpose**: Change user's password

**What it does**:
1. Validates current password
2. Checks new password strength
3. Updates password in Supabase Auth
4. Invalidates all other sessions
5. Sends security email notification

**Request**:
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
```

## Company/Onboarding Endpoints

### POST /api/company/analyze
**Purpose**: Extract brand information from website URL (Step 1)

**What it does**:
1. Validates URL format and accessibility
2. Calls Brandfetch API with domain
3. If Brandfetch succeeds:
   - Extracts logo (prefers SVG, falls back to PNG)
   - Extracts brand colors (primary and secondary)
   - Gets company name and industry
   - Retrieves any available description
4. If Brandfetch fails:
   - Falls back to web scraping
   - Extracts meta tags (title, description)
   - Looks for logo in common locations
   - Analyzes CSS for dominant colors
5. Returns structured brand data

**Request**:
```json
{
  "websiteUrl": "https://www.johnspizza.com"
}
```

**Response**:
```json
{
  "companyName": "John's Pizza",
  "logo": "https://cdn.brandfetch.com/johnspizza/logo.png",
  "brandColors": {
    "primary": "#FF0000",
    "secondary": "#FFFF00",
    "palette": ["#FF0000", "#FFFF00", "#000000", "#FFFFFF"]
  },
  "industry": "Restaurant",
  "description": "Best pizza in town since 1985",
  "fonts": {
    "primary": "Helvetica",
    "secondary": "Arial"
  },
  "source": "brandfetch"  // or "webscrape"
}
```

**Error Cases**:
- 404: Website not found
- 400: Invalid URL format
- 503: Brandfetch API unavailable

### POST /api/company/setup
**Purpose**: Save company information after brand analysis

**What it does**:
1. Creates or updates company record
2. Associates company with user
3. Validates and geocodes address using Google Places
4. Stores logo in Supabase Storage if URL provided
5. Saves brand colors and industry
6. Updates user's onboarding progress

**Request**:
```json
{
  "name": "John's Pizza",
  "website": "https://johnspizza.com",
  "industry": "Restaurant",
  "logo": "https://...",
  "brandColors": {
    "primary": "#FF0000",
    "secondary": "#FFFF00"
  },
  "address": "123 Main St",
  "city": "Columbus",
  "state": "OH",
  "zipCode": "43215",
  "phone": "+1614555012"
}
```

**Response**:
```json
{
  "company": {
    "id": "company-uuid",
    "name": "John's Pizza",
    "coordinates": {
      "lat": 39.9612,
      "lng": -82.9988
    },
    "formattedAddress": "123 Main St, Columbus, OH 43215",
    "verified": true
  }
}
```

### GET /api/company/categories
**Purpose**: Get list of business categories for dropdown

**What it does**:
1. Returns predefined list of business categories
2. Includes industry-specific metadata
3. Used in onboarding Step 1 dropdown

**Response**:
```json
{
  "categories": [
    {
      "id": "restaurant",
      "name": "Restaurant & Food Service",
      "avgConversionRate": 4.5,
      "popularOffers": ["% off first order", "Free delivery"]
    },
    {
      "id": "retail",
      "name": "Retail & E-commerce",
      "avgConversionRate": 3.2,
      "popularOffers": ["Grand opening discount", "BOGO"]
    }
  ]
}
```

## Postcard Design Endpoints

### POST /api/postcards/generate-templates
**Purpose**: Generate AI-powered postcard templates (Step 2)

**What it does**:
1. Retrieves company brand data
2. Calls DynaPictures API to create base template
3. Generates 30 variations with:
   - Different headlines for new movers
   - Industry-specific offers
   - Various layouts (image-heavy, text-focused, balanced)
   - Brand colors applied
   - Logo placement variations
4. Creates thumbnails for gallery display
5. Stores template data with suggested offers
6. Returns categorized template gallery

**Request**:
```json
{
  "companyId": "company-uuid",
  "industry": "restaurant",
  "brandColors": {
    "primary": "#FF0000",
    "secondary": "#FFFF00"
  },
  "logo": "https://..."
}
```

**Response**:
```json
{
  "templates": [
    {
      "id": "template_1",
      "thumbnailUrl": "https://dynapictures.com/preview/abc123.jpg",
      "category": "welcome",
      "suggestedOffer": "Get 20% off your first order",
      "layout": "image_left",
      "elements": {
        "headline": "Welcome to the Neighborhood!",
        "hasLogo": true,
        "hasCoupon": true,
        "imageStyle": "food_hero"
      }
    },
    // ... 29 more templates
  ],
  "categories": ["welcome", "discount", "grand_opening", "seasonal"]
}
```

### POST /api/postcards/customize
**Purpose**: Save customized postcard design (Step 3)

**What it does**:
1. Validates all text fields for length and content
2. Generates final postcard design via DynaPictures:
   - Front side with all customizations
   - Back side with mailing areas and return address
3. Ensures USPS compliance:
   - Clear address area (bottom 2.75" x 5.5")
   - Indicia placement for bulk mail
   - Return address in top-left
4. Stores high-resolution images in Supabase Storage
5. Creates postcard record in database
6. Returns preview URLs

**Request**:
```json
{
  "templateId": "template_1",
  "customizations": {
    "headline": "Welcome to John's Pizza!",
    "offerText": "Get 20% off your first order",
    "callToAction": "Order online or call (614) 555-0123",
    "testimonial": "Best pizza in Columbus! - Google Reviews",
    "businessDetails": {
      "address": "123 Main St, Columbus, OH 43215",
      "phone": "(614) 555-0123",
      "website": "johnspizza.com",
      "hours": "Mon-Sun 11am-10pm"
    },
    "couponCode": "WELCOME20",
    "expirationDate": "Valid through March 31, 2025"
  }
}
```

**Response**:
```json
{
  "postcard": {
    "id": "postcard-uuid",
    "name": "Welcome Campaign Postcard",
    "status": "draft",
    "frontImageUrl": "https://supabase.co/storage/postcards/front-123.jpg",
    "backImageUrl": "https://supabase.co/storage/postcards/back-123.jpg",
    "dimensions": {
      "width": "6.25 inches",
      "height": "4.25 inches",
      "bleed": "0.125 inches"
    },
    "uspsCompliant": true
  }
}
```

### POST /api/postcards/preview
**Purpose**: Generate real-time preview during editing

**What it does**:
1. Accepts partial customization data
2. Generates low-resolution preview quickly
3. Caches preview for 5 minutes
4. Used for live preview in editor

**Request**:
```json
{
  "templateId": "template_1",
  "changes": {
    "headline": "New headline text"
  }
}
```

### POST /api/storage/upload-logo
**Purpose**: Upload custom logo file

**What it does**:
1. Validates file type (PNG, JPG, SVG)
2. Validates file size (<5MB)
3. Optimizes image for web
4. Stores in Supabase Storage
5. Returns public URL

**Request**: Multipart form data with file

**Response**:
```json
{
  "logoUrl": "https://supabase.co/storage/logos/company-uuid-logo.png",
  "dimensions": {
    "width": 300,
    "height": 150
  }
}
```

## Campaign Management Endpoints

### POST /api/campaigns/calculate-targeting
**Purpose**: Calculate targeting estimates and pricing (Step 4)

**What it does**:
1. **For Radius Targeting**:
   - Geocodes center address using Google Places API
   - Calculates all ZIP codes within radius using PostGIS
   - Queries population data for each ZIP
   - Estimates new movers (typically 11-13% annually)
   
2. **For ZIP Code Targeting**:
   - Validates each ZIP code exists
   - Retrieves demographics for each ZIP
   - Checks premium ZIP list
   
3. **Pricing Calculation**:
   - Base price: $3.00 per postcard
   - Volume discounts:
     - 200-499: $2.80 each (7% off)
     - 500-999: $2.50 each (17% off)
     - 1000+: $2.20 each (27% off)
   - Premium ZIP surcharge: +$1-2 per card
   - Factors: High property values, remote delivery
   
4. **Conversion Estimates**:
   - Industry-specific rates from historical data
   - Restaurant: 4-6% conversion
   - Services: 2-4% conversion
   - Retail: 3-5% conversion

**Request**:
```json
{
  "targetingType": "radius",
  "targetingData": {
    "center": {
      "address": "123 Main St, Columbus, OH 43215"
    },
    "radiusMiles": 5
  },
  "postcardFormat": "standard",
  "filters": {
    "homeOwners": true,
    "renters": true
  }
}
```

**Response**:
```json
{
  "estimatedMonthlyVolume": 250,
  "coverageArea": {
    "zipCodes": ["43215", "43214", "43212", "43210", "43201"],
    "totalPopulation": 125000,
    "totalHouseholds": 52000,
    "annualMoverRate": 12.5
  },
  "pricing": {
    "basePrice": 3.00,
    "volumePrice": 2.80,
    "premiumZips": [
      {
        "zip": "43215",
        "surcharge": 1.00,
        "reason": "High property value area"
      }
    ],
    "averagePrice": 2.95,
    "estimatedMonthlyCost": 737.50,
    "volumeDiscount": {
      "percentage": 7,
      "savedAmount": 50.00
    }
  },
  "conversionEstimate": {
    "industry": "restaurant",
    "expectedRate": "4-6%",
    "monthlyCustomers": "10-15",
    "lifetimeValue": "$150-250 per customer"
  },
  "demographics": {
    "medianIncome": "$65,000",
    "medianAge": 34,
    "familyHouseholds": "45%"
  }
}
```

### POST /api/geocoding/address-to-coords
**Purpose**: Convert address to coordinates for map display

**What it does**:
1. Calls Google Geocoding API
2. Validates address exists
3. Returns lat/lng for map center
4. Stores validated address

**Request**:
```json
{
  "address": "123 Main St, Columbus, OH 43215"
}
```

**Response**:
```json
{
  "coordinates": {
    "lat": 39.9612,
    "lng": -82.9988
  },
  "formattedAddress": "123 Main St, Columbus, OH 43215, USA",
  "components": {
    "streetNumber": "123",
    "street": "Main St",
    "city": "Columbus",
    "state": "OH",
    "zipCode": "43215",
    "country": "US"
  }
}
```

### GET /api/geocoding/zips-in-radius
**Purpose**: Find all ZIP codes within radius

**What it does**:
1. Uses PostGIS spatial query
2. Calculates distance from center point
3. Returns ZIPs with population data
4. Used for radius targeting

**Request Query**:
```
?lat=39.9612&lng=-82.9988&radiusMiles=5
```

**Response**:
```json
{
  "zipCodes": [
    {
      "zip": "43215",
      "distance": 0,
      "population": 25000,
      "households": 11000,
      "city": "Columbus"
    },
    {
      "zip": "43214",
      "distance": 2.3,
      "population": 18000,
      "households": 8000,
      "city": "Columbus"
    }
  ],
  "total": 5
}
```

### POST /api/campaigns/create
**Purpose**: Create new campaign (Step 6)

**What it does**:
1. Validates user has payment method
2. Validates postcard design exists
3. Recalculates targeting to ensure fresh data
4. Creates campaign record with:
   - Unique campaign name
   - Status (draft or active)
   - All targeting parameters
   - Pricing information
5. If autoActivate is true:
   - Sets status to active
   - Schedules first mailing check
   - Triggers PostHog event
6. Returns campaign details

**Request**:
```json
{
  "name": "Welcome Campaign - March 2025",
  "postcardId": "postcard-uuid",
  "targetingType": "radius",
  "targetingData": {
    "center": {
      "lat": 39.9612,
      "lng": -82.9988
    },
    "radiusMiles": 5
  },
  "postcardFormat": "standard",
  "autoActivate": true
}
```

**Response**:
```json
{
  "campaign": {
    "id": "campaign-uuid",
    "name": "Welcome Campaign - March 2025",
    "status": "active",
    "createdAt": "2025-01-15T10:00:00Z",
    "estimatedMonthlyVolume": 250,
    "estimatedMonthlyCost": 737.50,
    "nextMailingCheck": "2025-01-16T09:00:00Z"
  }
}
```

### PUT /api/campaigns/{id}/toggle-status
**Purpose**: Activate or pause campaign

**What it does**:
1. Validates campaign ownership
2. For activation:
   - Checks payment method exists
   - Validates postcard is finalized
   - Schedules daily mailing job
   - Checks for immediate sends
3. For pausing:
   - Cancels scheduled jobs
   - Marks any pending sends as cancelled
4. Logs status change event
5. Sends email notification

**Request**:
```json
{
  "status": "active"  // or "paused"
}
```

**Response**:
```json
{
  "campaign": {
    "id": "campaign-uuid",
    "status": "active",
    "statusChangedAt": "2025-01-15T10:30:00Z"
  },
  "message": "Campaign activated. New movers will start receiving postcards within 24 hours."
}
```

### GET /api/campaigns/list
**Purpose**: Get user's campaigns for dashboard

**What it does**:
1. Retrieves all campaigns for user
2. Includes aggregated statistics:
   - Total postcards sent
   - Total spend
   - Conversion count
   - Last activity date
3. Supports filtering by status
4. Includes thumbnail preview
5. Orders by creation date

**Request Query**:
```
?status=active&page=1&limit=10
```

**Response**:
```json
{
  "campaigns": [
    {
      "id": "campaign-uuid",
      "name": "Welcome Campaign",
      "status": "active",
      "targetingType": "radius",
      "targetingDescription": "5 miles around Main St",
      "thumbnailUrl": "https://...",
      "stats": {
        "sent": 125,
        "conversions": 6,
        "conversionRate": 4.8,
        "totalSpent": 350.00,
        "lastSentDate": "2025-01-14T00:00:00Z"
      },
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "totalPages": 1
}
```

### POST /api/campaigns/{id}/duplicate
**Purpose**: Duplicate existing campaign

**What it does**:
1. Copies all campaign settings
2. Duplicates postcard design
3. Appends "Copy" to name
4. Sets status to draft
5. Allows quick campaign creation

**Response**:
```json
{
  "campaign": {
    "id": "new-campaign-uuid",
    "name": "Welcome Campaign - Copy",
    "status": "draft"
  }
}
```

## Mailing & History Endpoints

### POST /api/mailings/send-batch
**Purpose**: Send postcards to new movers (called by cron job)

**What it does**:
1. **Recipient Processing**:
   - Validates each address format
   - Checks against company block list
   - Checks for duplicate sends in last 90 days
   - Filters by home owner/renter preference
   
2. **Lob API Integration**:
   - Formats address to USPS standards
   - Sends postcard design URLs
   - Sets mail class (Standard/First Class)
   - Adds tracking metadata
   
3. **Record Keeping**:
   - Creates recipient record with Lob ID
   - Records exact cost
   - Updates campaign statistics
   - Updates monthly billing usage
   
4. **Error Handling**:
   - Retries failed sends up to 3 times
   - Logs all errors with context
   - Continues batch even if some fail

**Request** (Internal - from cron):
```json
{
  "campaignId": "campaign-uuid",
  "recipients": [
    {
      "name": "John Smith",
      "addressLine1": "456 Oak Ave",
      "addressLine2": "Apt 2B",
      "city": "Columbus",
      "state": "OH",
      "zipCode": "43215",
      "moveInDate": "2025-01-10",
      "dwellingType": "apartment"
    }
  ]
}
```

**Response**:
```json
{
  "sent": 8,
  "failed": 2,
  "skipped": {
    "blocked": 1,
    "duplicate": 1
  },
  "results": [
    {
      "recipientId": "recipient-uuid",
      "addressLine1": "456 Oak Ave",
      "lobId": "psc_abc123",
      "status": "sent",
      "trackingUrl": "https://lob.com/postcards/psc_abc123",
      "expectedDelivery": "2025-01-20",
      "cost": 2.80
    }
  ],
  "totalCost": 22.40
}
```

### GET /api/mailings/history
**Purpose**: Get mailing history for history page

**What it does**:
1. Retrieves all mailings with filters
2. Joins with campaign data
3. Supports search by:
   - Address
   - Campaign name
   - Date range
   - Status
4. Includes conversion tracking
5. Supports CSV export

**Request Query**:
```
?campaignId=uuid&startDate=2025-01-01&endDate=2025-01-31&status=delivered&search=Main+St&page=1&limit=50
```

**Response**:
```json
{
  "mailings": [
    {
      "id": "mailing-uuid",
      "campaign": "Welcome Campaign",
      "recipient": {
        "name": "John Smith",
        "address": "456 Oak Ave, Columbus, OH 43215"
      },
      "status": "delivered",
      "sentDate": "2025-01-15T00:00:00Z",
      "deliveredDate": "2025-01-18T00:00:00Z",
      "cost": 2.80,
      "converted": false,
      "notes": "",
      "lobTrackingUrl": "https://lob.com/postcards/psc_abc123"
    }
  ],
  "summary": {
    "totalSent": 250,
    "totalDelivered": 245,
    "totalReturned": 5,
    "totalConverted": 12,
    "conversionRate": 4.9,
    "totalCost": 700.00
  },
  "pagination": {
    "total": 250,
    "page": 1,
    "totalPages": 5,
    "hasMore": true
  }
}
```

### PUT /api/mailings/{id}/mark-converted
**Purpose**: Mark a recipient as converted customer

**What it does**:
1. Updates recipient record
2. Sets conversion date
3. Updates campaign statistics
4. Logs conversion event
5. Optionally adds to block list

**Request**:
```json
{
  "converted": true,
  "conversionDate": "2025-01-20T14:30:00Z",
  "notes": "Came in with postcard, ordered large pizza",
  "blockFutureMail": true
}
```

### POST /api/mailings/{id}/add-note
**Purpose**: Add notes to a mailing record

**What it does**:
1. Appends note with timestamp
2. Tracks who added note
3. Used for CRM functionality

**Request**:
```json
{
  "note": "Customer mentioned they loved the offer"
}
```

### GET /api/mailings/export
**Purpose**: Export mailing history as CSV

**What it does**:
1. Generates CSV with all mailing data
2. Includes custom date range
3. Adds conversion metrics
4. Returns download link

**Request Query**:
```
?startDate=2025-01-01&endDate=2025-01-31&campaignId=uuid
```

## Billing & Payment Endpoints

### POST /api/billing/create-setup-intent
**Purpose**: Initialize Stripe payment setup (Step 5)

**What it does**:
1. Creates or retrieves Stripe customer
2. Associates with company record
3. Creates SetupIntent for card collection
4. Returns client secret for Stripe Elements
5. Sets payment method for future use

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "clientSecret": "seti_1234567890_secret_abcdef",
  "customerId": "cus_1234567890",
  "publishableKey": "pk_live_..."
}
```

### POST /api/billing/confirm-payment-method
**Purpose**: Confirm payment method after card entry

**What it does**:
1. Receives payment method ID from Stripe Elements
2. Attaches to customer
3. Sets as default payment method
4. Creates billing record
5. Enables campaign activation

**Request**:
```json
{
  "paymentMethodId": "pm_1234567890",
  "setAsDefault": true
}
```

**Response**:
```json
{
  "billing": {
    "paymentMethodLast4": "4242",
    "paymentMethodBrand": "visa",
    "expiryMonth": 12,
    "expiryYear": 2027,
    "isDefault": true
  },
  "message": "Payment method added successfully"
}
```

### GET /api/billing/payment-methods
**Purpose**: List user's payment methods

**What it does**:
1. Retrieves all payment methods from Stripe
2. Indicates default method
3. Shows card details safely
4. Used in settings page

**Response**:
```json
{
  "paymentMethods": [
    {
      "id": "pm_1234567890",
      "brand": "visa",
      "last4": "4242",
      "expMonth": 12,
      "expYear": 2027,
      "isDefault": true,
      "created": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/billing/current-usage
**Purpose**: Get current month's usage and charges

**What it does**:
1. Calculates postcards sent this month
2. Groups by campaign
3. Applies volume discounts
4. Projects month-end total
5. Shows real-time spending

**Response**:
```json
{
  "currentMonth": {
    "period": "January 2025",
    "postcardsSent": 450,
    "averagePrice": 2.65,
    "totalCost": 1192.50,
    "campaigns": [
      {
        "name": "Welcome Campaign",
        "sent": 250,
        "cost": 625.00
      },
      {
        "name": "Holiday Special",
        "sent": 200,
        "cost": 567.50
      }
    ]
  },
  "estimate": {
    "daysRemaining": 15,
    "projectedVolume": 900,
    "projectedCost": 2250.00,
    "nextTierAt": 500,
    "potentialSavings": 50.00
  }
}
```

### GET /api/billing/invoices
**Purpose**: Get billing history

**What it does**:
1. Retrieves invoices from Stripe
2. Includes download links
3. Shows payment status
4. Used in billing page

**Response**:
```json
{
  "invoices": [
    {
      "id": "inv_1234567890",
      "period": "December 2025",
      "amount": 1500.00,
      "status": "paid",
      "paidAt": "2025-01-01T00:00:00Z",
      "downloadUrl": "https://invoice.stripe.com/...",
      "items": [
        {
          "description": "750 postcards sent",
          "amount": 1500.00
        }
      ]
    }
  ]
}
```

### POST /api/billing/update-payment-method
**Purpose**: Update default payment method

**What it does**:
1. Validates payment method exists
2. Sets as default in Stripe
3. Updates billing record
4. Sends confirmation email

## Settings & Preferences Endpoints

### GET /api/settings/preferences
**Purpose**: Get user preferences

**What it does**:
1. Retrieves notification settings
2. Returns timezone preference
3. Gets email preferences
4. Used in settings page

**Response**:
```json
{
  "preferences": {
    "emailNotifications": {
      "campaigns": true,
      "billing": true,
      "weeklyReport": false,
      "productUpdates": true
    },
    "timezone": "America/New_York",
    "language": "en",
    "dateFormat": "MM/DD/YYYY"
  }
}
```

### PUT /api/settings/preferences
**Purpose**: Update user preferences

**What it does**:
1. Updates preference record
2. Applies changes immediately
3. Updates email subscription status
4. Logs preference changes

### GET /api/settings/referral-info
**Purpose**: Get referral program information

**What it does**:
1. Retrieves user's referral code
2. Calculates referral earnings
3. Shows referred users count
4. Returns sharing links

**Response**:
```json
{
  "referral": {
    "code": "JOHN123",
    "shareUrl": "https://movepost.com?ref=JOHN123",
    "referred": 3,
    "earnings": 45.00,
    "pendingEarnings": 15.00,
    "tier": "bronze",
    "nextTier": {
      "name": "silver",
      "requirement": "5 referrals",
      "benefit": "12% commission"
    }
  }
}
```

### POST /api/settings/block-list
**Purpose**: Add addresses to block list

**What it does**:
1. Validates address format
2. Normalizes address
3. Checks for duplicates
4. Adds to block list
5. Prevents future mailings

**Request**:
```json
{
  "addresses": [
    {
      "addressLine1": "789 Elm St",
      "city": "Columbus",
      "state": "OH",
      "zipCode": "43215",
      "reason": "Requested no mail"
    }
  ]
}
```

### POST /api/settings/block-list/import
**Purpose**: Bulk import block list via CSV

**What it does**:
1. Parses CSV file
2. Validates each address
3. Normalizes format
4. Batch inserts addresses
5. Returns import summary

**Request**: Multipart form with CSV file

**Response**:
```json
{
  "imported": 95,
  "skipped": 5,
  "errors": [
    {
      "row": 23,
      "reason": "Invalid ZIP code"
    }
  ]
}
```

## Analytics Endpoints

### GET /api/analytics/dashboard
**Purpose**: Get dashboard analytics data

**What it does**:
1. Calculates time-period metrics
2. Aggregates campaign performance
3. Generates chart data
4. Computes growth trends
5. Returns comprehensive stats

**Request Query**:
```
?period=30days  // Options: 24hours, 7days, 30days, 12months
```

**Response**:
```json
{
  "overview": {
    "totalCampaigns": 5,
    "activeCampaigns": 3,
    "totalPostcardsSent": 1250,
    "totalSpent": 3125.00,
    "averageConversionRate": 4.8,
    "totalCustomersAcquired": 60
  },
  "chartData": {
    "labels": ["Jan 1", "Jan 2", "Jan 3", "..."],
    "datasets": [
      {
        "label": "Postcards Sent",
        "data": [45, 52, 38, "..."]
      },
      {
        "label": "Conversions",
        "data": [2, 3, 1, "..."]
      }
    ]
  },
  "trends": {
    "postcardsSent": {
      "current": 450,
      "previous": 380,
      "change": 18.4,
      "direction": "up"
    },
    "conversionRate": {
      "current": 4.8,
      "previous": 4.2,
      "change": 14.3,
      "direction": "up"
    }
  },
  "topPerformingCampaigns": [
    {
      "name": "Welcome Campaign",
      "conversionRate": 5.2,
      "customersAcquired": 35
    }
  ]
}
```

### GET /api/analytics/campaigns/{id}
**Purpose**: Get detailed campaign analytics

**What it does**:
1. Retrieves campaign-specific metrics
2. Calculates ROI
3. Shows geographic performance
4. Tracks conversion trends
5. Provides actionable insights

**Response**:
```json
{
  "campaign": {
    "name": "Welcome Campaign",
    "performance": {
      "sent": 750,
      "delivered": 735,
      "returned": 15,
      "converted": 38,
      "conversionRate": 5.2,
      "averageTimeToConvert": "3.5 days",
      "revenue": 5700.00,
      "cost": 1875.00,
      "roi": 204,
      "profitPerCard": 5.10
    },
    "geographic": {
      "bestPerformingZips": [
        {
          "zip": "43215",
          "sent": 150,
          "conversions": 12,
          "rate": 8.0
        }
      ],
      "heatmapData": [...]
    },
    "timeline": {
      "daily": [...],
      "weekly": [...],
      "monthly": [...]
    }
  }
}
```

## Blast Campaign Endpoints (Phase 2)

### POST /api/blast/calculate-recipients
**Purpose**: Calculate one-time blast recipients

**What it does**:
1. Queries historical mover data
2. Filters by time period (1-6 months)
3. Excludes already mailed addresses
4. Applies geographic filters
5. Returns recipient count and cost

**Request**:
```json
{
  "timeframe": "3months",  // Options: 1month, 3months, 6months
  "targetingType": "radius",
  "targetingData": {
    "center": {
      "lat": 39.9612,
      "lng": -82.9988
    },
    "radiusMiles": 5
  },
  "excludeExisting": true
}
```

**Response**:
```json
{
  "recipients": {
    "total": 1500,
    "new": 1200,
    "alreadyMailed": 300,
    "willSend": 1200
  },
  "cost": {
    "perCard": 2.50,
    "total": 3000.00,
    "volumeDiscount": 17
  },
  "breakdown": {
    "byMonth": [
      {
        "month": "December 2024",
        "count": 400
      },
      {
        "month": "November 2024",
        "count": 450
      },
      {
        "month": "October 2024",
        "count": 350
      }
    ]
  }
}
```

### POST /api/blast/create
**Purpose**: Create and send one-time blast

**What it does**:
1. Creates blast campaign record
2. Generates recipient list
3. Queues for immediate sending
4. Charges payment method
5. Sends confirmation email

**Request**:
```json
{
  "name": "Holiday Blast 2025",
  "postcardId": "postcard-uuid",
  "recipients": 1200,
  "sendImmediately": true
}
```

**Response**:
```json
{
  "blast": {
    "id": "blast-uuid",
    "status": "processing",
    "recipientCount": 1200,
    "estimatedCompletion": "2025-01-16T18:00:00Z",
    "totalCost": 3000.00
  }
}
```

## Utility Endpoints

### GET /api/health
**Purpose**: Health check for monitoring

**What it does**:
1. Checks database connection
2. Validates external services
3. Returns service status
4. Used by monitoring tools

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "ok",
    "stripe": "ok",
    "lob": "ok",
    "brandfetch": "ok",
    "dynapictures": "ok",
    "storage": "ok"
  }
}
```

### POST /api/webhooks/stripe
**Purpose**: Handle Stripe webhooks

**What it does**:
1. Validates webhook signature
2. Processes events:
   - payment_method.attached
   - invoice.paid
   - invoice.payment_failed
3. Updates billing records
4. Sends notifications

### POST /api/webhooks/lob
**Purpose**: Handle Lob delivery webhooks

**What it does**:
1. Updates mailing status:
   - postcard.rendered_pdf
   - postcard.in_transit
   - postcard.delivered
   - postcard.returned
2. For returned mail:
   - Adds to block list
   - Credits account
   - Notifies user

## Background Jobs

### Daily New Mover Check (Cron)
**Schedule**: Daily at 9:00 AM EST

**What it does**:
1. Gets all active campaigns
2. For each campaign:
   - Queries new movers in target area
   - Filters by move date (last 7 days)
   - Checks block list
   - Checks for prior mailings
   - Batches postcards for sending
3. Calls send-batch endpoint
4. Records results
5. Updates analytics

### Monthly Billing Job (Cron)
**Schedule**: 1st of month at 12:00 AM EST

**What it does**:
1. Queries all companies with usage
2. For each company:
   - Calculates total postcards
   - Applies volume discounts
   - Creates Stripe invoice
   - Adds line items
   - Processes payment
3. Sends email receipts
4. Handles failed payments:
   - Retries 3 times
   - Pauses campaigns if failed
   - Sends warning emails

## Error Handling

All endpoints follow consistent error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "field": "email",
    "details": {
      "provided": "notanemail",
      "expected": "valid email format"
    }
  },
  "statusCode": 400
}
```

Common error codes:
- `AUTH_REQUIRED` (401): No valid session
- `FORBIDDEN` (403): Access denied
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Input validation failed
- `PAYMENT_REQUIRED` (402): No payment method
- `RATE_LIMITED` (429): Too many requests
- `EXTERNAL_API_ERROR` (503): Third-party service error
- `INTERNAL_ERROR` (500): Server error

## Security Measures

1. **Authentication**: JWT tokens with 24hr expiry
2. **Rate Limiting**: 100 req/min general, 5 req/15min for auth
3. **Input Validation**: Zod schemas on all endpoints
4. **SQL Injection**: Parameterized queries
5. **XSS Prevention**: Input sanitization
6. **CORS**: Whitelist allowed origins
7. **HTTPS**: Enforced on all endpoints
8. **Webhook Security**: Signature validation

This comprehensive documentation ensures every endpoint is fully explained with its exact purpose, process flow, and expected behavior.