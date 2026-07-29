-- 1. Profiles Table (extends Supabase auth.users)
CREATE TYPE user_role AS ENUM ('Super_Admin', 'Telecaller');

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile_number TEXT,
  role user_role DEFAULT 'Telecaller'::user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Leads Table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL, -- STRICTLY prevents duplicates globally
  client_name TEXT NOT NULL,
  status TEXT DEFAULT 'New',
  notes TEXT,
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Profiles: Users can read their own profile. Super Admins can read/manage all profiles.
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Super_Admin')
);

-- Leads: Telecallers can read ALL leads, but only Super Admins can delete. 
-- Everyone can insert/update.
CREATE POLICY "Everyone can read leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert leads" ON leads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update leads" ON leads FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete leads" ON leads FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Super_Admin')
);
