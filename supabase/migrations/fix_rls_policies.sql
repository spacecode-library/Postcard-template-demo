-- ================================================================
-- FIX RLS POLICIES FOR CUSTOMERS AND PAYMENT_METHODS TABLES
-- ================================================================
-- This migration fixes 406 errors by adding proper RLS policies
-- Run this in Supabase SQL Editor or via migrations
-- ================================================================

-- ================================================================
-- CUSTOMERS TABLE POLICIES
-- ================================================================

-- Drop existing policies if they exist (cleanup)
DROP POLICY IF EXISTS "Users can view their own customer record" ON customers;
DROP POLICY IF EXISTS "Users can insert their own customer record" ON customers;
DROP POLICY IF EXISTS "Users can update their own customer record" ON customers;
DROP POLICY IF EXISTS "Edge Functions can manage customers" ON customers;

-- Policy 1: Allow users to view their own customer record
CREATE POLICY "Users can view their own customer record"
ON customers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Allow users to insert their own customer record
CREATE POLICY "Users can insert their own customer record"
ON customers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Allow users to update their own customer record
CREATE POLICY "Users can update their own customer record"
ON customers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow service role (Edge Functions) to manage all customers
-- This is needed for Edge Functions to create/update customers
CREATE POLICY "Service role can manage customers"
ON customers FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ================================================================
-- PAYMENT_METHODS TABLE POLICIES
-- ================================================================

-- Drop existing policies if they exist (cleanup)
DROP POLICY IF EXISTS "Users can view their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can insert their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can update their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can delete their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Edge Functions can manage payment methods" ON payment_methods;

-- Policy 1: Allow users to view their own payment methods
CREATE POLICY "Users can view their own payment methods"
ON payment_methods FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = payment_methods.customer_id
    AND customers.user_id = auth.uid()
  )
);

-- Policy 2: Allow users to insert their own payment methods
CREATE POLICY "Users can insert their own payment methods"
ON payment_methods FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = payment_methods.customer_id
    AND customers.user_id = auth.uid()
  )
);

-- Policy 3: Allow users to update their own payment methods
CREATE POLICY "Users can update their own payment methods"
ON payment_methods FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = payment_methods.customer_id
    AND customers.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = payment_methods.customer_id
    AND customers.user_id = auth.uid()
  )
);

-- Policy 4: Allow users to delete their own payment methods
CREATE POLICY "Users can delete their own payment methods"
ON payment_methods FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = payment_methods.customer_id
    AND customers.user_id = auth.uid()
  )
);

-- Policy 5: Allow service role (Edge Functions) to manage all payment methods
CREATE POLICY "Service role can manage payment methods"
ON payment_methods FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ================================================================
-- VERIFY RLS IS ENABLED
-- ================================================================

-- Ensure RLS is enabled on both tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- VERIFICATION QUERIES (Run these to test)
-- ================================================================

-- Test 1: Check if policies were created
-- SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('customers', 'payment_methods')
-- ORDER BY tablename, policyname;

-- Test 2: Check if RLS is enabled
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE tablename IN ('customers', 'payment_methods');

-- ================================================================
-- NOTES
-- ================================================================
-- After running this migration:
-- 1. Users can query their own customer records (fixes 406 errors)
-- 2. Users can view/manage their own payment methods
-- 3. Edge Functions can create/update customers and payment methods
-- 4. All operations are properly secured via RLS
-- ================================================================
