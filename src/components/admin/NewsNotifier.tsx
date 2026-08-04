import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Send, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { notifySubscribers } from "@/lib/news.functions";

type Row = {
  id: string;
  title: string;
  published_at: string;
  is_published: boolean;
  notified_at: string | null;
};

export function NewsNotifier() {
  const queryClient = useQueryClient();
  const notify = useServerFn(notifySubscribers);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: subscriberCount = 0 } = useQuery({
    queryKey: ["news_subscriber_count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("news_subscribers")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  });

  const { data: items = [] } = useQuery({
    queryKey: ["news_notify_list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, published_at, is_published, notified_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(10);
      if (error) throw new Error(error.message);
      return (data ?? []) as Row[];
    },
  });

  async function send(item: Row) {
    setBusyId(item.id);
    try {
      const result = await notify({ data: { id: item.id } });
      toast.success(`Sent to ${result.sent} subscriber${result.sent === 1 ? "" : "s"}`, {
        description: result.skipped ? `${result.skipped} skipped or suppressed.` : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["news_notify_list"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send notifications.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="mb-8 border-border/70">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" />
          {subscriberCount} active news subscriber{subscriberCount === 1 ? "" : "s"}
        </div>
        <h3 className="mt-3 text-lg">Email subscribers about a published item</h3>
        <div className="mt-4 space-y-2">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">Publish a news item to notify subscribers.</p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 px-4 py-3"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.notified_at
                    ? `Notified ${new Date(item.notified_at).toLocaleString("en-GB")}`
                    : "Not notified yet"}
                </p>
              </div>
              <Button
                size="sm"
                variant={item.notified_at ? "outline" : "default"}
                disabled={busyId === item.id || subscriberCount === 0}
                onClick={() => send(item)}
              >
                <Send className="size-4" />
                {busyId === item.id ? "Sending…" : item.notified_at ? "Resend" : "Notify"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
