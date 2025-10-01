import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient("https://cbombaxhlvproggupdrn.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib21iYXhobHZwcm9nZ3VwZHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDc5NjEsImV4cCI6MjA3MjQyMzk2MX0.UdaHtnCevQWuDzeXFoCj2MtGf2y6HtRTuwEQdOqfEWk")