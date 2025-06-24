export interface Session {
  id: string;
  campaign_id: string;
  session_number: number;
  title?: string;
  raw_summary: string;
  enhanced_summary?: string;
  session_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  slug: string;
}
