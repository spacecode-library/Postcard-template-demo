-- Create validated_zipcodes table for caching Melissa API validation results
-- This table caches zip code validation results for 30 days to reduce API costs

CREATE TABLE IF NOT EXISTS validated_zipcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code VARCHAR(10) NOT NULL UNIQUE,
  is_valid BOOLEAN NOT NULL DEFAULT false,
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  melissa_data JSONB,  -- Store additional data from Melissa API
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookup by zip_code
CREATE INDEX IF NOT EXISTS idx_validated_zipcodes_zip
ON validated_zipcodes(zip_code);

-- Create index for cleanup of old validations
CREATE INDEX IF NOT EXISTS idx_validated_zipcodes_validated_at
ON validated_zipcodes(validated_at);

-- Add RLS policies
ALTER TABLE validated_zipcodes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read validated zip codes
CREATE POLICY "Allow authenticated users to read validated zip codes"
ON validated_zipcodes
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow all authenticated users to insert/update validated zip codes
CREATE POLICY "Allow authenticated users to insert validated zip codes"
ON validated_zipcodes
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update validated zip codes"
ON validated_zipcodes
FOR UPDATE
TO authenticated
USING (true);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_validated_zipcodes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_validated_zipcodes_timestamp
BEFORE UPDATE ON validated_zipcodes
FOR EACH ROW
EXECUTE FUNCTION update_validated_zipcodes_updated_at();

-- Create function to clean up old validations (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_zip_validations()
RETURNS void AS $$
BEGIN
  DELETE FROM validated_zipcodes
  WHERE validated_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up old validations daily
-- Note: This requires pg_cron extension to be enabled in Supabase
-- Run this in Supabase SQL Editor if you have pg_cron enabled:
-- SELECT cron.schedule(
--   'cleanup-old-zip-validations',
--   '0 2 * * *',  -- Run at 2 AM daily
--   $$SELECT cleanup_old_zip_validations()$$
-- );

COMMENT ON TABLE validated_zipcodes IS 'Caches zip code validation results from Melissa API for 30 days';
COMMENT ON COLUMN validated_zipcodes.zip_code IS 'The zip code that was validated';
COMMENT ON COLUMN validated_zipcodes.is_valid IS 'Whether the zip code is valid according to Melissa API';
COMMENT ON COLUMN validated_zipcodes.validated_at IS 'When this zip code was last validated';
COMMENT ON COLUMN validated_zipcodes.melissa_data IS 'Additional data returned from Melissa API (optional)';
