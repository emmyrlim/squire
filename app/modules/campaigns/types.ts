import type { Character } from "@/characters/types";

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  setting: string | null;
  created_by: string;
  invite_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  characters: Character[];
}
