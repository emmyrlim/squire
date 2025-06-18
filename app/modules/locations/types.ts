export interface Location {
  id: string;
  campaign_id: string;
  slug: string;
  name: string;
  description?: string;
  parent_location_id?: string;
  discovered_in_session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LocationWithRelations extends Location {
  parent_location?: Location;
  discovered_in_session?: {
    id: string;
    session_number: number;
  };
  sub_locations?: Location[];
}
