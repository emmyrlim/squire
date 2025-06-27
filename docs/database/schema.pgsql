-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ai_processing_jobs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying]::text[])),
  result_data jsonb,
  error_message text,
  processing_started_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT ai_processing_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT ai_processing_jobs_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);
CREATE TABLE public.ai_suggestions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  session_id uuid,
  suggestion_type character varying NOT NULL,
  suggested_name character varying,
  suggested_data jsonb,
  is_accepted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_suggestions_pkey PRIMARY KEY (id),
  CONSTRAINT ai_suggestions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT ai_suggestions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);
CREATE TABLE public.campaign_characters (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  character_id uuid,
  joined_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT campaign_characters_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_characters_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT campaign_characters_character_id_fkey FOREIGN KEY (character_id) REFERENCES public.characters(id)
);
CREATE TABLE public.campaign_users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  user_id uuid,
  role character varying DEFAULT 'player'::character varying CHECK (role::text = ANY (ARRAY['dm'::character varying, 'player'::character varying]::text[])),
  character_name character varying,
  character_description text,
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campaign_users_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_users_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT campaign_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.campaigns (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  description text,
  setting character varying,
  created_by uuid NOT NULL,
  invite_code character varying NOT NULL DEFAULT substr(md5((random())::text), 1, 8) UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  slug character varying,
  CONSTRAINT campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.characters (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  name character varying NOT NULL,
  description text,
  class character varying,
  level integer DEFAULT 1 CHECK (level >= 1 AND level <= 20),
  race character varying,
  background character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT characters_pkey PRIMARY KEY (id),
  CONSTRAINT characters_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.detail_item_relationships (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  source_item_id uuid,
  target_item_id uuid,
  relationship_type character varying NOT NULL,
  description text,
  ai_confidence numeric DEFAULT 1.0,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT detail_item_relationships_pkey PRIMARY KEY (id),
  CONSTRAINT detail_item_relationships_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT detail_item_relationships_source_item_id_fkey FOREIGN KEY (source_item_id) REFERENCES public.detail_items(id),
  CONSTRAINT detail_item_relationships_target_item_id_fkey FOREIGN KEY (target_item_id) REFERENCES public.detail_items(id),
  CONSTRAINT detail_item_relationships_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.detail_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid NOT NULL,
  slug character varying NOT NULL,
  name character varying NOT NULL,
  category character varying NOT NULL CHECK (category::text = ANY (ARRAY['npc'::character varying, 'location'::character varying, 'monster'::character varying, 'quest'::character varying, 'mystery'::character varying, 'magical_item'::character varying]::text[])),
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  source_session_id uuid,
  ai_confidence numeric DEFAULT 1.0,
  is_ai_generated boolean DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  search_vector tsvector,
  embedding USER-DEFINED,
  CONSTRAINT detail_items_pkey PRIMARY KEY (id),
  CONSTRAINT detail_items_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT detail_items_source_session_id_fkey FOREIGN KEY (source_session_id) REFERENCES public.sessions(id),
  CONSTRAINT detail_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.entity_links (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  source_entity_type character varying NOT NULL,
  source_entity_id uuid NOT NULL,
  target_entity_type character varying NOT NULL,
  target_entity_id uuid NOT NULL,
  relationship_type character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT entity_links_pkey PRIMARY KEY (id),
  CONSTRAINT entity_links_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id)
);
CREATE TABLE public.gold_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  transaction_type character varying NOT NULL CHECK (transaction_type::text = ANY (ARRAY['earned'::character varying, 'spent'::character varying, 'found'::character varying, 'lost'::character varying]::text[])),
  amount integer NOT NULL,
  reason text,
  session_id uuid,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gold_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT gold_transactions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT gold_transactions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id),
  CONSTRAINT gold_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.item_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  item_id uuid,
  transaction_type character varying NOT NULL CHECK (transaction_type::text = ANY (ARRAY['added'::character varying, 'removed'::character varying, 'transferred'::character varying, 'equipped'::character varying, 'unequipped'::character varying]::text[])),
  quantity_change integer NOT NULL,
  from_user_id uuid,
  to_user_id uuid,
  reason text,
  session_id uuid,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT item_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT item_transactions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT item_transactions_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id),
  CONSTRAINT item_transactions_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.user_profiles(id),
  CONSTRAINT item_transactions_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES public.user_profiles(id),
  CONSTRAINT item_transactions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id),
  CONSTRAINT item_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  name character varying NOT NULL,
  description text,
  item_type character varying,
  rarity character varying,
  quantity integer DEFAULT 1,
  value_gp integer DEFAULT 0,
  owner_type character varying DEFAULT 'party'::character varying CHECK (owner_type::text = ANY (ARRAY['party'::character varying, 'player'::character varying]::text[])),
  owner_id uuid,
  acquired_in_session_id uuid,
  is_equipped boolean DEFAULT false,
  notes text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT items_pkey PRIMARY KEY (id),
  CONSTRAINT items_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT items_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.user_profiles(id),
  CONSTRAINT items_acquired_in_session_id_fkey FOREIGN KEY (acquired_in_session_id) REFERENCES public.sessions(id),
  CONSTRAINT items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.locations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  name character varying NOT NULL,
  description text,
  location_type character varying,
  parent_location_id uuid,
  discovered_in_session_id uuid,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  slug character varying,
  CONSTRAINT locations_pkey PRIMARY KEY (id),
  CONSTRAINT locations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT locations_parent_location_id_fkey FOREIGN KEY (parent_location_id) REFERENCES public.locations(id),
  CONSTRAINT locations_discovered_in_session_id_fkey FOREIGN KEY (discovered_in_session_id) REFERENCES public.sessions(id),
  CONSTRAINT locations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.monsters (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  name character varying NOT NULL,
  creature_type character varying,
  description text,
  armor_class integer,
  hit_points character varying,
  speed character varying,
  challenge_rating character varying,
  attacks_observed text,
  special_abilities text,
  encountered_in_session_id uuid,
  location_encountered_id uuid,
  notes text,
  is_defeated boolean DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT monsters_pkey PRIMARY KEY (id),
  CONSTRAINT monsters_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT monsters_encountered_in_session_id_fkey FOREIGN KEY (encountered_in_session_id) REFERENCES public.sessions(id),
  CONSTRAINT monsters_location_encountered_id_fkey FOREIGN KEY (location_encountered_id) REFERENCES public.locations(id),
  CONSTRAINT monsters_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.npc_affiliations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  npc_id uuid,
  organization_name character varying NOT NULL,
  role_in_organization character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT npc_affiliations_pkey PRIMARY KEY (id),
  CONSTRAINT npc_affiliations_npc_id_fkey FOREIGN KEY (npc_id) REFERENCES public.npcs(id)
);
CREATE TABLE public.npcs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  name character varying NOT NULL,
  description text,
  race character varying,
  class character varying,
  occupation character varying,
  disposition character varying,
  location_id uuid,
  met_in_session_id uuid,
  is_alive boolean DEFAULT true,
  notes text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  slug character varying,
  CONSTRAINT npcs_pkey PRIMARY KEY (id),
  CONSTRAINT npcs_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT npcs_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT npcs_met_in_session_id_fkey FOREIGN KEY (met_in_session_id) REFERENCES public.sessions(id),
  CONSTRAINT npcs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.party_gold (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid UNIQUE,
  total_gold integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT party_gold_pkey PRIMARY KEY (id),
  CONSTRAINT party_gold_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id)
);
CREATE TABLE public.quest_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quest_id uuid,
  session_id uuid,
  event_description text NOT NULL,
  event_order integer NOT NULL,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quest_events_pkey PRIMARY KEY (id),
  CONSTRAINT quest_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT quest_events_quest_id_fkey FOREIGN KEY (quest_id) REFERENCES public.quests(id),
  CONSTRAINT quest_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);
CREATE TABLE public.quests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  title character varying NOT NULL,
  description text,
  quest_type character varying DEFAULT 'side'::character varying CHECK (quest_type::text = ANY (ARRAY['main'::character varying, 'side'::character varying, 'personal'::character varying]::text[])),
  status character varying DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'completed'::character varying, 'failed'::character varying, 'paused'::character varying]::text[])),
  progress_summary text,
  next_steps text,
  location_id uuid,
  quest_giver_npc_id uuid,
  started_in_session_id uuid,
  completed_in_session_id uuid,
  reward_description text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  slug character varying,
  CONSTRAINT quests_pkey PRIMARY KEY (id),
  CONSTRAINT quests_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT quests_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT quests_quest_giver_npc_id_fkey FOREIGN KEY (quest_giver_npc_id) REFERENCES public.npcs(id),
  CONSTRAINT quests_started_in_session_id_fkey FOREIGN KEY (started_in_session_id) REFERENCES public.sessions(id),
  CONSTRAINT quests_completed_in_session_id_fkey FOREIGN KEY (completed_in_session_id) REFERENCES public.sessions(id),
  CONSTRAINT quests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.session_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid,
  user_id uuid,
  message_content text NOT NULL,
  message_type character varying DEFAULT 'text'::character varying CHECK (message_type::text = ANY (ARRAY['text'::character varying, 'action'::character varying, 'system'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT session_messages_pkey PRIMARY KEY (id),
  CONSTRAINT session_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id),
  CONSTRAINT session_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  session_number integer NOT NULL,
  title character varying,
  raw_summary text NOT NULL,
  enhanced_summary text,
  session_date date,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  slug character varying NOT NULL,
  status character varying DEFAULT 'completed'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'completed'::character varying, 'processing'::character varying]::text[])),
  participant_count integer DEFAULT 0,
  last_activity_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  display_name character varying,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);