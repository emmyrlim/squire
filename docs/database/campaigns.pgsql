-- This matches your existing schema
-- No need to re-run if you already have these tables

-- Campaigns table (already exists)
CREATE TABLE campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    setting VARCHAR(100), -- e.g., "Forgotten Realms", "Homebrew"
    created_by UUID REFERENCES user_profiles(id) NOT NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign membership (many-to-many relationship) - already exists
CREATE TABLE campaign_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('dm', 'player')),
    character_name VARCHAR(100),
    character_description TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, user_id)
);

-- Updated_at trigger for campaigns (if not already added)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies for your schema
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_users ENABLE ROW LEVEL SECURITY;

-- Campaign policies - users can view campaigns they're members of
CREATE POLICY "Users can view campaigns they belong to"
  ON campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_users cu
      INNER JOIN user_profiles up ON cu.user_id = up.id
      WHERE cu.campaign_id = campaigns.id
      AND up.auth_user_id = auth.uid()
    )
  );

-- Any authenticated user can create campaigns
CREATE POLICY "Authenticated users can create campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Only DMs can update campaigns
CREATE POLICY "DMs can update their campaigns"
  ON campaigns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaign_users cu
      INNER JOIN user_profiles up ON cu.user_id = up.id
      WHERE cu.campaign_id = campaigns.id
      AND up.auth_user_id = auth.uid()
      AND cu.role = 'dm'
    )
  );

-- Only DMs can delete campaigns
CREATE POLICY "DMs can delete their campaigns"
  ON campaigns FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaign_users cu
      INNER JOIN user_profiles up ON cu.user_id = up.id
      WHERE cu.campaign_id = campaigns.id
      AND up.auth_user_id = auth.uid()
      AND cu.role = 'dm'
    )
  );

-- Campaign_users policies - users can view their own memberships
CREATE POLICY "Users can view their own campaign memberships"
  ON campaign_users FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );

-- DMs can view all memberships for their campaigns
CREATE POLICY "DMs can view campaign memberships"
  ON campaign_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_users dm
      INNER JOIN user_profiles up ON dm.user_id = up.id
      WHERE dm.campaign_id = campaign_users.campaign_id
      AND up.auth_user_id = auth.uid()
      AND dm.role = 'dm'
    )
  );

-- Users can join campaigns (when invited)
CREATE POLICY "Users can join campaigns"
  ON campaign_users FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Users can leave campaigns they're in
CREATE POLICY "Users can leave campaigns"
  ON campaign_users FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );

-- DMs can remove users from their campaigns
CREATE POLICY "DMs can manage campaign membership"
  ON campaign_users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaign_users dm
      INNER JOIN user_profiles up ON dm.user_id = up.id
      WHERE dm.campaign_id = campaign_users.campaign_id
      AND up.auth_user_id = auth.uid()
      AND dm.role = 'dm'
    )
  );

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_invite_code ON campaigns(invite_code);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_campaign_users_user_id ON campaign_users(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_users_campaign_id ON campaign_users(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_users_role ON campaign_users(role);