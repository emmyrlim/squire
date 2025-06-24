-- Squire D&D Campaign Tracker Database Schema
-- PostgreSQL with Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table (handled by Supabase Auth, but we'll create a profile table)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
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

-- Campaign membership (many-to-many relationship)
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

-- Sessions table
CREATE TABLE sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    session_number INTEGER NOT NULL,
    title VARCHAR(255),
    raw_summary TEXT NOT NULL,
    enhanced_summary TEXT,
    session_date DATE,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, session_number)
);

-- Locations table
CREATE TABLE locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_type VARCHAR(50), -- e.g., "city", "dungeon", "forest"
    parent_location_id UUID REFERENCES locations(id), -- For hierarchical locations
    discovered_in_session_id UUID REFERENCES sessions(id),
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NPCs table
CREATE TABLE npcs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    race VARCHAR(100),
    class VARCHAR(100),
    occupation VARCHAR(100),
    disposition VARCHAR(50), -- e.g., "friendly", "hostile", "neutral"
    location_id UUID REFERENCES locations(id), -- Where they're usually found
    met_in_session_id UUID REFERENCES sessions(id),
    is_alive BOOLEAN DEFAULT true,
    notes TEXT,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NPC Affiliations (organizations, factions, etc.)
CREATE TABLE npc_affiliations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    npc_id UUID REFERENCES npcs(id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    role_in_organization VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items table
CREATE TABLE items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    item_type VARCHAR(50), -- e.g., "weapon", "armor", "consumable", "treasure"
    rarity VARCHAR(20), -- e.g., "common", "uncommon", "rare", "very rare", "legendary"
    quantity INTEGER DEFAULT 1,
    value_gp INTEGER DEFAULT 0,
    owner_type VARCHAR(20) DEFAULT 'party' CHECK (owner_type IN ('party', 'player')),
    owner_id UUID REFERENCES user_profiles(id), -- NULL if party item
    acquired_in_session_id UUID REFERENCES sessions(id),
    is_equipped BOOLEAN DEFAULT false,
    notes TEXT,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item transaction log
CREATE TABLE item_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('added', 'removed', 'transferred', 'equipped', 'unequipped')),
    quantity_change INTEGER NOT NULL,
    from_user_id UUID REFERENCES user_profiles(id),
    to_user_id UUID REFERENCES user_profiles(id),
    reason TEXT,
    session_id UUID REFERENCES sessions(id),
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Party gold tracking
CREATE TABLE party_gold (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE UNIQUE,
    total_gold INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gold transaction log
CREATE TABLE gold_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'found', 'lost')),
    amount INTEGER NOT NULL,
    reason TEXT,
    session_id UUID REFERENCES sessions(id),
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quests table
CREATE TABLE quests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quest_type VARCHAR(20) DEFAULT 'side' CHECK (quest_type IN ('main', 'side', 'personal')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'paused')),
    progress_summary TEXT,
    next_steps TEXT,
    location_id UUID REFERENCES locations(id),
    quest_giver_npc_id UUID REFERENCES npcs(id),
    started_in_session_id UUID REFERENCES sessions(id),
    completed_in_session_id UUID REFERENCES sessions(id),
    reward_description TEXT,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quest events/progress tracking
CREATE TABLE quest_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id),
    event_description TEXT NOT NULL,
    event_order INTEGER NOT NULL,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monsters/Bestiary table
CREATE TABLE monsters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    creature_type VARCHAR(100), -- e.g., "humanoid", "beast", "undead"
    description TEXT,
    armor_class INTEGER,
    hit_points VARCHAR(50), -- e.g., "45 (7d8 + 14)"
    speed VARCHAR(100),
    challenge_rating VARCHAR(10),
    attacks_observed TEXT,
    special_abilities TEXT,
    encountered_in_session_id UUID REFERENCES sessions(id),
    location_encountered_id UUID REFERENCES locations(id),
    notes TEXT,
    is_defeated BOOLEAN DEFAULT false,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cross-references table for linking between entities
CREATE TABLE entity_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    source_entity_type VARCHAR(50) NOT NULL, -- e.g., "location", "npc", "quest"
    source_entity_id UUID NOT NULL,
    target_entity_type VARCHAR(50) NOT NULL,
    target_entity_id UUID NOT NULL,
    relationship_type VARCHAR(100), -- e.g., "located_in", "allies_with", "quest_giver"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_entity_type, source_entity_id, target_entity_type, target_entity_id)
);

-- AI suggestions table for tracking AI-generated suggestions
CREATE TABLE ai_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id),
    suggestion_type VARCHAR(50) NOT NULL, -- e.g., "npc", "location", "item", "quest"
    suggested_name VARCHAR(255),
    suggested_data JSONB,
    is_accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_campaign_users_campaign_id ON campaign_users(campaign_id);
CREATE INDEX idx_campaign_users_user_id ON campaign_users(user_id);
CREATE INDEX idx_sessions_campaign_id ON sessions(campaign_id);
CREATE INDEX idx_sessions_session_number ON sessions(campaign_id, session_number);
CREATE INDEX idx_locations_campaign_id ON locations(campaign_id);
CREATE INDEX idx_npcs_campaign_id ON npcs(campaign_id);
CREATE INDEX idx_items_campaign_id ON items(campaign_id);
CREATE INDEX idx_quests_campaign_id ON quests(campaign_id);
CREATE INDEX idx_monsters_campaign_id ON monsters(campaign_id);

-- Full-text search indexes
CREATE INDEX idx_locations_search ON locations USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_npcs_search ON npcs USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_items_search ON items USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_quests_search ON quests USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_monsters_search ON monsters USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_sessions_search ON sessions USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || raw_summary || ' ' || COALESCE(enhanced_summary, '')));

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_gold ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE monsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Campaign access is based on membership
CREATE POLICY "Campaign members can view campaigns" ON campaigns FOR SELECT USING (
    id IN (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create campaigns" ON campaigns FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Campaign creators can update campaigns" ON campaigns FOR UPDATE USING (created_by = auth.uid());

-- Campaign membership policies
CREATE POLICY "Campaign members can view membership" ON campaign_users FOR SELECT USING (
    campaign_id IN (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid())
);

CREATE POLICY "Users can join campaigns" ON campaign_users FOR INSERT WITH CHECK (user_id = auth.uid());

-- Content access based on campaign membership
CREATE POLICY "Campaign members can access sessions" ON sessions FOR ALL USING (
    campaign_id IN (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid())
);

CREATE POLICY "Campaign members can access locations" ON locations FOR ALL USING (
    campaign_id IN (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid())
);

CREATE POLICY "Campaign members can access npcs" ON npcs FOR ALL USING (
    campaign_id IN (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid())
);

CREATE POLICY "Campaign members can access items" ON items FOR ALL USING (
    campaign_id IN (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid())
);

CREATE POLICY "Campaign members can access quests" ON quests FOR ALL USING (
    campaign_id IN (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid())
);

CREATE POLICY "Campaign members can access monsters" ON monsters FOR ALL USING (
    campaign_id IN (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid())
);

-- Similar policies for transaction tables and other related tables
CREATE POLICY "Campaign members can access item transactions" ON item_transactions FOR ALL USING (
    campaign_id IN (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid())
);

CREATE POLICY "Campaign members can access gold data" ON party_gold FOR ALL USING (
    campaign_id IN (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid())
);

CREATE POLICY "Campaign members can access gold transactions" ON gold_transactions FOR ALL USING (
    campaign_id IN (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid())
);

CREATE POLICY "Campaign members can access quest events" ON quest_events FOR ALL USING (
    quest_id IN (SELECT id FROM quests WHERE campaign_id IN
        (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid()))
);

CREATE POLICY "Campaign members can access entity links" ON entity_links FOR ALL USING (
    campaign_id IN (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid())
);

CREATE POLICY "Campaign members can access ai suggestions" ON ai_suggestions FOR ALL USING (
    campaign_id IN (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid())
);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS
$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$
LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_npcs_updated_at BEFORE UPDATE ON npcs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monsters_updated_at BEFORE UPDATE ON monsters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update party gold when gold transactions are added
CREATE OR REPLACE FUNCTION update_party_gold()
RETURNS TRIGGER AS $
BEGIN
    INSERT INTO party_gold (campaign_id, total_gold)
    VALUES (NEW.campaign_id, NEW.amount)
    ON CONFLICT (campaign_id)
    DO UPDATE SET
        total_gold = party_gold.total_gold + NEW.amount,
        updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_party_gold_on_transaction
    AFTER INSERT ON gold_transactions
    FOR EACH ROW EXECUTE FUNCTION update_party_gold();

-- Initial data seeding function (optional)
CREATE OR REPLACE FUNCTION seed_campaign_data(campaign_uuid UUID)
RETURNS void AS $
BEGIN
    -- Initialize party gold at 0
    INSERT INTO party_gold (campaign_id, total_gold)
    VALUES (campaign_uuid, 0);
END;
$ language 'plpgsql';

-- Views for common queries
CREATE VIEW campaign_summary AS
SELECT
    c.id,
    c.name,
    c.description,
    c.setting,
    c.created_at,
    COUNT(DISTINCT cu.user_id) as member_count,
    COUNT(DISTINCT s.id) as session_count,
    MAX(s.session_number) as latest_session
FROM campaigns c
LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
LEFT JOIN sessions s ON c.id = s.campaign_id
GROUP BY c.id, c.name, c.description, c.setting, c.created_at;

CREATE VIEW active_quests AS
SELECT
    q.*,
    l.name as location_name,
    n.name as quest_giver_name
FROM quests q
LEFT JOIN locations l ON q.location_id = l.id
LEFT JOIN npcs n ON q.quest_giver_npc_id = n.id
WHERE q.status = 'active';

CREATE VIEW party_inventory_summary AS
SELECT
    i.campaign_id,
    i.owner_type,
    i.owner_id,
    up.username as owner_name,
    COUNT(*) as item_count,
    SUM(i.value_gp * i.quantity) as total_value
FROM items i
LEFT JOIN user_profiles up ON i.owner_id = up.id
GROUP BY i.campaign_id, i.owner_type, i.owner_id, up.username;