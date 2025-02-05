# Supabase

## Supabase Schema

The database structure needed for storing XRP Ledger data given the XRPLedgeDashboard.tsx component, we need to store:

Account Information:

- Standby accounts
- Operational accounts
- Associated balances
- Seeds (though these should be handled carefully for security)

AMM Assets Information:

- Asset pairs
- Currency details
- Issuer information
- Amounts

The SQL structure to create the Supabase database is as follows:

### Create Tables

```sql
-- First, create an encryption_keys table to store user-specific encryption keys
CREATE TABLE encryption_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    key_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Modify the user_accounts table to include ledger instance and encrypted seed
CREATE TABLE user_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    account_type TEXT CHECK (account_type IN ('standby', 'operational')),
    ledger_instance TEXT CHECK (ledger_instance IN ('testnet', 'devnet')),
    account_address TEXT NOT NULL,
    encrypted_seed TEXT,  -- Will store AES encrypted seed
    balance TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- AMM assets table remains mostly the same but adds ledger_instance
CREATE TABLE amm_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    ledger_instance TEXT CHECK (ledger_instance IN ('testnet', 'devnet')),
    asset_pair_name TEXT,
    asset1_currency TEXT NOT NULL,
    asset1_issuer TEXT,
    asset1_amount TEXT,
    asset2_currency TEXT NOT NULL,
    asset2_issuer TEXT,
    asset2_amount TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add RLS policies for encryption_keys
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own encryption key"
ON encryption_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own encryption key"
ON encryption_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Keep existing RLS policies for user_accounts and amm_assets
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE amm_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for user_accounts
CREATE POLICY "Users can view their own accounts"
ON user_accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
ON user_accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
ON user_accounts FOR UPDATE
USING (auth.uid() = user_id);

-- Create policies for amm_assets
CREATE POLICY "Users can view their own AMM assets"
ON amm_assets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AMM assets"
ON amm_assets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AMM assets"
ON amm_assets FOR UPDATE
USING (auth.uid() = user_id);
```

Steps to implement this in your Supabase project:

- Open the Supabase dashboard
- Go to the SQL editor
- Create a new snippet (query)
- Paste the SQL above and run it
- Verify the tables were created in the Table Editor

After setting up these tables, we can modify the XRPLedgeDashboard component to:

- Save account information when new accounts are created
- Load existing accounts when the component mounts
- Store AMM asset configurations
- Track historical changes
