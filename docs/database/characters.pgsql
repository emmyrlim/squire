-- STEP 1: Create the new characters table
CREATE TABLE characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    class VARCHAR(50), -- e.g., "Fighter", "Wizard", "Rogue"
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 20),
    race VARCHAR(50), -- e.g., "Human", "Elf", "Dwarf"
    background VARCHAR(100), -- e.g., "Noble", "Criminal", "Acolyte"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- STEP 2: Create the new campaign_characters table (replaces campaign_users)
CREATE TABLE campaign_characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('dm', 'player')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true, -- Character can be inactive in campaign
    UNIQUE(campaign_id, character_id)
);

-- STEP 3: Add triggers for updated_at
CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- STEP 4: Create indexes for performance
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_is_active ON characters(is_active);
CREATE INDEX idx_campaign_characters_campaign_id ON campaign_characters(campaign_id);
CREATE INDEX idx_campaign_characters_character_id ON campaign_characters(character_id);
CREATE INDEX idx_campaign_characters_role ON campaign_characters(role);

-- STEP 5: Migrate data from campaign_users to new structure
-- First, create characters from existing campaign_users
INSERT INTO characters (user_id, name, description, is_active)
SELECT
    cu.user_id,
    COALESCE(cu.character_name, 'Unnamed Character') as name,
    cu.character_description as description,
    true as is_active
FROM campaign_users cu
WHERE cu.character_name IS NOT NULL;

-- Create default characters for users without character names
INSERT INTO characters (user_id, name, description, is_active)
SELECT DISTINCT
    cu.user_id,
    'Default Character' as name,
    'Migrated from campaign membership' as description,
    true as is_active
FROM campaign_users cu
WHERE cu.character_name IS NULL
AND cu.user_id NOT IN (SELECT user_id FROM characters);

-- STEP 6: Migrate campaign memberships
-- For users with character names, link to their new character
INSERT INTO campaign_characters (campaign_id, character_id, role, joined_at, is_active)
SELECT
    cu.campaign_id,
    c.id as character_id,
    cu.role,
    cu.joined_at,
    true as is_active
FROM campaign_users cu
INNER JOIN characters c ON cu.user_id = c.user_id
WHERE cu.character_name IS NOT NULL
AND c.name = COALESCE(cu.character_name, 'Unnamed Character');

-- For users without character names, link to their default character
INSERT INTO campaign_characters (campaign_id, character_id, role, joined_at, is_active)
SELECT
    cu.campaign_id,
    c.id as character_id,
    cu.role,
    cu.joined_at,
    true as is_active
FROM campaign_users cu
INNER JOIN characters c ON cu.user_id = c.user_id
WHERE cu.character_name IS NULL
AND c.name = 'Default Character';

-- STEP 7: Update the party_inventory_summary view
DROP VIEW IF EXISTS party_inventory_summary;

CREATE VIEW party_inventory_summary AS
SELECT
    i.campaign_id,
    i.owner_type,
    i.owner_id,
    CASE
        WHEN i.owner_type = 'character' THEN c.name
        WHEN i.owner_type = 'campaign' THEN 'Party Inventory'
        ELSE 'Unknown'
    END as owner_name,
    COUNT(*) as item_count,
    SUM(i.value_gp * i.quantity) as total_value
FROM items i
LEFT JOIN characters c ON i.owner_id = c.id AND i.owner_type = 'character'
GROUP BY i.campaign_id, i.owner_type, i.owner_id,
    CASE
        WHEN i.owner_type = 'character' THEN c.name
        WHEN i.owner_type = 'campaign' THEN 'Party Inventory'
        ELSE 'Unknown'
    END;

-- STEP 8: Add Row Level Security (RLS) policies
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_characters ENABLE ROW LEVEL SECURITY;

-- Characters policies - users can only see/edit their own characters
CREATE POLICY "Users can view their own characters"
    ON characters FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own characters"
    ON characters FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own characters"
    ON characters FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own characters"
    ON characters FOR DELETE
    USING (user_id = auth.uid());

-- Campaign_characters policies - users can view characters in campaigns they're part of
CREATE POLICY "Users can view campaign characters they belong to"
    ON campaign_characters FOR SELECT
    USING (
        character_id IN (
            SELECT id FROM characters WHERE user_id = auth.uid()
        )
        OR
        campaign_id IN (
            SELECT cc.campaign_id FROM campaign_characters cc
            INNER JOIN characters c ON cc.character_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

-- Users can join campaigns with their characters
CREATE POLICY "Users can join campaigns with their characters"
    ON campaign_characters FOR INSERT
    TO authenticated
    WITH CHECK (
        character_id IN (
            SELECT id FROM characters WHERE user_id = auth.uid()
        )
    );

-- Users can leave campaigns with their characters
CREATE POLICY "Users can leave campaigns with their characters"
    ON campaign_characters FOR DELETE
    USING (
        character_id IN (
            SELECT id FROM characters WHERE user_id = auth.uid()
        )
    );

-- DMs can manage campaign character memberships
CREATE POLICY "DMs can manage campaign characters"
    ON campaign_characters FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM campaign_characters cc
            INNER JOIN characters c ON cc.character_id = c.id
            WHERE cc.campaign_id = campaign_characters.campaign_id
            AND c.user_id = auth.uid()
            AND cc.role = 'dm'
        )
    );

-- STEP 9: Create a helper view for easier querying
CREATE VIEW campaign_memberships AS
SELECT
    cc.campaign_id,
    cc.character_id,
    c.user_id,
    c.name as character_name,
    c.class as character_class,
    c.level as character_level,
    cc.role,
    cc.joined_at,
    cc.is_active,
    camp.name as campaign_name
FROM campaign_characters cc
INNER JOIN characters c ON cc.character_id = c.id
INNER JOIN campaigns camp ON cc.campaign_id = camp.id
WHERE cc.is_active = true AND c.is_active = true;

-- STEP 10: Drop the old campaign_users table (ONLY after verifying migration worked)
-- DROP TABLE campaign_users; -- Uncomment this ONLY after verifying everything works

-- STEP 11: Remove username from user_profiles (ONLY after updating all dependencies)
-- ALTER TABLE user_profiles DROP COLUMN username; -- Uncomment ONLY after migration is complete