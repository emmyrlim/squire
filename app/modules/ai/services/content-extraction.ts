import { SupabaseClient, User } from "@supabase/supabase-js";
import { getSessionMessages } from "@/modules/sessions/services/session-messages";
import {
  getDetailItems,
  filterDetailItemsByTranscript,
  updateOrCreateDetailItemsAndRelationships,
} from "@/modules/detail-items/services/detail-items-api";
import { callLLM } from "~/shared/utils/ai-client";
import { DetailItem } from "~/modules/detail-items/types";
import { Character } from "~/modules/characters/types";

export const processTranscription = async ({
  campaignId,
  sessionId,
  user,
  supabase,
}: {
  campaignId: string;
  sessionId: string;
  user: User;
  supabase: SupabaseClient;
}) => {
  // 1. Aggregate transcript
  const messages = await getSessionMessages(sessionId, supabase);
  const transcript = messages.map((m) => m.message_content).join(" ");

  // 2. Get all Detail Items for campaign
  const detailItems = await getDetailItems(campaignId, supabase, {
    search: "",
    category: "All",
    sort: "created_at",
    order: "desc",
  });

  // 3. Filter relevant Detail Items
  const relevantItems = filterDetailItemsByTranscript(detailItems, transcript);

  console.log("relevantItems", relevantItems);

  // 4. Construct LLM prompt
  const prompt = buildTranscribePrompt(relevantItems, transcript, [
    {
      name: "Traxex",
      id: "1",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  // 5. Call LLM
  const llmResult = await callLLM(prompt);

  // 6. Parse and process LLM output
  // const { entities, relationships, player_characters } = JSON.parse(llmResult);

  console.log("llmResult", llmResult);

  // // 7. Update/create Detail Items and relationships
  // await updateOrCreateDetailItemsAndRelationships({
  //   campaignSlug,
  //   entities,
  //   relationships,
  //   user,
  //   supabase,
  // });

  return { status: "success", entities: [], relationships: [] };

  // // 8. Return result/status
  // return { status: "success", entities, relationships };
};

// Helper to build the LLM prompt
function buildTranscribePrompt(
  existingItems: DetailItem[],
  transcript: string,
  playerCharacters: Character[]
) {
  return `
You are an expert D&D session chronicler. Your job is to extract and organize key campaign knowledge from the following session transcript.
Below is a list of existing campaign entities ("Detail Items"). When extracting new information, match it to an existing entity if appropriate (by name, description, or context). Only create a new entity if no suitable match exists.
For each entity, provide:
Category: One of [NPC, Location, Monster, Quest, Mystery, Magical Item]
Name
Description (synthesize a single, up-to-date description if updating an existing entity)
Any relevant metadata (e.g., stats for monsters, properties for items, relationships, etc.)
If matching an existing entity, include its ID.
Also, identify relationships between entities (e.g., "NPC X is located in Location Y", "Quest Z is given by NPC X").
Output a JSON object with 3 arrays:
"entities": List of extracted entities, each with category, name, description, metadata, and (if matched) existing ID.
"relationships": List of relationships, each with source entity, target entity, type, and description.
"player_characters": List of player characters, each with name, description, and metadata.
Be concise but thorough. Only include information that is explicit or strongly implied in the transcript.
Existing Detail Items:
${JSON.stringify(existingItems, null, 2)}
Transcript:
"""
${transcript}
"""
Current Player Characters:
${JSON.stringify(playerCharacters, null, 2)}
"""
  `;
}
