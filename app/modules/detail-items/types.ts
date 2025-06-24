export interface DetailItem {
  id: string;
  campaign_id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  metadata: Record<string, string> | null;
  source_session_id: string | null;
  ai_confidence: number | null;
  is_ai_generated: boolean | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}
