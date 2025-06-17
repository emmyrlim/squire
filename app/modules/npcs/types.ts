export interface NPC {
  id: string;
  campaignId: string;
  slug: string;
  name: string;
  description: string;
  race: string;
  class: string;
  occupation: string;
  disposition: string;
  location_id: string;
  met_in_session_id: string;
  is_alive: boolean;
  notes: string;
  created_at: string;
  created_by: string;
  updated_at: string;
}