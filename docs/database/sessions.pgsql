-- Real-time collaborative session logging
CREATE TABLE session_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    message_content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'action', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_session_messages_session_id ON session_messages(session_id);
CREATE INDEX idx_session_messages_created_at ON session_messages(session_id, created_at);

ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;

-- Policy for reading messages
CREATE POLICY "Users can read messages from their sessions"
ON session_messages
FOR SELECT
USING (
  session_id IN (
    SELECT id
    FROM sessions
    WHERE campaign_id IN (
      SELECT campaign_id
      FROM campaign_users
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy for inserting messages
CREATE POLICY "Authenticated users can insert messages"
ON session_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

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
    slug VARCHAR(255),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('active', 'completed', 'processing')),
    participant_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, session_number)
);

-- CREATE TABLE public.sessions (
--   id uuid NOT NULL DEFAULT uuid_generate_v4(),
--   campaign_id uuid,
--   session_number integer NOT NULL,
--   title character varying,
--   raw_summary text NOT NULL,
--   enhanced_summary text,
--   session_date date,
--   created_by uuid,
--   created_at timestamp with time zone DEFAULT now(),
--   updated_at timestamp with time zone DEFAULT now(),
--   slug character varying,
--   status character varying DEFAULT 'completed'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'completed'::character varying, 'processing'::character varying]::text[])),
--   participant_count integer DEFAULT 0,
--   last_activity_at timestamp with time zone DEFAULT now(),
--   CONSTRAINT sessions_pkey PRIMARY KEY (id),
--   CONSTRAINT sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
--   CONSTRAINT sessions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id)
-- );

CREATE POLICY "Campaign members can access sessions" ON sessions FOR ALL USING (
    campaign_id IN (SELECT campaign_id FROM campaign_users WHERE user_id = auth.uid())
);