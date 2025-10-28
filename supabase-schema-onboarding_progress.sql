-- ============================================
-- ONBOARDING PROGRESS TABLE SCHEMA
-- For tracking user onboarding progress and state
-- ============================================

-- Create onboarding_progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User Reference
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Onboarding Status
    is_completed BOOLEAN DEFAULT FALSE,
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 6,

    -- Step Completion Tracking
    step1_completed BOOLEAN DEFAULT FALSE, -- Business information
    step1_completed_at TIMESTAMP WITH TIME ZONE,
    step1_data JSONB, -- Store form data

    step2_completed BOOLEAN DEFAULT FALSE, -- Business category
    step2_completed_at TIMESTAMP WITH TIME ZONE,
    step2_data JSONB,

    step3_completed BOOLEAN DEFAULT FALSE, -- Brand colors/logo
    step3_completed_at TIMESTAMP WITH TIME ZONE,
    step3_data JSONB,

    step4_completed BOOLEAN DEFAULT FALSE, -- Template selection
    step4_completed_at TIMESTAMP WITH TIME ZONE,
    step4_data JSONB,

    step5_completed BOOLEAN DEFAULT FALSE, -- ZIP code targeting
    step5_completed_at TIMESTAMP WITH TIME ZONE,
    step5_data JSONB,

    step6_completed BOOLEAN DEFAULT FALSE, -- Payment setup
    step6_completed_at TIMESTAMP WITH TIME ZONE,
    step6_data JSONB,

    -- First Campaign Creation (as part of onboarding)
    first_campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    first_campaign_created BOOLEAN DEFAULT FALSE,
    first_campaign_created_at TIMESTAMP WITH TIME ZONE,

    -- Skipped Steps (optional)
    skipped_steps INTEGER[], -- Array of step numbers that were skipped

    -- User Progress Metadata
    last_active_step INTEGER,
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Onboarding Type
    onboarding_type VARCHAR(50) DEFAULT 'standard', -- 'standard', 'quick', 'guided'
    entry_point VARCHAR(100), -- How they started: 'signup', 'dashboard_prompt', 'campaign_wizard'

    -- Feature Tour Progress
    dashboard_tour_completed BOOLEAN DEFAULT FALSE,
    editor_tour_completed BOOLEAN DEFAULT FALSE,
    analytics_tour_completed BOOLEAN DEFAULT FALSE,

    -- Metadata
    metadata JSONB, -- Flexible additional data

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_is_completed ON onboarding_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_onboarding_current_step ON onboarding_progress(current_step);
CREATE INDEX IF NOT EXISTS idx_onboarding_created_at ON onboarding_progress(created_at DESC);

-- Create a trigger to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_interaction_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER onboarding_progress_updated_at
BEFORE UPDATE ON onboarding_progress
FOR EACH ROW
EXECUTE FUNCTION update_onboarding_progress_updated_at();

-- Trigger to auto-create onboarding record when user signs up
CREATE OR REPLACE FUNCTION create_onboarding_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO onboarding_progress (user_id, entry_point, started_at)
    VALUES (NEW.id, 'signup', NOW())
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_signup_create_onboarding
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_onboarding_for_new_user();

-- Function to mark step as completed
CREATE OR REPLACE FUNCTION mark_onboarding_step_completed(
    p_user_id UUID,
    p_step_number INTEGER,
    p_step_data JSONB DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    v_column_name TEXT;
    v_timestamp_column TEXT;
    v_data_column TEXT;
BEGIN
    -- Build column names
    v_column_name := 'step' || p_step_number || '_completed';
    v_timestamp_column := 'step' || p_step_number || '_completed_at';
    v_data_column := 'step' || p_step_number || '_data';

    -- Update the progress record
    EXECUTE format(
        'UPDATE onboarding_progress
         SET %I = TRUE,
             %I = NOW(),
             %I = $1,
             current_step = GREATEST(current_step, $2),
             last_active_step = $2,
             updated_at = NOW()
         WHERE user_id = $3',
        v_column_name,
        v_timestamp_column,
        v_data_column
    ) USING p_step_data, p_step_number, p_user_id;

    -- Check if all steps are completed
    UPDATE onboarding_progress
    SET is_completed = (
        step1_completed AND
        step2_completed AND
        step3_completed AND
        step4_completed AND
        step5_completed AND
        step6_completed
    ),
    completed_at = CASE
        WHEN (step1_completed AND step2_completed AND step3_completed AND
              step4_completed AND step5_completed AND step6_completed)
             AND completed_at IS NULL
        THEN NOW()
        ELSE completed_at
    END
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see their own onboarding progress
CREATE POLICY "Users can view their own onboarding progress"
    ON onboarding_progress FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own onboarding progress
CREATE POLICY "Users can update their own onboarding progress"
    ON onboarding_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow service role to insert onboarding records (for signup trigger)
CREATE POLICY "Service role can insert onboarding records"
    ON onboarding_progress FOR INSERT
    WITH CHECK (true);

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View for onboarding statistics
CREATE OR REPLACE VIEW onboarding_stats AS
SELECT
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_completed = TRUE THEN 1 END) as completed_users,
    COUNT(CASE WHEN is_completed = FALSE THEN 1 END) as incomplete_users,
    ROUND(
        COUNT(CASE WHEN is_completed = TRUE THEN 1 END)::DECIMAL /
        NULLIF(COUNT(*), 0) * 100,
        2
    ) as completion_rate_percent,
    AVG(current_step) as avg_current_step,
    AVG(
        CASE
            WHEN is_completed = TRUE AND completed_at IS NOT NULL AND started_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (completed_at - started_at)) / 3600
        END
    ) as avg_completion_time_hours
FROM onboarding_progress;

-- View for detailed user onboarding progress
CREATE OR REPLACE VIEW user_onboarding_details AS
SELECT
    op.user_id,
    op.is_completed,
    op.current_step,
    op.total_steps,
    ROUND((
        (CASE WHEN step1_completed THEN 1 ELSE 0 END +
         CASE WHEN step2_completed THEN 1 ELSE 0 END +
         CASE WHEN step3_completed THEN 1 ELSE 0 END +
         CASE WHEN step4_completed THEN 1 ELSE 0 END +
         CASE WHEN step5_completed THEN 1 ELSE 0 END +
         CASE WHEN step6_completed THEN 1 ELSE 0 END)::DECIMAL / op.total_steps
    ) * 100, 0) as progress_percent,
    op.first_campaign_created,
    op.onboarding_type,
    op.entry_point,
    CASE
        WHEN op.completed_at IS NOT NULL AND op.started_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (op.completed_at - op.started_at)) / 3600
    END as completion_time_hours,
    op.last_interaction_at,
    op.started_at,
    op.completed_at
FROM onboarding_progress op;

-- ============================================
-- EXAMPLE QUERIES
-- ============================================

-- Get onboarding progress for current user
-- SELECT * FROM onboarding_progress WHERE user_id = auth.uid();

-- Mark step 1 as completed
-- SELECT mark_onboarding_step_completed(
--     auth.uid(),
--     1,
--     '{"website": "example.com", "businessCategory": "Retail"}'::jsonb
-- );

-- Update current step
-- UPDATE onboarding_progress
-- SET current_step = 3,
--     last_active_step = 3,
--     updated_at = NOW()
-- WHERE user_id = auth.uid();

-- Get completion percentage
-- SELECT
--     user_id,
--     ROUND((
--         (CASE WHEN step1_completed THEN 1 ELSE 0 END +
--          CASE WHEN step2_completed THEN 1 ELSE 0 END +
--          CASE WHEN step3_completed THEN 1 ELSE 0 END +
--          CASE WHEN step4_completed THEN 1 ELSE 0 END +
--          CASE WHEN step5_completed THEN 1 ELSE 0 END +
--          CASE WHEN step6_completed THEN 1 ELSE 0 END)::DECIMAL / total_steps
--     ) * 100, 0) as progress_percent
-- FROM onboarding_progress
-- WHERE user_id = auth.uid();

-- Mark onboarding as completed manually
-- UPDATE onboarding_progress
-- SET is_completed = TRUE,
--     completed_at = NOW(),
--     updated_at = NOW()
-- WHERE user_id = auth.uid();

-- Get users who haven't completed onboarding
-- SELECT * FROM onboarding_progress
-- WHERE is_completed = FALSE
-- AND last_interaction_at < NOW() - INTERVAL '7 days'
-- ORDER BY last_interaction_at DESC;

-- Get onboarding statistics
-- SELECT * FROM onboarding_stats;

-- Get detailed user onboarding info
-- SELECT * FROM user_onboarding_details WHERE user_id = auth.uid();
