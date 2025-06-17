export interface Monster {
  id: string;
  name: string;
  description: string;
  creature_type: string;
  armor_class: number;
  hit_points: string;
  speed: string;
  challenge_rating: string;
  attacks_observed: string;
  special_abilities: string;
  encountered_in_session_id: string;
  location_encountered_id: string;
  notes: string;
  is_defeated: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
