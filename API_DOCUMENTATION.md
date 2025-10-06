# Postcard Marketing Backend API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Test Results Summary](#test-results-summary)
5. [API Endpoints](#api-endpoints)
   - [Health Check](#health-check)
   - [Authentication Endpoints](#authentication-endpoints)
   - [User Endpoints](#user-endpoints)
   - [Company Endpoints](#company-endpoints)
   - [Template Endpoints](#template-endpoints)
   - [Campaign Endpoints](#campaign-endpoints)
   - [Analytics Endpoints](#analytics-endpoints)
6. [Error Responses](#error-responses)
7. [Rate Limiting](#rate-limiting)

## Overview

The Postcard Marketing Backend API provides endpoints for managing user authentication, company profiles, postcard templates, marketing campaigns, and analytics. All endpoints except health check and authentication require JWT authentication.

**Test Run Date**: August 21, 2025, 10:53:30 UTC

## Base URL

```
Development: http://localhost:3000/api
Production: TBD
```

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens expire after 7 days.

## Test Results Summary

| Endpoint Category | Total Tests | Passed | Failed | Status |
|------------------|-------------|---------|---------|---------|
| Health Check | 1 | 1 | 0 | ✅ Working |
| Authentication | 4 | 4 | 0 | ✅ Working |
| User Management | 2 | 2 | 0 | ✅ Working |
| Company Management | 2 | 2 | 0 | ✅ Working |
| Template Management | 2 | 2 | 0 | ✅ Working |
| Campaign Management | 2 | 2 | 0 | ✅ Working |
| Analytics | 1 | 1 | 0 | ✅ Working |
| **TOTAL** | **14** | **14** | **0** | **✅ 100% Pass** |

## API Endpoints

### Health Check

#### GET /health
Check if the API is running and healthy.

**Authentication**: Not required

**Test Result**: ✅ PASSED

**Request**:
```http
GET /health
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Postcard Backend API is running",
  "timestamp": "2025-08-21T10:53:30.908Z"
}
```

---

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Authentication**: Not required

**Test Result**: ✅ PASSED

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Validation Rules**:
- Email: Valid email format
- Password: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- First Name: Optional, minimum 2 characters
- Last Name: Optional, minimum 2 characters
- Phone: Optional, valid phone format

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a36e4236-c35b-471e-8dbe-9f5e3cad1bf0",
      "email": "test1755773610885@example.com",
      "firstName": "Test",
      "lastName": "User",
      "phone": "+1234567890",
      "onboardingCompleted": false
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Test Data Used**:
- Email: test1755773610885@example.com
- Password: Test123!@#
- First Name: Test
- Last Name: User
- Phone: +1234567890

---

#### POST /api/auth/login
Login with email and password.

**Authentication**: Not required

**Test Result**: ✅ PASSED

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a36e4236-c35b-471e-8dbe-9f5e3cad1bf0",
      "email": "test1755773610885@example.com",
      "firstName": "Test",
      "lastName": "User",
      "phone": "+1234567890",
      "onboardingCompleted": false,
      "company": null,
      "subscription": null
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Invalid Login Test**: ✅ PASSED - Correctly rejected with 400 status

---

#### POST /api/auth/google
Login/Register with Google OAuth.

**Authentication**: Not required

**Test Result**: Not tested (requires Google ID token)

**Request Body**:
```json
{
  "idToken": "google-id-token-from-frontend"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "firstName": "John",
      "lastName": "Doe",
      "onboardingCompleted": false,
      "company": null,
      "subscription": null
    },
    "token": "jwt-token",
    "isNewUser": true
  }
}
```

---

#### GET /api/auth/verify
Verify JWT token and get user information.

**Authentication**: Required

**Test Result**: ✅ PASSED

**Request**:
```http
GET /api/auth/verify
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a36e4236-c35b-471e-8dbe-9f5e3cad1bf0",
      "email": "test1755773610885@example.com",
      "firstName": "Test",
      "lastName": "User",
      "phone": "+1234567890",
      "onboardingCompleted": false,
      "company": null,
      "subscription": null
    }
  }
}
```

---

### User Endpoints

#### GET /api/user/profile
Get current user's profile information.

**Authentication**: Required

**Test Result**: ✅ PASSED

**Request**:
```http
GET /api/user/profile
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a36e4236-c35b-471e-8dbe-9f5e3cad1bf0",
      "email": "test1755773610885@example.com",
      "firstName": "Test",
      "lastName": "User",
      "phone": "+1234567890",
      "onboardingCompleted": false
    },
    "company": null,
    "subscription": null
  }
}
```

---

#### PUT /api/user/profile
Update user profile information.

**Authentication**: Required

**Test Result**: ✅ PASSED

**Request Body**:
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "phone": "+9876543210"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a36e4236-c35b-471e-8dbe-9f5e3cad1bf0",
      "email": "test1755773610885@example.com",
      "firstName": "Updated",
      "lastName": "Name",
      "phone": "+9876543210",
      "onboardingCompleted": false
    },
    "company": null,
    "subscription": null
  }
}
```

---

#### POST /api/user/change-password
Change user password (for non-OAuth users).

**Authentication**: Required

**Test Result**: Not tested

**Request Body**:
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Company Endpoints

#### POST /api/company/setup
Complete company setup (onboarding).

**Authentication**: Required

**Test Result**: ✅ PASSED

**Request Body**:
```json
{
  "name": "Test Company Inc",
  "website": "https://testcompany.com",
  "industry": "Technology",
  "address": {
    "line1": "123 Test Street",
    "line2": "Suite 100",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105"
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "company": {
      "id": "0cac7ccf-0005-4713-afe6-3f42dc2331b9",
      "userId": "a36e4236-c35b-471e-8dbe-9f5e3cad1bf0",
      "name": "Test Company Inc",
      "website": "https://testcompany.com",
      "industry": "Technology",
      "addressLine1": "123 Test Street",
      "addressLine2": "Suite 100",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94105",
      "country": "US",
      "logoUrl": null,
      "brandColors": null,
      "createdAt": "2025-08-21T10:53:34.554Z",
      "updatedAt": "2025-08-21T10:53:34.554Z"
    },
    "enrichedData": {
      "companyName": "Test Company Inc",
      "industry": "Technology",
      "employees": "Unknown",
      "revenue": "Unknown",
      "logo": null,
      "brandColors": null
    }
  }
}
```

**Note**: This endpoint also marks the user's onboarding as completed.

---

#### PUT /api/company/update
Update company information.

**Authentication**: Required

**Test Result**: Not tested

**Request Body** (all fields optional):
```json
{
  "name": "Updated Company Name",
  "website": "https://newwebsite.com",
  "industry": "Software",
  "address": {
    "line1": "456 New Street",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001"
  }
}
```

---

#### POST /api/company/enrich
Fetch and enrich company data based on website.

**Authentication**: Required

**Test Result**: ✅ PASSED

**Request Body**:
```json
{
  "website": "https://example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "companyName": "Example Corp",
    "industry": "Software",
    "employees": "50-100",
    "revenue": "$5M-$10M",
    "logo": "https://logo.clearbit.com/example.com",
    "brandColors": ["#FF0000", "#0000FF"],
    "description": "Leading software company providing innovative solutions",
    "socialMedia": {
      "linkedin": "https://linkedin.com/company/example",
      "twitter": "https://twitter.com/example"
    }
  }
}
```

**Note**: Currently returns mock data. Will integrate with real company data API.

---

### Template Endpoints

#### GET /api/templates
Get all templates (user's custom + default templates).

**Authentication**: Required

**Test Result**: ✅ PASSED

**Query Parameters**:
- `category` (optional): Filter by category ('new_mover', 'radius', 'custom')
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Request**:
```http
GET /api/templates?category=new_mover&page=1&limit=20
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "templates": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "pages": 0
    }
  }
}
```

**Test Result**: Returned 0 templates (none created yet)

---

#### GET /api/templates/:id
Get a specific template by ID.

**Authentication**: Required

**Test Result**: Not tested

**Request**:
```http
GET /api/templates/template-uuid
Authorization: Bearer <jwt-token>
```

---

#### POST /api/templates/generate
Generate a new template using AI.

**Authentication**: Required

**Test Result**: ✅ PASSED

**Request Body**:
```json
{
  "prompt": "Create a modern welcome postcard for new movers with a friendly message",
  "category": "new_mover",
  "brandColors": ["#FF0000", "#0000FF"],
  "includeCompanyLogo": true
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "f47b83f0-c9a9-4543-be3a-f41ea89884b8",
      "userId": "a36e4236-c35b-471e-8dbe-9f5e3cad1bf0",
      "name": "AI Generated - Create a modern welcome postca...",
      "category": "new_mover",
      "designData": {
        "front": {
          "background": "#FF0000",
          "elements": [
            {
              "type": "text",
              "content": "Welcome to the Neighborhood!",
              "position": { "x": 50, "y": 30 },
              "style": {
                "fontSize": 24,
                "fontWeight": "bold",
                "color": "#FFFFFF"
              }
            },
            {
              "type": "image",
              "url": "https://logo.clearbit.com/example.com",
              "position": { "x": 10, "y": 10 },
              "size": 50
            }
          ]
        },
        "back": {
          "background": "#FFFFFF",
          "elements": [
            {
              "type": "text",
              "content": "Visit us today!",
              "position": { "x": 50, "y": 40 },
              "style": {
                "fontSize": 20,
                "fontWeight": "bold",
                "color": "#FF0000"
              }
            },
            {
              "type": "qrCode",
              "position": { "x": 50, "y": 70 },
              "size": 100
            }
          ]
        }
      },
      "frontImageUrl": "https://via.placeholder.com/600x400/FF0000/FFFFFF?text=Front",
      "backImageUrl": "https://via.placeholder.com/600x400/FFFFFF/000000?text=Back",
      "isDefault": false,
      "isActive": true,
      "createdAt": "2025-08-21T10:53:34.570Z",
      "updatedAt": "2025-08-21T10:53:34.570Z"
    }
  }
}
```

**Note**: Currently generates mock templates. Will integrate with AI template generation API.

---

#### PUT /api/templates/:id
Update an existing template.

**Authentication**: Required

**Test Result**: Not tested

**Request Body**:
```json
{
  "name": "Updated Template Name",
  "designData": {
    "front": { ... },
    "back": { ... }
  }
}
```

---

#### DELETE /api/templates/:id
Delete a template (soft delete).

**Authentication**: Required

**Test Result**: Not tested

**Request**:
```http
DELETE /api/templates/template-uuid
Authorization: Bearer <jwt-token>
```

---

### Campaign Endpoints

#### GET /api/campaigns
Get all campaigns for the authenticated user.

**Authentication**: Required

**Test Result**: ✅ PASSED

**Query Parameters**:
- `status` (optional): Filter by status ('draft', 'scheduled', 'processing', 'sent', 'completed', 'failed')
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Request**:
```http
GET /api/campaigns?status=active&page=1&limit=20
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "ed422775-e2c4-4611-b214-929a67d9a9aa",
        "userId": "a36e4236-c35b-471e-8dbe-9f5e3cad1bf0",
        "templateId": "f47b83f0-c9a9-4543-be3a-f41ea89884b8",
        "name": "Test Campaign",
        "type": "new_mover",
        "status": "scheduled",
        "targetCriteria": "{\"radius\":5,\"zipCodes\":[\"94105\",\"94107\"],\"homeValue\":{\"min\":500000,\"max\":2000000}}",
        "scheduledDate": "2025-08-22T10:53:34.573Z",
        "sentDate": null,
        "totalRecipients": 145,
        "postcardsSent": 0,
        "totalCost": "108.75",
        "createdAt": "2025-08-21T10:53:34.580Z",
        "updatedAt": "2025-08-21T10:53:34.580Z",
        "template": {
          "id": "f47b83f0-c9a9-4543-be3a-f41ea89884b8",
          "name": "AI Generated - Create a modern welcome postca...",
          "frontImageUrl": "https://via.placeholder.com/600x400/FF0000/FFFFFF?text=Front"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

#### GET /api/campaigns/:id
Get a specific campaign by ID.

**Authentication**: Required

**Test Result**: Not tested

**Request**:
```http
GET /api/campaigns/campaign-uuid
Authorization: Bearer <jwt-token>
```

---

#### POST /api/campaigns
Create a new campaign.

**Authentication**: Required

**Test Result**: ✅ PASSED

**Request Body**:
```json
{
  "name": "Test Campaign",
  "type": "new_mover",
  "templateId": "f47b83f0-c9a9-4543-be3a-f41ea89884b8",
  "targetCriteria": "{\"radius\":5,\"zipCodes\":[\"94105\",\"94107\"],\"homeValue\":{\"min\":500000,\"max\":2000000}}",
  "scheduledDate": "2025-08-22T10:53:34.573Z"
}
```

**Note**: `targetCriteria` must be a JSON string, not an object.

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "ed422775-e2c4-4611-b214-929a67d9a9aa",
      "name": "Test Campaign",
      "status": "scheduled",
      "estimatedRecipients": 145,
      "estimatedCost": 108.75,
      "template": {
        "id": "f47b83f0-c9a9-4543-be3a-f41ea89884b8",
        "name": "AI Generated - Create a modern welcome postca...",
        "frontImageUrl": "https://via.placeholder.com/600x400/FF0000/FFFFFF?text=Front"
      }
    }
  }
}
```

---

#### PUT /api/campaigns/:id
Update a campaign (only if not sent).

**Authentication**: Required

**Test Result**: Not tested

**Request Body**:
```json
{
  "name": "Updated Campaign Name",
  "targetCriteria": "{\"radius\":10}",
  "scheduledDate": "2025-08-25T10:00:00Z"
}
```

---

#### POST /api/campaigns/:id/preview
Preview campaign recipients before sending.

**Authentication**: Required

**Test Result**: Not tested

**Request**:
```http
POST /api/campaigns/campaign-uuid/preview
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "previewRecipients": [
      {
        "firstName": "John",
        "lastName": "D***",
        "city": "San Francisco",
        "state": "CA"
      }
    ],
    "totalCount": 250,
    "estimatedCost": 187.50
  }
}
```

---

#### POST /api/campaigns/:id/send
Send a campaign immediately or confirm scheduled sending.

**Authentication**: Required

**Test Result**: Not tested

**Request**:
```http
POST /api/campaigns/campaign-uuid/send
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "campaign-uuid",
      "status": "processing",
      "message": "Campaign is being processed. You'll receive an email when complete."
    }
  }
}
```

---

#### DELETE /api/campaigns/:id
Delete a campaign (only if not sent).

**Authentication**: Required

**Test Result**: Not tested

**Request**:
```http
DELETE /api/campaigns/campaign-uuid
Authorization: Bearer <jwt-token>
```

---

### Analytics Endpoints

#### GET /api/analytics/dashboard
Get dashboard analytics overview.

**Authentication**: Required

**Test Result**: ✅ PASSED

**Query Parameters**:
- `period` (optional): Time period ('7d', '30d', '90d', '1y') (default: '30d')

**Request**:
```http
GET /api/analytics/dashboard?period=30d
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCampaigns": 1,
      "totalPostcardsSent": 0,
      "deliveryRate": 0,
      "totalSpent": 108.75
    },
    "campaigns": [
      {
        "id": "ed422775-e2c4-4611-b214-929a67d9a9aa",
        "name": "Test Campaign",
        "sent": 0,
        "delivered": 0,
        "responseRate": 0.13732514474400886
      }
    ],
    "recentActivity": [
      {
        "type": "campaign_sent",
        "campaignId": "ed422775-e2c4-4611-b214-929a67d9a9aa",
        "campaignName": "Test Campaign",
        "timestamp": "2025-08-21T10:53:34.580Z",
        "details": "0 postcards sent"
      }
    ]
  }
}
```

---

#### GET /api/analytics/campaigns/:id
Get detailed analytics for a specific campaign.

**Authentication**: Required

**Test Result**: Not tested

**Request**:
```http
GET /api/analytics/campaigns/campaign-uuid
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "campaign-uuid",
      "name": "Campaign Name",
      "metrics": {
        "sent": 500,
        "delivered": 470,
        "returned": 30,
        "qrScans": 60,
        "websiteVisits": 45,
        "conversionRate": 0.09
      },
      "timeline": [
        {
          "date": "2025-08-01",
          "sent": 17,
          "delivered": 16,
          "scans": 2
        }
      ],
      "geography": [
        {
          "state": "CA",
          "city": "San Francisco",
          "count": 188
        }
      ]
    }
  }
}
```

---

#### POST /api/analytics/track
Webhook endpoint for tracking postcard events.

**Authentication**: Not required (webhook endpoint)

**Test Result**: Not tested

**Request Body**:
```json
{
  "campaignId": "campaign-uuid",
  "recipientId": "recipient-uuid",
  "eventType": "delivered",
  "eventData": {
    "timestamp": "2025-08-21T10:00:00Z",
    "location": "San Francisco, CA"
  }
}
```

**Valid Event Types**:
- `sent`
- `delivered`
- `returned`
- `qr_scan`
- `website_visit`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "event-uuid",
      "campaignId": "campaign-uuid",
      "recipientId": "recipient-uuid",
      "eventType": "delivered",
      "eventData": { ... },
      "createdAt": "2025-08-21T10:00:00Z"
    }
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "type": "field",
      "value": "invalid-value",
      "msg": "Validation error message",
      "path": "fieldName",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Please complete onboarding first"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "stack": "..." // Only in development mode
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **General API endpoints**: 100 requests per 15 minutes per IP
- **Upload endpoints**: 10 requests per 15 minutes per IP

When rate limit is exceeded:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later"
}
```

## Notes

1. **Mock Data**: Several endpoints return mock data for features pending integration:
   - Company enrichment data
   - Template generation
   - Campaign recipient estimation
   - Analytics metrics

2. **Pending Features**:
   - Stripe payment integration
   - Real company data API integration
   - AI template generation integration
   - Postcard printing/mailing API integration
   - Redis queue system for background jobs

3. **Security Features**:
   - JWT authentication with 7-day expiration
   - Password hashing with bcrypt
   - Input validation on all endpoints
   - SQL injection protection via Prisma ORM
   - XSS protection via Helmet middleware
   - CORS configuration for frontend integration

4. **Email Notifications**:
   - Welcome email sent on registration
   - Campaign status notifications
   - Subscription notifications (ready to implement)
   - Password reset emails (ready to implement)

---

## PSD Template Requirements for Frontend

### Overview

The frontend application uses PSD (Photoshop Document) files as postcard templates, loaded and edited using the IMG.LY Creative Engine SDK. For optimal editing capabilities, template designers must follow specific requirements.

### ⚠️ CRITICAL: Vector Shapes Required

**Background layers MUST be vector shapes, NOT rasterized images.**

The IMG.LY engine distinguishes between:

| Block Type | Description | Colorable | Use Case |
|-----------|-------------|-----------|----------|
| `//ly.img.ubq/graphic` with `fill/solid` | Vector shape with solid color fill | ✅ Yes | Backgrounds, decorative shapes |
| `//ly.img.ubq/graphic` with `fill/image` | Graphic with image fill | ❌ No | Not recommended for backgrounds |
| `//ly.img.ubq/image` | Rasterized image block | ❌ No | Photos, logos (replaceable, not colorable) |
| `//ly.img.ubq/text` | Text layer | ✅ Yes | All text content |

### File Specifications

```json
{
  "format": ".psd",
  "colorMode": "RGB Color",
  "resolution": "300 DPI",
  "dimensions": {
    "width": "1500px",
    "height": "2100px",
    "ratio": "5:7 inches"
  },
  "maxFileSize": "50MB (recommended)",
  "compression": "Maximum compatibility"
}
```

### Layer Requirements

#### 1. Background Layers (CRITICAL)

```
✅ CORRECT:
- Created using Photoshop Shape Tool (Rectangle, Ellipse, etc.)
- Has solid color fill
- Shows vector icon in Layers panel
- Can have color changed in Properties panel

❌ WRONG:
- Rasterized layer (pixels)
- Image fill
- Smart Object → Rasterize Layer
- Flattened/merged layer
```

#### 2. Layer Naming Conventions

| Purpose | Naming Pattern | Examples |
|---------|---------------|----------|
| Background shapes | `background`, `Background`, `*background*` | "Background", "background-shape", "bg-layer" |
| Text elements | Descriptive name | "Company Name", "Offer Text", "Address Block" |
| Logo placeholder | `logo`, `Logo`, `*logo*` | "Logo", "company-logo", "brand-logo" |
| Brand overlay | Auto-created by system | "Brand Overlay" |

#### 3. Layer Organization

**Required Structure:**
```
Root
├── Front Side (Group)
│   ├── Background (Vector Shape - Solid Fill) ✅
│   ├── Decorative Elements (Vector Shapes)
│   ├── Logo (Smart Object - NOT Rasterized)
│   ├── Company Name (Text Layer)
│   ├── Offer Heading (Text Layer)
│   └── Offer Body (Text Layer)
└── Back Side (Group) [Optional for 2-sided]
    ├── Background (Vector Shape - Solid Fill) ✅
    ├── Address Label (Text Layer)
    ├── Address Lines (Text Layers)
    └── Contact Info (Text Layer)
```

### Brand Color Integration

#### Brand Color API Format

**Company Endpoint Response:**
```json
{
  "primary_color": "#20B2AA",
  "secondary_color": "#15B79E",
  "color_palette": [
    { "hex": "#20B2AA", "name": "Primary Teal" },
    { "hex": "#15B79E", "name": "Secondary Teal" },
    { "hex": "#1A9D96", "name": "Dark Teal" }
  ]
}
```

Or simplified:
```json
{
  "primary_color": "#20B2AA",
  "secondary_color": "#15B79E",
  "color_palette": ["#20B2AA", "#15B79E", "#1A9D96"]
}
```

#### Color Format Validation

```javascript
// Server-side validation
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

// Valid examples:
"#20B2AA" ✅
"#FFFFFF" ✅
"#000000" ✅

// Invalid examples:
"20B2AA"  ❌ (missing #)
"#20B"    ❌ (too short)
"rgb(...)" ❌ (wrong format)
```

#### Frontend Color Application Logic

```javascript
// Detection functions
function isVectorBlock(engine, blockId) {
  const blockType = engine.block.getType(blockId);
  if (blockType === '//ly.img.ubq/graphic') {
    return engine.block.supportsFill(blockId) &&
           !isRasterizedBlock(engine, blockId);
  }
  return false;
}

function isRasterizedBlock(engine, blockId) {
  const blockType = engine.block.getType(blockId);

  // Image blocks are always rasterized
  if (blockType === '//ly.img.ubq/image') {
    return true;
  }

  // Graphics with image fills are rasterized
  if (blockType === '//ly.img.ubq/graphic') {
    const hasFill = engine.block.hasFill(blockId);
    if (hasFill) {
      const fill = engine.block.getFill(blockId);
      const fillType = engine.block.getType(fill);
      return fillType === '//ly.img.ubq/fill/image';
    }
  }

  return false;
}

// Application logic
function applyBrandColor(engine, hexColor) {
  // Convert hex to RGB
  const rgb = hexToRGB(hexColor);

  // Find applicable blocks
  const backgrounds = engine.block.findAll().filter(block => {
    const blockName = engine.block.getName(block);
    const isBackground = blockName.includes('background');
    return isBackground && isVectorBlock(engine, block);
  });

  if (backgrounds.length > 0) {
    backgrounds.forEach(bg => {
      engine.block.setFillSolidColor(bg, rgb);
    });
    return { success: true, count: backgrounds.length };
  }

  return {
    success: false,
    reason: 'no_vector_backgrounds',
    message: 'Background layers are rasterized images'
  };
}
```

### Template Metadata Format

**Required fields in `templates.json`:**

```json
{
  "id": "template-001",
  "name": "Modern Business",
  "psdFile": "modern-business.psd",
  "preview": "/template-previews/modern-business.png",
  "sides": 2,
  "available": true,
  "psdFileSize": 15728640,
  "largeFileWarning": false,
  "editableElements": [
    "Company Name",
    "Offer Heading",
    "Offer Body",
    "Address Line 1",
    "Address Line 2"
  ],
  "features": [
    "Double-Sided",
    "Logo Placement",
    "Brand Colors",
    "Custom Text"
  ],
  "category": "business",
  "primaryColor": "#20B2AA"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `psdFile` | string | ✅ | Filename in `/public/PSD-files/` |
| `preview` | string | ✅ | Preview image path (PNG/JPG) |
| `sides` | number | ✅ | 1 or 2 |
| `available` | boolean | ✅ | Can be selected |
| `editableElements` | array | ❌ | List of editable text layers |
| `features` | array | ❌ | Feature tags for filtering |

### Error Handling

#### PSD Loading Errors

```json
{
  "PSD_NOT_FOUND": "PSD file not found at /public/PSD-files/{filename}",
  "PSD_PARSE_ERROR": "Failed to parse PSD layers - file may be corrupt",
  "PSD_NO_EDITABLE_CONTENT": "PSD has no editable text or shape layers",
  "PSD_TOO_LARGE": "File exceeds 50MB limit - optimize and re-export"
}
```

#### Brand Color Application Errors

```json
{
  "NO_VECTOR_SHAPES": "No vector shapes found for color application",
  "RASTERIZED_BACKGROUNDS": "Background layers are rasterized images and cannot be colored",
  "INVALID_HEX_FORMAT": "Color must be in hex format (#RRGGBB)",
  "COLOR_CONVERSION_FAILED": "Failed to convert hex to RGB (NaN values)"
}
```

#### User-Facing Warnings

When brand colors cannot be applied, the UI shows:

```
⚠️ Background layers are rasterized images and cannot have colors applied.
   Use vector shapes for color customization.
```

```
⚠️ No vector shapes found to apply brand colors.
   Select individual text or shape elements to change their colors.
```

### Testing Requirements

Before deploying a PSD template:

1. **Visual Inspection in Photoshop**
   - [ ] Check Layers panel - backgrounds show vector icon
   - [ ] Double-click shape - Fill shows "Color", not "Image"
   - [ ] Try changing background color manually
   - [ ] Verify text layers are NOT rasterized

2. **Frontend Testing**
   - [ ] Upload PSD to `/public/PSD-files/`
   - [ ] Add entry to `templates.json`
   - [ ] Load in editor - no parse errors
   - [ ] Select background layer
   - [ ] Click "Apply Brand Color" button
   - [ ] Verify SUCCESS message (not warning)
   - [ ] Confirm color actually changes

3. **Export Testing**
   - [ ] Export as PNG - 300 DPI maintained
   - [ ] Export as PDF - text remains editable
   - [ ] File size reasonable (< 5MB for PNG)

### Best Practices Summary

| ✅ DO | ❌ DON'T |
|-------|----------|
| Use Shape Tool for backgrounds | Rasterize background layers |
| Solid color fills | Image fills on backgrounds |
| Descriptive layer names | Generic names ("Layer 1") |
| Organize in groups (Front/Back) | Flatten to single layer |
| Keep text as text layers | Rasterize text for effects |
| Test color application | Skip testing before deployment |
| 300 DPI, RGB mode | Lower resolution or CMYK |
| Under 50MB file size | Exceed size limits |

### Support Resources

- [IMG.LY Creative Engine Docs](https://img.ly/docs/cesdk/)
- [Photoshop Shape Layers Guide](https://helpx.adobe.com/photoshop/using/creating-shapes.html)
- [Frontend README.md](./README.md) - Detailed designer guidelines
- Support: support@postcard-app.com

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2025-01-06 | Added PSD template requirements section |
| 1.0.0 | 2025-08-21 | Initial API documentation |