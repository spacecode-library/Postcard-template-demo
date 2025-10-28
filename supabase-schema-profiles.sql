-- ============================================
-- PROFILES TABLE SCHEMA
-- For storing user profile information and preferences
-- ============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    -- Primary Key (matches auth.users.id)
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Personal Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone_number VARCHAR(20),

    -- Business/Professional Information
    job_title VARCHAR(100),
    department VARCHAR(100),

    -- Address Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    country VARCHAR(100) DEFAULT 'USA',

    -- Account Settings
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    marketing_emails BOOLEAN DEFAULT TRUE,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    language VARCHAR(10) DEFAULT 'en',

    -- Billing Information
    stripe_customer_id VARCHAR(255), -- Stripe customer ID
    default_payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    billing_email VARCHAR(255),

    -- Usage & Plan Information
    subscription_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'starter', 'professional', 'enterprise'
    subscription_status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'past_due', 'trialing'
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_started_at TIMESTAMP WITH TIME ZONE,

    -- Monthly Usage Limits & Tracking
    monthly_postcard_limit INTEGER DEFAULT 100, -- Based on plan
    monthly_postcards_sent INTEGER DEFAULT 0,
    monthly_limit_reset_at TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW() + INTERVAL '1 month'),

    -- Preferences
    default_targeting_type VARCHAR(50) DEFAULT 'zip_codes', -- 'zip_codes', 'radius'
    preferred_postcard_template VARCHAR(100),
    auto_approve_campaigns BOOLEAN DEFAULT FALSE,

    -- Onboarding Status
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 1,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,

    -- Account Status
    account_status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'deleted'
    suspended_at TIMESTAMP WITH TIME ZONE,
    suspension_reason TEXT,

    -- Metadata
    metadata JSONB, -- Additional flexible data

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Soft Delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles((metadata->>'email')) WHERE metadata->>'email' IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Create a trigger to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- Trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, created_at)
    VALUES (NEW.id, NOW())
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_new_user();

-- Function to reset monthly postcard count
CREATE OR REPLACE FUNCTION reset_monthly_postcard_count()
RETURNS void AS $$
BEGIN
    UPDATE profiles
    SET monthly_postcards_sent = 0,
        monthly_limit_reset_at = DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
        updated_at = NOW()
    WHERE monthly_limit_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Allow service role to insert profiles (for signup trigger)
CREATE POLICY "Service role can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (true);

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View for user account overview
CREATE OR REPLACE VIEW user_account_overview AS
SELECT
    p.id,
    p.full_name,
    p.avatar_url,
    p.subscription_tier,
    p.subscription_status,
    p.monthly_postcard_limit,
    p.monthly_postcards_sent,
    (p.monthly_postcard_limit - p.monthly_postcards_sent) as remaining_postcards,
    p.monthly_limit_reset_at,
    p.onboarding_completed,
    p.account_status,
    c.name as company_name,
    c.logo_url as company_logo,
    COUNT(DISTINCT camp.id) as total_campaigns,
    SUM(camp.total_cost) as total_spent
FROM profiles p
LEFT JOIN companies c ON c.user_id = p.id
LEFT JOIN campaigns camp ON camp.user_id = p.id AND camp.deleted_at IS NULL
GROUP BY p.id, p.full_name, p.avatar_url, p.subscription_tier, p.subscription_status,
         p.monthly_postcard_limit, p.monthly_postcards_sent, p.monthly_limit_reset_at,
         p.onboarding_completed, p.account_status, c.name, c.logo_url;

-- ============================================
-- EXAMPLE QUERIES
-- ============================================

-- Get current user's profile
-- SELECT * FROM profiles WHERE id = auth.uid();

-- Update user profile information
-- UPDATE profiles
-- SET first_name = 'John',
--     last_name = 'Doe',
--     full_name = 'John Doe',
--     phone_number = '555-1234',
--     updated_at = NOW()
-- WHERE id = auth.uid();

-- Check if user has reached monthly limit
-- SELECT
--     monthly_postcards_sent >= monthly_postcard_limit as limit_reached,
--     monthly_postcard_limit - monthly_postcards_sent as remaining
-- FROM profiles
-- WHERE id = auth.uid();

-- Increment monthly postcard count
-- UPDATE profiles
-- SET monthly_postcards_sent = monthly_postcards_sent + <count>,
--     updated_at = NOW()
-- WHERE id = auth.uid();

-- Get account overview
-- SELECT * FROM user_account_overview WHERE id = auth.uid();

-- Update subscription tier
-- UPDATE profiles
-- SET subscription_tier = 'professional',
--     monthly_postcard_limit = 1000,
--     subscription_started_at = NOW(),
--     updated_at = NOW()
-- WHERE id = auth.uid();

-- Mark onboarding as completed
-- UPDATE profiles
-- SET onboarding_completed = TRUE,
--     onboarding_step = 6,
--     onboarding_completed_at = NOW(),
--     updated_at = NOW()
-- WHERE id = auth.uid();
