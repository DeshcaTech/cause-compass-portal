import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { campaignsQuery } from "@/lib/queries";
import { sendCampaignStatusUpdate } from "@/lib/campaign-status.functions";

/** Lets fundraising managers email every donor the final result of a closed campaign. */
export function CampaignStatusNotifier() {
  const { data: campaigns = [] } = useQuery(campaignsQuery);
  const send = useServerFn(sendCampaignStatusUpdate);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const past = campaigns.filter((c) => c.status === "past");

  async function onSend(id: string) {
    setBusy(id);
    try {
      const note = notes[id]?.trim();
      const result = await send({ data: { campaign_id: id, ...(note ? { note } : {}) } });
      toast.success(`Status sent to ${result.sent} of ${result.recipients} supporters.`);
    } catch {
      toast.error("The status update could not be sent.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-10">
      <h3 className="text-lg">Campaign status updates</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        When a campaign is marked past, email every donor the final total.
      </p>
      {past.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No closed campaigns yet.</p>
      ) : (
        <div className="mt-4 grid gap-4">
          {past.map((campaign) => (
            <Card key={campaign.id} className="border-border/70">
              <CardContent className="space-y-3 p-5">
                <div>
                  <p className="font-semibold">{campaign.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Raised {campaign.raised_amount} of {campaign.goal_amount}
                  </p>
                </div>
                <Textarea
                  rows={2}
                  maxLength={1000}
                  placeholder="Optional message for supporters"
                  value={notes[campaign.id] ?? ""}
                  onChange={(event) =>
                    setNotes((prev) => ({ ...prev, [campaign.id]: event.target.value }))
                  }
                />
                <Button
                  type="button"
                  onClick={() => onSend(campaign.id)}
                  disabled={busy === campaign.id}
                >
                  {busy === campaign.id ? "Sending…" : "Send status to donors"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}