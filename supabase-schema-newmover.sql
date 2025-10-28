-- ============================================
-- NEW MOVERS TABLE SCHEMA
-- For storing new mover data from Melissa Data API
-- ============================================

-- Create newmover table
CREATE TABLE IF NOT EXISTS newmover (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User Reference (who pulled this data)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Campaign Reference (optional - if associated with a campaign)
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

    -- Melissa Data Unique Identifier
    melissa_id VARCHAR(255), -- Unique ID from Melissa API (if provided)

    -- Personal Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255),
    prefix VARCHAR(20), -- Mr., Mrs., Ms., Dr., etc.
    suffix VARCHAR(20), -- Jr., Sr., III, etc.

    -- Address Information
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL, -- 2-letter state code
    zip_code VARCHAR(10) NOT NULL,
    zip_plus4 VARCHAR(4), -- ZIP+4 extension
    county VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Move Information
    move_date DATE, -- Date they moved to this address
    previous_address TEXT,
    previous_city VARCHAR(100),
    previous_state VARCHAR(2),
    previous_zip VARCHAR(10),

    -- Contact Information
    phone_number VARCHAR(20),
    email VARCHAR(255),

    -- Household Information
    household_size INTEGER,
    has_children BOOLEAN,
    home_ownership VARCHAR(20), -- 'renter' or 'owner'
    property_type VARCHAR(50), -- 'single_family', 'apartment', 'condo', etc.
    estimated_income_range VARCHAR(50),
    estimated_home_value DECIMAL(12, 2),

    -- Demographics
    age_range VARCHAR(20),
    gender VARCHAR(20),
    marital_status VARCHAR(20),

    -- Marketing Preferences
    opt_out BOOLEAN DEFAULT FALSE,
    do_not_mail BOOLEAN DEFAULT FALSE,
    deceased BOOLEAN DEFAULT FALSE,

    -- Postcard Delivery Status
    postcard_sent BOOLEAN DEFAULT FALSE,
    postcard_sent_at TIMESTAMP WITH TIME ZONE,
    postcard_delivered BOOLEAN DEFAULT FALSE,
    postcard_delivered_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(50), -- 'pending', 'delivered', 'returned', 'failed'

    -- Engagement Tracking
    responded BOOLEAN DEFAULT FALSE,
    responded_at TIMESTAMP WITH TIME ZONE,
    response_type VARCHAR(50), -- 'website_visit', 'phone_call', 'email', etc.

    -- Raw Data from Melissa API
    melissa_raw_data JSONB, -- Store complete API response

    -- Data Validation
    address_verified BOOLEAN DEFAULT FALSE,
    verification_score INTEGER, -- 0-100 score from Melissa
    verification_codes TEXT[], -- Array of verification codes

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Last time data was refreshed from Melissa

    -- Soft Delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_newmover_user_id ON newmover(user_id);
CREATE INDEX IF NOT EXISTS idx_newmover_campaign_id ON newmover(campaign_id);
CREATE INDEX IF NOT EXISTS idx_newmover_zip_code ON newmover(zip_code);
CREATE INDEX IF NOT EXISTS idx_newmover_state ON newmover(state);
CREATE INDEX IF NOT EXISTS idx_newmover_move_date ON newmover(move_date DESC);
CREATE INDEX IF NOT EXISTS idx_newmover_postcard_sent ON newmover(postcard_sent);
CREATE INDEX IF NOT EXISTS idx_newmover_created_at ON newmover(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newmover_melissa_id ON newmover(melissa_id) WHERE melissa_id IS NOT NULL;

-- Composite index for campaign ZIP code queries
CREATE INDEX IF NOT EXISTS idx_newmover_campaign_zip ON newmover(campaign_id, zip_code) WHERE deleted_at IS NULL;

-- Create a trigger to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_newmover_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER newmover_updated_at
BEFORE UPDATE ON newmover
FOR EACH ROW
EXECUTE FUNCTION update_newmover_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE newmover ENABLE ROW LEVEL SECURITY;

-- Users can only see their own new mover data
CREATE POLICY "Users can view their own new mover data"
    ON newmover FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own new mover data
CREATE POLICY "Users can create their own new mover records"
    ON newmover FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own new mover data
CREATE POLICY "Users can update their own new mover data"
    ON newmover FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own new mover data
CREATE POLICY "Users can delete their own new mover data"
    ON newmover FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View for new movers who haven't received postcards yet
CREATE OR REPLACE VIEW pending_newmovers AS
SELECT *
FROM newmover
WHERE postcard_sent = FALSE
AND opt_out = FALSE
AND do_not_mail = FALSE
AND deceased = FALSE
AND deleted_at IS NULL
ORDER BY move_date DESC;

-- View for new mover statistics by ZIP code
CREATE OR REPLACE VIEW newmover_stats_by_zip AS
SELECT
    user_id,
    zip_code,
    state,
    city,
    COUNT(*) as total_movers,
    COUNT(CASE WHEN postcard_sent = TRUE THEN 1 END) as postcards_sent,
    COUNT(CASE WHEN postcard_delivered = TRUE THEN 1 END) as postcards_delivered,
    COUNT(CASE WHEN responded = TRUE THEN 1 END) as responses,
    MAX(move_date) as most_recent_move_date,
    MIN(created_at) as data_first_retrieved
FROM newmover
WHERE deleted_at IS NULL
GROUP BY user_id, zip_code, state, city;

-- ============================================
-- EXAMPLE QUERIES
-- ============================================

-- Get new movers for specific ZIP codes
-- SELECT * FROM newmover
-- WHERE user_id = auth.uid()
-- AND zip_code = ANY(ARRAY['10001', '10002', '10003'])
-- AND deleted_at IS NULL
-- ORDER BY move_date DESC;

-- Get new movers for a campaign
-- SELECT * FROM newmover
-- WHERE campaign_id = '<campaign-id>'
-- AND deleted_at IS NULL;

-- Mark postcards as sent for a campaign
-- UPDATE newmover
-- SET postcard_sent = TRUE,
--     postcard_sent_at = NOW(),
--     delivery_status = 'pending'
-- WHERE campaign_id = '<campaign-id>'
-- AND postcard_sent = FALSE;

-- Get statistics for new movers by ZIP
-- SELECT * FROM newmover_stats_by_zip
-- WHERE user_id = auth.uid()
-- ORDER BY total_movers DESC;

-- Find new movers who moved in last 30 days
-- SELECT * FROM newmover
-- WHERE user_id = auth.uid()
-- AND move_date >= CURRENT_DATE - INTERVAL '30 days'
-- AND deleted_at IS NULL;

-- Get response rate by ZIP code
-- SELECT
--     zip_code,
--     COUNT(*) as total_sent,
--     COUNT(CASE WHEN responded = TRUE THEN 1 END) as responses,
--     ROUND(COUNT(CASE WHEN responded = TRUE THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0) * 100, 2) as response_rate_percent
-- FROM newmover
-- WHERE user_id = auth.uid()
-- AND postcard_sent = TRUE
-- AND deleted_at IS NULL
-- GROUP BY zip_code
-- ORDER BY response_rate_percent DESC;
