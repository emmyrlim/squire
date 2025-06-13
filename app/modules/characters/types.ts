export interface Character {
  id: string;
  name: string;
  description?: string;
  class?: string;
  level?: number;
  race?: string;
  background?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
