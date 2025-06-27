import { requireAuth } from "@/shared/utils/auth.server";
import { processTranscription } from "@/modules/ai/services/content-extraction";

export const action = async ({
  request,
  params,
}: {
  request: Request;
  params: { campaignId: string };
}) => {
  const { user, supabase } = await requireAuth(request);
  const { sessionId } = await request.json();

  // Call the main transcription service
  const result = await processTranscription({
    campaignId: params.campaignId,
    sessionId,
    user,
    supabase,
  });

  return Response.json(result);
};
