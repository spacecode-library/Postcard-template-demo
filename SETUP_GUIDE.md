# Setup Guide - Postcard Campaign Application

## 🚀 Quick Start

### 1. Database Setup (Supabase)

**Run the SQL Schema:**
```sql
-- Open Supabase SQL Editor and run:
-- File: supabase-schema-campaigns.sql

-- This creates:
-- ✅ campaigns table
-- ✅ campaign_analytics table
-- ✅ Indexes for performance
-- ✅ RLS policies
-- ✅ Helper views
-- ✅ Triggers for auto-timestamps
```

**Verify Tables Exist:**
```sql
SELECT * FROM campaigns LIMIT 1;
SELECT * FROM campaign_analytics LIMIT 1;
```

---

### 2. Environment Variables

Verify your `.env` file has:
```env
VITE_SUPABASE_URL=https://cbombaxhlvproggupdrn.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_MELISSA_CUSTOMER_ID=your-melissa-id
```

---

### 3. Supabase Edge Functions

Create these Edge Functions in Supabase:

#### A. `create-payment-intent`
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  try {
    const { amount, description, metadata } = await req.json()

    // Validate input
    if (!amount || amount < 50) {
      throw new Error('Amount must be at least $0.50')
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'usd',
      description: description || 'Postcard Campaign',
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return new Response(
      JSON.stringify({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

#### B. `confirm-payment`
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  try {
    const { paymentIntentId, paymentMethodId } = await req.json()

    if (!paymentIntentId) {
      throw new Error('Payment intent ID is required')
    }

    // Confirm the payment intent
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId || undefined,
    })

    return new Response(
      JSON.stringify({
        status: paymentIntent.status,
        paymentIntent: paymentIntent
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

**Deploy Edge Functions:**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Deploy functions
supabase functions deploy create-payment-intent
supabase functions deploy confirm-payment

# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

---

### 4. Test the Flow

#### A. Complete Onboarding:
1. **Step 1:** Enter website + category
2. **Step 2:** Select template
3. **Step 3:** Edit postcard (optional)
4. **Step 4:** Enter ZIP codes
   - Try: `10001-10005`
   - Try: `10001, 10002, 10010`
   - Try: `10001-10003, 10020-10022`
5. **Step 5:** Add payment method
6. **Step 6:** Activate campaign

#### B. Verify Database:
```sql
-- Check if campaign was created
SELECT * FROM campaigns ORDER BY created_at DESC LIMIT 1;

-- Check new movers were saved
SELECT COUNT(*) FROM newmover;

-- Check company data
SELECT * FROM companies ORDER BY created_at DESC LIMIT 1;
```

#### C. Test Dashboard:
- Navigate to `/dashboard`
- Should see your campaign
- Try pausing/resuming
- Try duplicating
- Check statistics cards

---

## 🔧 Troubleshooting

### Issue: "Failed to create campaign"
**Solution:**
- Check Supabase connection
- Verify `campaigns` table exists
- Check browser console for errors
- Ensure user is authenticated

### Issue: "Payment failed"
**Solution:**
- Verify Stripe keys in `.env`
- Check Edge Functions are deployed
- Use test card: `4242 4242 4242 4242`
- Check Supabase Edge Function logs

### Issue: "No new movers found"
**Solution:**
- Verify Melissa API key
- Check ZIP codes are valid US ZIPs
- Test with known ZIPs (10001, 90210, etc.)
- Check Melissa API response in Network tab

### Issue: "Dashboard shows 'Loading...'"
**Solution:**
- Check Supabase connection
- Verify RLS policies are enabled
- Check user authentication status
- Open browser console for errors

---

## 📊 Database Queries

### Get Campaign Details:
```sql
SELECT
  c.*,
  comp.name as company_name
FROM campaigns c
LEFT JOIN companies comp ON c.company_id = comp.id
WHERE c.user_id = '<user-id>'
ORDER BY c.created_at DESC;
```

### Get User Statistics:
```sql
SELECT
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
  SUM(total_recipients) as total_recipients,
  SUM(total_cost) as total_spent
FROM campaigns
WHERE user_id = '<user-id>'
AND deleted_at IS NULL;
```

### Get New Movers for Campaign:
```sql
SELECT nm.*
FROM newmover nm
WHERE nm.id = ANY(
  SELECT unnest(new_mover_ids)
  FROM campaigns
  WHERE id = '<campaign-id>'
);
```

---

## 🎨 Customization

### Change Postcard Price:
```javascript
// File: src/utils/pricing.js
export const PRICING = {
  PRICE_PER_POSTCARD: 3.00,  // Change this value
  // ...
};
```

### Add Discount Tiers:
```javascript
// File: src/utils/pricing.js
DISCOUNT_TIERS: [
  { min: 500, max: 999, discount: 0.05 },   // 5% off
  { min: 1000, max: 4999, discount: 0.10 }, // 10% off
  { min: 5000, max: Infinity, discount: 0.15 } // 15% off
]
```

### Customize ZIP Range Limit:
```javascript
// File: src/utils/zipCode.js
const MAX_RANGE_SIZE = 1000; // Change max ZIPs in a range
```

---

## 🧪 Testing

### Test ZIP Code Parsing:
```javascript
import { parseMultipleZipCodes } from './src/utils/zipCode';

// Test range
console.log(parseMultipleZipCodes('10001-10005'));
// Output: { zipCodes: ['10001', '10002', '10003', '10004', '10005'], count: 5, errors: [] }

// Test mixed
console.log(parseMultipleZipCodes('10001-10003, 10010'));
// Output: { zipCodes: ['10001', '10002', '10003', '10010'], count: 4, errors: [] }
```

### Test Pricing:
```javascript
import { calculatePostcardCost } from './src/utils/pricing';

console.log(calculatePostcardCost(100));
// Output: { count: 100, basePrice: 3, total: 300, subtotal: 300, discount: 0 }
```

### Test Campaign Service:
```javascript
import campaignService from './src/supabase/api/campaignService';

// Create test campaign
const result = await campaignService.createCampaign({
  name: 'Test Campaign',
  targeting_type: 'zip_codes',
  target_zip_codes: ['10001', '10002'],
  total_recipients: 50,
  total_cost: 150
});

console.log(result);
```

---

## 📈 Monitoring

### Check Campaign Stats:
```javascript
import campaignService from './src/supabase/api/campaignService';

const stats = await campaignService.getCampaignStats();
console.log(stats);
// Output: { total_campaigns, active_campaigns, total_postcards_sent, total_spent, ... }
```

### Monitor New Movers:
```sql
SELECT
  zip_code,
  COUNT(*) as mover_count,
  MAX(date_added) as last_added
FROM newmover
GROUP BY zip_code
ORDER BY mover_count DESC;
```

---

## 🔒 Security Checklist

- [x] RLS enabled on `campaigns` table
- [x] RLS enabled on `campaign_analytics` table
- [x] User can only access their own data
- [x] Stripe keys stored in env variables
- [x] API keys not exposed to client
- [x] Soft delete preserves data
- [x] Input validation on ZIP codes
- [x] Amount validation in Stripe

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `src/utils/pricing.js` | Pricing calculations |
| `src/utils/zipCode.js` | ZIP code utilities |
| `src/supabase/api/campaignService.js` | Campaign CRUD |
| `src/supabase/api/newMoverService.js` | New mover fetching |
| `src/supabase/api/paymentService.js` | Stripe integration |
| `src/pages/onboarding/OnboardingStep4.jsx` | Targeting & ZIP input |
| `src/pages/onboarding/OnboardingStep6.jsx` | Launch & payment |
| `src/pages/Dashboard.jsx` | Campaign management |
| `supabase-schema-campaigns.sql` | Database schema |

---

## ✅ Deployment Checklist

Before deploying to production:

1. Database:
   - [ ] Run schema on production Supabase
   - [ ] Verify RLS policies work
   - [ ] Test indexes performance
   - [ ] Backup plan in place

2. Environment:
   - [ ] Production Stripe keys set
   - [ ] Melissa API credentials valid
   - [ ] Supabase URL/keys correct
   - [ ] Edge Functions deployed

3. Testing:
   - [ ] Full onboarding flow works
   - [ ] Payments process correctly
   - [ ] Dashboard loads real data
   - [ ] ZIP ranges expand properly
   - [ ] Error handling works

4. Monitoring:
   - [ ] Set up Sentry/error tracking
   - [ ] Monitor Stripe webhooks
   - [ ] Track campaign creation rate
   - [ ] Monitor API costs (Melissa)

---

## 🎉 You're Ready!

The application now has:
✅ ZIP code range support
✅ Real-time new mover counts
✅ $3/postcard pricing
✅ Stripe payment processing
✅ Campaign database & management
✅ Functional dashboard with stats

**Next Steps:**
1. Deploy Edge Functions
2. Test end-to-end flow
3. Monitor first real campaigns
4. Gather user feedback

---

**Need Help?**
- Review `IMPLEMENTATION_SUMMARY.md` for detailed feature docs
- Check code comments in each file
- Refer to service JSDoc documentation
