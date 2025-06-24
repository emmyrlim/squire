CREATE TABLE detail_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
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
  CONSTRAINT detail_items_pkey PRIMARY KEY (id),
  CONSTRAINT detail_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT detail_items_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT detail_items_source_session_id_fkey FOREIGN KEY (source_session_id) REFERENCES public.sessions(id)
);