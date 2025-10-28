-- ============================================
-- COMPANIES TABLE SCHEMA
-- For storing business/company information and branding
-- ============================================

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User Reference
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Company Basic Information
    name VARCHAR(255) NOT NULL,
    website TEXT,
    domain VARCHAR(255), -- Extracted domain from website
    business_category VARCHAR(100),
    description TEXT,
    industry VARCHAR(100),

    -- Brand Assets
    logo_url TEXT, -- Primary logo URL
    logo_icon_url TEXT, -- Icon/favicon URL
    primary_color VARCHAR(7), -- Hex color code (e.g., #20B2AA)
    secondary_color VARCHAR(7), -- Hex color code
    color_palette JSONB, -- Array of brand colors from Brandfetch

    -- Typography
    fonts JSONB, -- Font family information

    -- Social Media Links
    social_links JSONB, -- Social media profiles

    -- Additional Company Info
    founded VARCHAR(50),
    employees VARCHAR(50),
    location TEXT,

    -- Raw Data from Brandfetch API
    brandfetch_data JSONB, -- Store complete API response for reference

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Soft Delete
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT unique_user_company UNIQUE(user_id) -- One company per user
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

-- Create a trigger to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_companies_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Users can only see their own company
CREATE POLICY "Users can view their own company"
    ON companies FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own company
CREATE POLICY "Users can create their own company"
    ON companies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own company
CREATE POLICY "Users can update their own company"
    ON companies FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own company (soft delete)
CREATE POLICY "Users can delete their own company"
    ON companies FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- EXAMPLE QUERIES
-- ============================================

-- Get company for current user
-- SELECT * FROM companies WHERE user_id = auth.uid() AND deleted_at IS NULL;

-- Update company brand colors
-- UPDATE companies
-- SET primary_color = '#20B2AA',
--     secondary_color = '#2C7A7B',
--     color_palette = '["#20B2AA", "#2C7A7B", "#319795"]'::jsonb,
--     updated_at = NOW()
-- WHERE user_id = auth.uid();

-- Store Brandfetch data
-- INSERT INTO companies (
--     user_id, name, website, domain,
--     logo_url, primary_color, color_palette,
--     brandfetch_data
-- ) VALUES (
--     auth.uid(),
--     'Acme Corp',
--     'https://acmecorp.com',
--     'acmecorp.com',
--     'https://logo.url/acme.png',
--     '#20B2AA',
--     '["#20B2AA", "#2C7A7B"]'::jsonb,
--     '{...}'::jsonb
-- )
-- ON CONFLICT (user_id)
-- DO UPDATE SET
--     name = EXCLUDED.name,
--     website = EXCLUDED.website,
--     logo_url = EXCLUDED.logo_url,
--     updated_at = NOW();
