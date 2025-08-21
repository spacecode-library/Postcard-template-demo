# Postcard Marketing PWA - Backend Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [Backend Architecture](#backend-architecture)
5. [API Endpoints](#api-endpoints)
6. [Services Architecture](#services-architecture)
7. [Application Flow](#application-flow)
8. [Setup Instructions](#setup-instructions)
9. [Deployment Guide](#deployment-guide)

## Project Overview

The Postcard Marketing PWA is an automated platform that enables businesses to send targeted postcard campaigns to potential customers. The system integrates company data fetching, AI-powered template generation, and automated postcard printing/mailing services.

### Phase 1 Features
- User authentication and onboarding
- Company data fetching and enrichment
- Template generation and customization
- Campaign management dashboard
- Billing and subscription management
- Postcard printing/mailing integration
- Analytics and tracking

## Technology Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js / Fastify
- **Database**: PostgreSQL (via Railway)
- **ORM**: Prisma / TypeORM
- **Authentication**: JWT + OAuth2 (Google)
- **File Storage**: Cloudinary / AWS S3
- **Queue System**: Bull / BullMQ (Redis)
- **Payment**: Stripe
- **External APIs**:
  - Company Data API (TBD)
  - Template Generation API (TBD)
  - Postcard Printing API (TBD)

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    onboarding_completed BOOLEAN DEFAULT false
);

-- Companies table (user's business info)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    industry VARCHAR(100),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'US',
    logo_url VARCHAR(500),
    brand_colors JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan_type VARCHAR(50) NOT NULL, -- 'starter', 'professional', 'enterprise'
    status VARCHAR(50) NOT NULL, -- 'active', 'cancelled', 'past_due', 'trialing'
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Templates table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'new_mover', 'radius', 'custom'
    design_data JSONB NOT NULL, -- Stores template design JSON
    front_image_url VARCHAR(500),
    back_image_url VARCHAR(500),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES templates(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'new_mover', 'radius', 'list'
    status VARCHAR(50) NOT NULL, -- 'draft', 'scheduled', 'processing', 'sent', 'completed', 'failed'
    target_criteria JSONB, -- Stores targeting parameters
    scheduled_date TIMESTAMP,
    sent_date TIMESTAMP,
    total_recipients INTEGER DEFAULT 0,
    postcards_sent INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipients table
CREATE TABLE recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    metadata JSONB, -- Additional recipient data
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'returned'
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    tracking_number VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'sent', 'delivered', 'returned', 'qr_scan', 'website_visit'
    event_data JSONB,
    recipient_id UUID REFERENCES recipients(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Keys table (for external service credentials)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL, -- 'company_data', 'printing_service', etc.
    api_key VARCHAR(500),
    api_secret VARCHAR(500),
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_recipients_campaign_id ON recipients(campaign_id);
CREATE INDEX idx_analytics_campaign_id ON analytics(campaign_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
```

## Backend Architecture

### Directory Structure
```
postcard-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── stripe.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── company.controller.js
│   │   ├── template.controller.js
│   │   ├── campaign.controller.js
│   │   ├── billing.controller.js
│   │   └── analytics.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── company-data.service.js
│   │   ├── template-generator.service.js
│   │   ├── postcard-printer.service.js
│   │   ├── stripe.service.js
│   │   ├── email.service.js
│   │   └── queue.service.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   └── rate-limit.middleware.js
│   ├── models/
│   │   └── [Prisma/TypeORM models]
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── company.routes.js
│   │   ├── template.routes.js
│   │   ├── campaign.routes.js
│   │   ├── billing.routes.js
│   │   └── analytics.routes.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── helpers.js
│   │   └── constants.js
│   ├── jobs/
│   │   ├── campaign-processor.job.js
│   │   └── analytics-aggregator.job.js
│   └── app.js
├── scripts/
│   └── setup-db.sh
├── prisma/
│   └── schema.prisma
├── .env.example
├── package.json
└── server.js
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
**Description**: Register a new user
```json
// Request Body
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt-token"
  }
}
```

#### POST /api/auth/login
**Description**: Login user
```json
// Request Body
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token"
  }
}
```

#### POST /api/auth/google
**Description**: Google OAuth login
```json
// Request Body
{
  "idToken": "google-id-token"
}

// Response
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token",
    "isNewUser": false
  }
}
```

### User & Company Endpoints

#### GET /api/user/profile
**Description**: Get current user profile
**Auth**: Required
```json
// Response
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "company": { /* company object */ },
    "subscription": { /* subscription object */ }
  }
}
```

#### POST /api/company/setup
**Description**: Complete company setup (onboarding)
**Auth**: Required
```json
// Request Body
{
  "name": "Acme Corp",
  "website": "https://acme.com",
  "industry": "technology",
  "address": {
    "line1": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105"
  }
}

// Response
{
  "success": true,
  "data": {
    "company": { /* company object */ },
    "enrichedData": { /* data from company API */ }
  }
}
```

#### POST /api/company/enrich
**Description**: Fetch and enrich company data
**Auth**: Required
```json
// Request Body
{
  "website": "https://example.com"
}

// Response
{
  "success": true,
  "data": {
    "companyName": "Example Corp",
    "industry": "Software",
    "employees": "50-100",
    "revenue": "$5M-$10M",
    "logo": "https://...",
    "brandColors": ["#FF0000", "#0000FF"]
  }
}
```

### Template Endpoints

#### GET /api/templates
**Description**: Get all templates (user's + defaults)
**Auth**: Required
```json
// Query Parameters
// ?category=new_mover&page=1&limit=20

// Response
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "uuid",
        "name": "Welcome Neighbor",
        "category": "new_mover",
        "frontImageUrl": "https://...",
        "backImageUrl": "https://...",
        "isDefault": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
```

#### POST /api/templates/generate
**Description**: Generate a new template using AI
**Auth**: Required
```json
// Request Body
{
  "prompt": "Create a modern welcome postcard for new movers",
  "category": "new_mover",
  "brandColors": ["#FF0000", "#0000FF"],
  "includeCompanyLogo": true
}

// Response
{
  "success": true,
  "data": {
    "template": {
      "id": "uuid",
      "name": "AI Generated Template",
      "designData": { /* template JSON */ },
      "frontImageUrl": "https://...",
      "backImageUrl": "https://..."
    }
  }
}
```

#### PUT /api/templates/:id
**Description**: Update template
**Auth**: Required
```json
// Request Body
{
  "name": "Updated Template Name",
  "designData": { /* updated design JSON */ }
}

// Response
{
  "success": true,
  "data": {
    "template": { /* updated template */ }
  }
}
```

### Campaign Endpoints

#### GET /api/campaigns
**Description**: Get all campaigns
**Auth**: Required
```json
// Query Parameters
// ?status=active&page=1&limit=20

// Response
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "uuid",
        "name": "Q4 New Mover Campaign",
        "type": "new_mover",
        "status": "active",
        "totalRecipients": 500,
        "postcardsSent": 450,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": { /* pagination info */ }
  }
}
```

#### POST /api/campaigns
**Description**: Create new campaign
**Auth**: Required
```json
// Request Body
{
  "name": "Spring New Mover Campaign",
  "type": "new_mover",
  "templateId": "template-uuid",
  "targetCriteria": {
    "radius": 5,
    "zipCodes": ["94105", "94107"],
    "homeValue": {
      "min": 500000,
      "max": 2000000
    }
  },
  "scheduledDate": "2024-04-01T10:00:00Z"
}

// Response
{
  "success": true,
  "data": {
    "campaign": {
      "id": "uuid",
      "name": "Spring New Mover Campaign",
      "status": "scheduled",
      "estimatedRecipients": 250,
      "estimatedCost": 187.50
    }
  }
}
```

#### POST /api/campaigns/:id/preview
**Description**: Preview campaign recipients
**Auth**: Required
```json
// Response
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

#### POST /api/campaigns/:id/send
**Description**: Send campaign
**Auth**: Required
```json
// Response
{
  "success": true,
  "data": {
    "campaign": {
      "id": "uuid",
      "status": "processing",
      "message": "Campaign is being processed. You'll receive an email when complete."
    }
  }
}
```

### Billing Endpoints

#### POST /api/billing/create-checkout
**Description**: Create Stripe checkout session
**Auth**: Required
```json
// Request Body
{
  "planType": "professional",
  "billingPeriod": "monthly"
}

// Response
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/...",
    "sessionId": "cs_..."
  }
}
```

#### POST /api/billing/webhook
**Description**: Stripe webhook handler
```json
// Stripe webhook payload
// Handles subscription updates, payment failures, etc.
```

#### GET /api/billing/subscription
**Description**: Get current subscription details
**Auth**: Required
```json
// Response
{
  "success": true,
  "data": {
    "subscription": {
      "planType": "professional",
      "status": "active",
      "currentPeriodEnd": "2024-02-01T00:00:00Z",
      "cancelAtPeriodEnd": false,
      "usage": {
        "postcardsSent": 450,
        "monthlyLimit": 1000
      }
    }
  }
}
```

### Analytics Endpoints

#### GET /api/analytics/dashboard
**Description**: Get dashboard analytics
**Auth**: Required
```json
// Query Parameters
// ?period=30d

// Response
{
  "success": true,
  "data": {
    "overview": {
      "totalCampaigns": 12,
      "totalPostcardsSent": 4500,
      "deliveryRate": 0.94,
      "totalSpent": 3375.00
    },
    "campaigns": [
      {
        "id": "uuid",
        "name": "Q4 Campaign",
        "sent": 500,
        "delivered": 470,
        "responseRate": 0.12
      }
    ],
    "recentActivity": [ /* recent events */ ]
  }
}
```

#### GET /api/analytics/campaigns/:id
**Description**: Get detailed campaign analytics
**Auth**: Required
```json
// Response
{
  "success": true,
  "data": {
    "campaign": {
      "id": "uuid",
      "name": "Q4 Campaign",
      "metrics": {
        "sent": 500,
        "delivered": 470,
        "returned": 30,
        "qrScans": 60,
        "websiteVisits": 45,
        "conversionRate": 0.09
      },
      "timeline": [ /* daily metrics */ ],
      "geography": [ /* metrics by location */ ]
    }
  }
}
```

## Services Architecture

### AuthService
- Handles user registration and login
- Manages JWT token generation and validation
- Integrates Google OAuth
- Password hashing and verification

### CompanyDataService
- Integrates with external company data API
- Enriches company information (logo, colors, industry)
- Caches enriched data for performance
- Handles API rate limiting

### TemplateGeneratorService
- Integrates with AI template generation API
- Processes design customization requests
- Generates print-ready postcard designs
- Manages template storage and retrieval

### PostcardPrinterService
- Integrates with postcard printing/mailing API
- Handles batch processing of postcards
- Manages delivery tracking
- Processes webhooks for delivery updates

### StripeService
- Manages customer creation and updates
- Handles subscription lifecycle
- Processes payments and invoices
- Manages usage-based billing

### QueueService
- Processes campaign sending jobs
- Handles batch recipient processing
- Manages retry logic for failed jobs
- Schedules recurring tasks

## Application Flow

### User Onboarding Flow
1. User registers via email/Google
2. User enters company information
3. System enriches company data via API
4. User selects subscription plan
5. Stripe checkout process
6. Onboarding marked complete

### Campaign Creation Flow
1. User selects campaign type (new mover/radius)
2. User defines target criteria
3. System estimates recipient count and cost
4. User selects/creates template
5. User previews campaign
6. User schedules or sends immediately
7. System queues campaign for processing

### Campaign Processing Flow (Background Job)
1. Job retrieves campaign from queue
2. Fetches recipients based on criteria
3. Generates personalized postcards
4. Batches postcards for printing API
5. Sends to printing service
6. Updates campaign status
7. Stores tracking information
8. Sends notification to user

## Setup Instructions

### Prerequisites
- Node.js v20+
- PostgreSQL 15+
- Redis 7+
- Railway CLI (for deployment)

### Database Setup Script

Create `scripts/setup-db.sh`:
```bash
#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Postcard Marketing Database...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}Please update .env with your database credentials${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}Connecting to database...${NC}"

# Create database if it doesn't exist (for local development)
if [[ "$DATABASE_URL" == *"localhost"* ]] || [[ "$DATABASE_URL" == *"127.0.0.1"* ]]; then
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    
    echo "Creating database $DB_NAME if it doesn't exist..."
    psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database already exists"
fi

# Run Prisma migrations
echo -e "${GREEN}Running database migrations...${NC}"
npx prisma migrate deploy

# Seed default data
echo -e "${GREEN}Seeding default data...${NC}"
npx prisma db seed

echo -e "${GREEN}Database setup complete!${NC}"

# Generate Prisma client
echo -e "${GREEN}Generating Prisma client...${NC}"
npx prisma generate

echo -e "${GREEN}✅ Setup complete! Database is ready.${NC}"
```

### Environment Variables (.env.example)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/postcard_marketing

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PROFESSIONAL=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...

# External APIs (to be provided)
COMPANY_DATA_API_KEY=
COMPANY_DATA_API_URL=

TEMPLATE_GENERATOR_API_KEY=
TEMPLATE_GENERATOR_API_URL=

POSTCARD_PRINTER_API_KEY=
POSTCARD_PRINTER_API_URL=

# Storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email
SENDGRID_API_KEY=
FROM_EMAIL=noreply@postcardmarketing.com

# App
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
```

### Local Development Setup
```bash
# Clone repository
git clone <repository-url>
cd postcard-backend

# Install dependencies
npm install

# Make setup script executable
chmod +x scripts/setup-db.sh

# Run database setup
./scripts/setup-db.sh

# Start development server
npm run dev
```

## Deployment Guide

### Railway Deployment

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login to Railway**
```bash
railway login
```

3. **Create New Project**
```bash
railway init
```

4. **Add PostgreSQL Database**
```bash
railway add postgresql
```

5. **Add Redis**
```bash
railway add redis
```

6. **Configure Environment Variables**
```bash
# Copy all variables from .env.example
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=<generated-secret>
# ... set all other variables
```

7. **Deploy**
```bash
railway up
```

8. **Run Database Migrations**
```bash
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

### Production Considerations

1. **Database Backups**: Configure automated daily backups in Railway
2. **Monitoring**: Set up error tracking (Sentry) and APM
3. **Rate Limiting**: Configure rate limits for API endpoints
4. **Security**: Enable CORS, helmet, and other security middleware
5. **Scaling**: Configure horizontal scaling for high traffic

### Postman Collection

A Postman collection with all endpoints will be provided separately for testing. The collection includes:
- Environment variables setup
- Authentication flow examples
- All API endpoints with sample requests
- Webhook testing utilities

---

This documentation provides a complete blueprint for implementing the backend. The modular architecture ensures easy maintenance and scalability as we move to Phase 2 features.