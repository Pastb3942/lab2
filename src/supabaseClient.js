import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zutpuzpvvebhkogqyhbi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dHB1enB2dmViaGtvZ3F5aGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMzEzODAsImV4cCI6MjEwNTcwNzM4MH0.Q2b0MyQi6wB6R6HL747qr2xW1tmJ0WIsfMPTcwrlI9w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);