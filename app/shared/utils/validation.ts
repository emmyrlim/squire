import { z } from "zod";

export const CampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(255),
  description: z.string().optional(),
  setting: z.string().optional(),
});

export const SessionSchema = z.object({
  title: z.string().optional(),
  raw_summary: z.string().min(1, "Session summary is required"),
  session_date: z.string().optional(),
});

export const LocationSchema = z.object({
  name: z.string().min(1, "Location name is required").max(255),
  description: z.string().optional(),
  location_type: z.string().optional(),
  parent_location_id: z.string().uuid().optional(),
});

export const NPCSchema = z.object({
  name: z.string().min(1, "NPC name is required").max(255),
  description: z.string().optional(),
  race: z.string().optional(),
  class: z.string().optional(),
  occupation: z.string().optional(),
  disposition: z.enum(["friendly", "neutral", "hostile", "unknown"]).optional(),
  location_id: z.string().uuid().optional(),
  is_alive: z.boolean().optional(),
  notes: z.string().optional(),
});
