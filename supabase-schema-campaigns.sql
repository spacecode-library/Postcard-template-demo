-- ============================================
-- CAMPAIGNS TABLE SCHEMA
-- For storing postcard campaign data
-- ============================================

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User & Company References
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

    -- Campaign Basic Info
    campaign_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    -- Status values: 'draft', 'active', 'paused', 'completed', 'cancelled'

    -- Template & Design
    template_id VARCHAR(100),
    template_name VARCHAR(255),
    postcard_design_url TEXT, -- URL to the final designed postcard image
    postcard_preview_url TEXT, -- URL to preview image

    -- Targeting Information
    targeting_type VARCHAR(50) NOT NULL, -- 'zip_codes' or 'radius'
    target_zip_codes TEXT[], -- Array of ZIP codes
    target_location TEXT, -- For radius targeting
    target_radius INTEGER, -- Radius in miles

    -- Recipients
    total_recipients INTEGER DEFAULT 0,
    postcards_sent INTEGER DEFAULT 0,

    -- New Mover Data (relationships)
    new_mover_ids UUID[], -- Array of new_mover IDs that received postcards

    -- Pricing & Billing
    price_per_postcard DECIMAL(10, 2) DEFAULT 3.00,
    total_cost DECIMAL(10, 2) DEFAULT 0.00,
    payment_status VARCHAR(50) DEFAULT 'pending',
    -- Payment status: 'pending', 'paid', 'failed', 'refunded'
    payment_intent_id VARCHAR(255), -- Stripe payment intent ID
    paid_at TIMESTAMP WITH TIME ZONE,

    -- Analytics & Tracking
    postcards_delivered INTEGER DEFAULT 0,
    responses INTEGER DEFAULT 0,
    response_rate DECIMAL(5, 2) DEFAULT 0.00, -- Percentage

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    launched_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Soft Delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_company_id ON campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_payment_status ON campaigns(payment_status);

-- Create a trigger to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION update_campaigns_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Users can only see their own campaigns
CREATE POLICY "Users can view their own campaigns"
    ON campaigns FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own campaigns
CREATE POLICY "Users can create their own campaigns"
    ON campaigns FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own campaigns
CREATE POLICY "Users can update their own campaigns"
    ON campaigns FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own campaigns (soft delete)
CREATE POLICY "Users can delete their own campaigns"
    ON campaigns FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- CAMPAIGN ANALYTICS TABLE (Optional)
-- For detailed tracking of campaign performance
-- ============================================

CREATE TABLE IF NOT EXISTS campaign_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

    -- Daily metrics
    date DATE NOT NULL,
    postcards_sent_today INTEGER DEFAULT 0,
    postcards_delivered_today INTEGER DEFAULT 0,
    responses_today INTEGER DEFAULT 0,

    -- Engagement metrics
    unique_visits INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5, 2) DEFAULT 0.00,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(campaign_id, date)
);

CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_date ON campaign_analytics(date DESC);

-- RLS for campaign_analytics
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their campaign analytics"
    ON campaign_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_analytics.campaign_id
            AND campaigns.user_id = auth.uid()
        )
    );

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View for active campaigns with stats
CREATE OR REPLACE VIEW active_campaigns_view AS
SELECT
    c.*,
    comp.name as company_name,
    comp.logo_url as company_logo,
    (c.postcards_delivered::FLOAT / NULLIF(c.postcards_sent, 0) * 100) as delivery_rate
FROM campaigns c
LEFT JOIN companies comp ON c.company_id = comp.id
WHERE c.status = 'active'
AND c.deleted_at IS NULL;

-- View for campaign summary stats
CREATE OR REPLACE VIEW campaign_summary_stats AS
SELECT
    user_id,
    COUNT(*) as total_campaigns,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_campaigns,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_campaigns,
    SUM(total_recipients) as total_recipients_all_time,
    SUM(postcards_sent) as total_postcards_sent,
    SUM(total_cost) as total_spent,
    AVG(response_rate) as avg_response_rate
FROM campaigns
WHERE deleted_at IS NULL
GROUP BY user_id;

-- ============================================
-- EXAMPLE QUERIES
-- ============================================

-- Get all campaigns for a user
-- SELECT * FROM campaigns WHERE user_id = '<user-id>' AND deleted_at IS NULL ORDER BY created_at DESC;

-- Get campaign with company info
-- SELECT c.*, comp.name as company_name
-- FROM campaigns c
-- LEFT JOIN companies comp ON c.company_id = comp.id
-- WHERE c.user_id = '<user-id>';

-- Get campaign statistics
-- SELECT * FROM campaign_summary_stats WHERE user_id = '<user-id>';

-- Get campaign analytics for last 30 days
-- SELECT * FROM campaign_analytics
-- WHERE campaign_id = '<campaign-id>'
-- AND date >= CURRENT_DATE - INTERVAL '30 days'
-- ORDER BY date DESC;
