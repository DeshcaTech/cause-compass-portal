import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type EventRow = {
  id: string;
  event_name: string;
  page_path: string | null;
  created_at: string;
};

function formatStamp(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-GB", { timeZone: "Europe/London" });
}

function since(days: number) {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

export function EngagementManager() {
  const { data: events = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-analytics-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("id, event_name, page_path, created_at")
        .eq("event_name", "whatsapp_us_click")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw new Error(error.message);
      return (data ?? []) as EventRow[];
    },
  });

  const stats = useMemo(() => {
    const ts = events.map((e) => new Date(e.created_at).getTime());
    return {
      total: events.length,
      last7: ts.filter((t) => t >= since(7)).length,
      last30: ts.filter((t) => t >= since(30)).length,
    };
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">WhatsApp Us engagement</h2>
          <p className="text-sm text-muted-foreground">
            Every click on the “WhatsApp Us” button on the contact page.
          </p>
        </div>
        <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCw className="mr-2 size-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total clicks", value: stats.total },
          { label: "Last 7 days", value: stats.last7 },
          { label: "Last 30 days", value: stats.last30 },
        ].map((card) => (
          <Card key={card.label} className="border-border/70">
            <CardContent className="flex items-center gap-4 p-6">
              <MessageCircle className="size-8 text-primary" />
              <div>
                <p className="text-2xl font-semibold">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/70">
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : events.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No clicks recorded yet.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-4 px-6 py-3 text-sm">
                  <span>{formatStamp(event.created_at)}</span>
                  <span className="text-muted-foreground">{event.page_path ?? "—"}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
