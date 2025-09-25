-- Database schema for Dental Loyalty App
-- Run this in your Supabase SQL editor

-- Create profiles table to extend auth.users
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT CHECK (role IN ('admin', 'client')) NOT NULL DEFAULT 'client',
    client_id UUID UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
    "clientId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    "totalSpent" DECIMAL(10,2) DEFAULT 0 CHECK ("totalSpent" >= 0),
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create points_adjustments table for audit trail
CREATE TABLE points_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clientId" UUID REFERENCES clients("clientId") ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create spending_records table for audit trail
CREATE TABLE spending_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clientId" UUID REFERENCES clients("clientId") ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_records ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can read all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Clients policies
CREATE POLICY "Admin can manage all clients" ON clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Client can read own data" ON clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'client' 
            AND client_id = clients."clientId"
        )
    );

CREATE POLICY "Client can update own phone" ON clients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'client' 
            AND client_id = clients."clientId"
        )
    )
    WITH CHECK (
        -- Only allow updating phone number
        clients.name = OLD.name 
        AND clients.points = OLD.points 
        AND clients."totalSpent" = OLD."totalSpent"
    );

-- Points adjustments policies
CREATE POLICY "Admin can manage points adjustments" ON points_adjustments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Spending records policies
CREATE POLICY "Admin can manage spending records" ON spending_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, role)
    VALUES (NEW.id, 'client');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert sample admin user (you'll need to create this user in Supabase Auth first)
-- Replace with your admin user ID after creating the user
-- INSERT INTO profiles (id, role) VALUES ('YOUR_ADMIN_USER_ID_HERE', 'admin');

-- Sample clients (optional)
INSERT INTO clients (name, "phoneNumber", points, "totalSpent") VALUES
    ('John Doe', '555-0101', 150, 750.00),
    ('Jane Smith', '555-0102', 89, 445.50),
    ('Bob Johnson', '555-0103', 220, 1100.00);