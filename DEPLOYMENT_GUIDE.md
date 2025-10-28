# Deployment Guide - Stripe Edge Functions

## Prerequisites
- Supabase project created
- Stripe account with test/live keys
- Supabase CLI installed

## Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

## Step 2: Login to Supabase

```bash
supabase login
```

## Step 3: Link Your Project

```bash
# Get your project reference from Supabase dashboard URL
# Format: https://supabase.com/dashboard/project/YOUR_PROJECT_REF

supabase link --project-ref YOUR_PROJECT_REF
```

## Step 4: Deploy Edge Functions

Deploy all three Stripe functions:

```bash
# Deploy create-setup-intent (for saving payment methods)
supabase functions deploy create-setup-intent

# Deploy create-payment-intent (for charging customers)
supabase functions deploy create-payment-intent

# Deploy confirm-payment (for confirming payments)
supabase functions deploy confirm-payment
```

## Step 5: Set Stripe Secret Key

```bash
# Use your Stripe SECRET key (starts with sk_test_ or sk_live_)
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

⚠️ **Important**: Use `sk_test_` for development, `sk_live_` for production

## Step 6: Verify Deployment

```bash
# List all deployed functions
supabase functions list

# Check function logs
supabase functions logs create-setup-intent
supabase functions logs create-payment-intent
supabase functions logs confirm-payment
```

## Step 7: Test Edge Functions

You can test the functions using curl:

### Test create-setup-intent:
```bash
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-setup-intent' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"email":"test@example.com"}'
```

### Test create-payment-intent:
```bash
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-payment-intent' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"amount":300,"description":"Test payment","metadata":{}}'
```

## Troubleshooting

### Function returns 500 error
- Check if STRIPE_SECRET_KEY is set: `supabase secrets list`
- Check function logs: `supabase functions logs FUNCTION_NAME`
- Verify your Stripe key is valid in Stripe dashboard

### CORS errors
- All functions include CORS headers by default
- Make sure you're using the correct project URL

### Authentication errors
- Verify your Supabase anon key is correct
- Check that the user is authenticated when calling functions

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Yes | Your Stripe secret key (sk_test_* or sk_live_*) |

## Function Endpoints

Once deployed, your functions will be available at:

- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-setup-intent`
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-payment-intent`
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/confirm-payment`

Replace `YOUR_PROJECT_REF` with your actual Supabase project reference ID.

## Next Steps

After deployment:
1. Update your `.env` file with correct Supabase credentials
2. Test the payment flow in Step 5 (Payment Setup)
3. Test campaign creation in Step 6 (Launch Campaign)
4. Monitor function logs for any errors

## Quick Deploy Script

Save this as `deploy-functions.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Stripe Edge Functions..."

supabase functions deploy create-setup-intent
supabase functions deploy create-payment-intent
supabase functions deploy confirm-payment

echo "✅ All functions deployed!"
echo ""
echo "📝 Don't forget to set your Stripe secret key:"
echo "   supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY"
```

Make it executable and run:
```bash
chmod +x deploy-functions.sh
./deploy-functions.sh
```
