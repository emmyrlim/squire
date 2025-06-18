import { useLoaderData, useActionData, Form } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";
import { Button } from "~/shared/components/ui/button-old";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, user } = await requireAuth(request);
  const campaignSlug = params.campaignSlug;

  if (!campaignSlug) {
    throw new Response("Campaign Slug is required", { status: 400 });
  }

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select(
      `
      *,
      campaign_users!inner (
        role
      )
    `
    )
    .eq("slug", campaignSlug)
    .eq("campaign_users.user_id", user.id)
    .single();

  if (error) {
    console.error("Error:", error);
    throw new Response(`Failed to load campaign: ${error.message}`, {
      status: 500,
    });
  }

  if (!campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  // Check if user is DM
  const isDM = campaign.campaign_users[0]?.role === "dm";

  if (!isDM) {
    throw new Response("Only the DM can access campaign settings", {
      status: 403,
    });
  }

  return { campaign };
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = await requireAuth(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "regenerate-invite-code") {
    const campaignId = formData.get("campaign_id");

    if (!campaignId) {
      return Response.json(
        { error: "Campaign ID is required", success: null },
        { status: 400 }
      );
    }

    // Regenerate invite code
    const { data, error } = await supabase.rpc(
      "regenerate_campaign_invite_code",
      {
        campaign_id: campaignId,
      }
    );

    if (error) {
      console.error("Error regenerating invite code:", error);
      return Response.json(
        { error: "Failed to regenerate invite code", success: null },
        { status: 500 }
      );
    }

    return Response.json({
      success: "Invite code regenerated successfully",
      error: null,
      inviteCode: data[0].invite_code,
    });
  }

  return Response.json(
    { error: "Invalid action", success: null },
    { status: 400 }
  );
}

export default function CampaignSettings() {
  const { campaign } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaign Settings</h1>
        <p className="text-muted-foreground">
          Manage your campaign settings and invite players
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite Players</CardTitle>
          <CardDescription>
            Share this invite code with players to let them join your campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="invite-code">Invite Code</Label>
                <Input
                  id="invite-code"
                  value={actionData?.inviteCode || campaign.invite_code}
                  readOnly
                />
              </div>
              <Form method="post">
                <input type="hidden" name="campaign_id" value={campaign.id} />
                <input
                  type="hidden"
                  name="intent"
                  value="regenerate-invite-code"
                />
                <Button type="submit" variant="outline">
                  Regenerate
                </Button>
              </Form>
            </div>

            {actionData?.success && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{actionData.success}</AlertDescription>
              </Alert>
            )}

            {actionData?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{actionData.error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
