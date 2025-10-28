-- ============================================
-- PAYMENT METHODS TABLE SCHEMA
-- For storing saved Stripe payment methods
-- ============================================

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User Reference
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Stripe References
    stripe_payment_method_id VARCHAR(255) NOT NULL UNIQUE, -- Stripe PM ID (pm_xxx)
    stripe_customer_id VARCHAR(255) NOT NULL, -- Stripe customer ID (cus_xxx)

    -- Payment Method Type
    payment_type VARCHAR(50) NOT NULL, -- 'card', 'bank_account', 'paypal', etc.

    -- Card Information (if type is 'card')
    card_brand VARCHAR(50), -- 'visa', 'mastercard', 'amex', etc.
    card_last4 VARCHAR(4), -- Last 4 digits
    card_exp_month INTEGER, -- 1-12
    card_exp_year INTEGER, -- YYYY
    card_funding VARCHAR(20), -- 'credit', 'debit', 'prepaid'
    card_country VARCHAR(2), -- 2-letter country code

    -- Bank Account Information (if type is 'bank_account')
    bank_name VARCHAR(100),
    bank_last4 VARCHAR(4),
    bank_account_type VARCHAR(20), -- 'checking', 'savings'
    bank_routing_number VARCHAR(20),

    -- Billing Details
    billing_name VARCHAR(255),
    billing_email VARCHAR(255),
    billing_phone VARCHAR(20),
    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(50),
    billing_zip VARCHAR(10),
    billing_country VARCHAR(2) DEFAULT 'US',

    -- Status & Preferences
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE, -- For bank accounts
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'failed', 'removed'

    -- Metadata
    nickname VARCHAR(100), -- User-friendly name like "Personal Visa"
    metadata JSONB, -- Additional Stripe metadata

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,

    -- Soft Delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_pm ON payment_methods(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_customer ON payment_methods(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_payment_methods_status ON payment_methods(status);
CREATE INDEX IF NOT EXISTS idx_payment_methods_created_at ON payment_methods(created_at DESC);

-- Create a trigger to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_methods_updated_at
BEFORE UPDATE ON payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_payment_methods_updated_at();

-- Trigger to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
    -- If this payment method is being set as default
    IF NEW.is_default = TRUE THEN
        -- Set all other payment methods for this user to non-default
        UPDATE payment_methods
        SET is_default = FALSE,
            updated_at = NOW()
        WHERE user_id = NEW.user_id
        AND id != NEW.id
        AND is_default = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default
BEFORE INSERT OR UPDATE ON payment_methods
FOR EACH ROW
WHEN (NEW.is_default = TRUE)
EXECUTE FUNCTION ensure_single_default_payment_method();

-- Row Level Security (RLS) Policies
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Users can only see their own payment methods
CREATE POLICY "Users can view their own payment methods"
    ON payment_methods FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own payment methods
CREATE POLICY "Users can create their own payment methods"
    ON payment_methods FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own payment methods
CREATE POLICY "Users can update their own payment methods"
    ON payment_methods FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own payment methods
CREATE POLICY "Users can delete their own payment methods"
    ON payment_methods FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View for active payment methods with masked details
CREATE OR REPLACE VIEW user_payment_methods_summary AS
SELECT
    id,
    user_id,
    payment_type,
    CASE
        WHEN payment_type = 'card' THEN card_brand || ' •••• ' || card_last4
        WHEN payment_type = 'bank_account' THEN bank_name || ' •••• ' || bank_last4
        ELSE payment_type
    END as display_name,
    CASE
        WHEN payment_type = 'card' THEN
            CASE
                WHEN card_exp_year < EXTRACT(YEAR FROM NOW()) THEN TRUE
                WHEN card_exp_year = EXTRACT(YEAR FROM NOW()) AND card_exp_month < EXTRACT(MONTH FROM NOW()) THEN TRUE
                ELSE FALSE
            END
        ELSE FALSE
    END as is_expired,
    is_default,
    status,
    last_used_at,
    created_at
FROM payment_methods
WHERE deleted_at IS NULL
ORDER BY is_default DESC, created_at DESC;

-- ============================================
-- EXAMPLE QUERIES
-- ============================================

-- Get all payment methods for current user
-- SELECT * FROM payment_methods
-- WHERE user_id = auth.uid()
-- AND deleted_at IS NULL
-- ORDER BY is_default DESC, created_at DESC;

-- Get default payment method
-- SELECT * FROM payment_methods
-- WHERE user_id = auth.uid()
-- AND is_default = TRUE
-- AND deleted_at IS NULL
-- LIMIT 1;

-- Add new card payment method
-- INSERT INTO payment_methods (
--     user_id,
--     stripe_payment_method_id,
--     stripe_customer_id,
--     payment_type,
--     card_brand,
--     card_last4,
--     card_exp_month,
--     card_exp_year,
--     billing_name,
--     is_default
-- ) VALUES (
--     auth.uid(),
--     'pm_1234567890',
--     'cus_1234567890',
--     'card',
--     'visa',
--     '4242',
--     12,
--     2025,
--     'John Doe',
--     TRUE
-- );

-- Set a payment method as default
-- UPDATE payment_methods
-- SET is_default = TRUE,
--     updated_at = NOW()
-- WHERE id = '<payment-method-id>'
-- AND user_id = auth.uid();

-- Mark payment method as used
-- UPDATE payment_methods
-- SET last_used_at = NOW(),
--     updated_at = NOW()
-- WHERE id = '<payment-method-id>'
-- AND user_id = auth.uid();

-- Soft delete a payment method
-- UPDATE payment_methods
-- SET deleted_at = NOW(),
--     status = 'removed',
--     updated_at = NOW()
-- WHERE id = '<payment-method-id>'
-- AND user_id = auth.uid();

-- Get user's payment methods summary
-- SELECT * FROM user_payment_methods_summary
-- WHERE user_id = auth.uid();

-- Check for expired cards
-- SELECT * FROM payment_methods
-- WHERE user_id = auth.uid()
-- AND payment_type = 'card'
-- AND (
--     card_exp_year < EXTRACT(YEAR FROM NOW())
--     OR (card_exp_year = EXTRACT(YEAR FROM NOW()) AND card_exp_month < EXTRACT(MONTH FROM NOW()))
-- )
-- AND deleted_at IS NULL;
