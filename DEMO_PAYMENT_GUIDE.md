# 🎬 Demo Payment Guide - Test Mode

This guide provides everything you need to demonstrate the MovePost payment flow using **Stripe Test Mode**. No real charges will occur.

---

## ✅ Current Configuration

Your `.env` file is already configured for **test mode**:

```env
VITE_STRIPE_PUBLISHABLE_KEY='pk_test_51S31qZFE8ZYw5bODntUa4WD5OzA3A1thWQGQvpyFYfFUUF28qWw31mbOz4nqvF3UUim4E2FqrSxdtFY8eYCQ0yr100keIf6WdT'
```

✅ The `pk_test_` prefix confirms this is a **test key** - no real charges will be made.

---

## 🧪 Stripe Test Card Numbers

Use these test cards during your demo:

### ✅ Successful Payments

| Card Number | Brand | Scenario |
|------------|-------|----------|
| `4242 4242 4242 4242` | Visa | Always succeeds |
| `5555 5555 5555 4444` | Mastercard | Always succeeds |
| `3782 822463 10005` | American Express | Always succeeds |
| `6011 1111 1111 1117` | Discover | Always succeeds |

### ⚠️ Test Failure Scenarios (Optional)

| Card Number | Scenario |
|------------|----------|
| `4000 0000 0000 0002` | Card declined (generic) |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |

### 📝 Additional Required Info

For any test card, use:
- **Expiration Date**: Any future date (e.g., `12/25`, `06/28`)
- **CVC**: Any 3 digits (e.g., `123`, `999`)
- **ZIP Code**: Any 5-digit US ZIP (e.g., `10001`, `90210`)
- **Name**: Any name (e.g., `John Doe`)

---

## 🎯 Demo Flow Walkthrough

### Step 1: Sign Up & Onboarding
1. Navigate to signup page
2. Create new account with test email: `demo@example.com`
3. Complete onboarding:
   - Enter business website (e.g., `louisvuitton.com`)
   - Brand colors automatically retrieved
   - Select business category

### Step 2: Create Campaign
1. Click "New Campaign" on dashboard
2. **Step 1**: Confirm business info
3. **Step 2**: Select postcard template
4. **Step 3**: Customize design
   - Toggle between **Simple Mode** (locked layout) and **Advanced Mode** (full control)
   - Show brand colors in color picker
   - Click "Save Design" (uploads to Cloudinary)
5. **Step 4**: Target ZIP codes
   - Enter test ZIPs: `10001, 10002, 10003`
   - Click "Validate" (queries Melissa API for new mover data)
   - Review pricing: **$3.00 per postcard** (flat rate)
6. **Step 5**: Launch campaign
   - Review final summary
   - Click **"Activate"** button

### Step 3: Payment Processing
When payment modal appears:

1. **Enter Test Card**:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: 12/25
   CVC: 123
   ZIP: 10001
   Name: John Doe
   ```

2. **Click "Pay $XX.XX"**

3. **Expected Behavior**:
   - ✅ Payment processes successfully
   - ✅ Green success toast: "Campaign activated successfully!"
   - ✅ Campaign status changes to "Active"
   - ✅ Redirected to dashboard

### Step 4: View Results
1. Dashboard shows new active campaign
2. Click campaign card to view details:
   - Campaign name
   - Status: **Active**
   - Postcards sent: 0
   - Target ZIP codes: 3
   - Total cost: $XX.XX
   - Addresses targeted (from Melissa API)

---

## 💡 Demo Talking Points

### Payment Security
> "We use Stripe, the industry standard for payment processing. All payment data is encrypted and never stored on our servers. We're currently in test mode for this demo, so no real charges will occur."

### Pricing Model
> "Our pricing is currently a flat $3 per postcard, which includes printing, postage, and delivery to verified new movers. We're planning to introduce dynamic pricing based on targeting criteria and volume in the future."

### Payment Status Tracking
> "Each campaign tracks its payment status. You can see whether payments are pending, completed, or failed. We also provide detailed transaction history in the billing section."

### Melissa Data Integration
> "We validate all ZIP codes in real-time using the Melissa Data API, which ensures we're only targeting addresses with confirmed new movers. This maximizes your ROI by eliminating wasted sends."

---

## 🔍 Verify Test Payments

### In Stripe Dashboard (Test Mode)

1. Go to [dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)
2. You'll see all test payments appear here
3. Look for payments with:
   - Status: **Succeeded**
   - Amount: Based on recipient count × $3.00
   - Customer: Your test user's email
   - Description: "MovePost Campaign: [Campaign Name]"

### In Your Application

1. **Dashboard**: Campaign shows status "Active"
2. **Campaign Details**: Payment status shows "Paid"
3. **History**: Transaction appears in billing history (if implemented)

---

## ⚠️ Important Demo Notes

### What WILL Happen
✅ Payment processes through Stripe test mode
✅ Campaign activates and appears on dashboard
✅ Campaign details show targeted addresses
✅ UI shows success confirmation

### What WON'T Happen
❌ No real money charged
❌ No actual postcards printed or mailed
❌ No bank accounts debited
❌ No production Stripe fees incurred

---

## 🚨 Troubleshooting

### Payment Modal Doesn't Appear
- **Check**: Stripe publishable key in `.env`
- **Check**: Frontend has access to Stripe.js library
- **Solution**: Restart dev server after changing `.env`

### "Invalid API Key" Error
- **Issue**: Wrong Stripe key or mixing test/live keys
- **Solution**: Verify `.env` has `pk_test_` key, not `pk_live_`

### Payment Succeeds But Campaign Doesn't Activate
- **Check**: Network tab for API errors
- **Check**: `campaignService.updateCampaign()` call succeeds
- **Solution**: Check Supabase logs for database errors

### Test Card Declined
- **Issue**: Using real card number instead of test card
- **Solution**: Only use test cards from table above
- **Verify**: Card number starts with `4242`, `5555`, etc.

---

## 📊 Demo Scenarios

### Scenario 1: Quick Success Path (2 min)
1. Sign up → Enter business URL → Get brand colors
2. Create campaign → Pick template → Quick customization
3. Enter 3 ZIP codes → Validate → Activate
4. Use `4242 4242 4242 4242` → Payment succeeds
5. View active campaign on dashboard

### Scenario 2: Advanced Editing (5 min)
1. Follow Scenario 1, but spend more time in editor
2. Toggle Simple/Advanced modes
3. Show brand color integration
4. Demonstrate saving design to cloud
5. Show reload functionality (edit campaign later)

### Scenario 3: Payment Failure Recovery (3 min)
1. Create campaign as normal
2. Use declined card: `4000 0000 0000 0002`
3. Show error handling
4. Retry with successful card: `4242 4242 4242 4242`
5. Campaign activates successfully

---

## 🎓 Post-Demo Next Steps

After the demo, remind stakeholders:

1. **Production Readiness**:
   - Switch to live Stripe keys: `pk_live_...`
   - Move API secrets to backend/environment variables
   - Implement rate limiting and fraud detection
   - Add webhook handlers for payment events

2. **Future Enhancements**:
   - Saved payment methods (already schema'd)
   - Subscription billing for monthly plans
   - Invoice generation
   - Refund handling
   - Payment analytics dashboard

3. **Compliance**:
   - PCI-DSS compliance (Stripe handles this)
   - Privacy policy updates
   - Terms of service for billing
   - GDPR/CCPA for payment data

---

## 📞 Support Resources

- **Stripe Test Cards**: [stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Stripe Dashboard**: [dashboard.stripe.com](https://dashboard.stripe.com)
- **Melissa API Docs**: [melissa.com/developer](https://www.melissa.com/developer)

---

**Ready for your demo? 🚀**

Use test card `4242 4242 4242 4242` for quick success!
