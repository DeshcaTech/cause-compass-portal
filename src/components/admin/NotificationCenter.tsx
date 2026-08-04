import { useEffect, useState } from "react";
import { Bell, BellOff, CheckCheck, ExternalLink, PartyPopper, TrendingDown, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  clearNotifications,
  markAllRead,
  markRead,
  readNotifications,
  subscribeNotifications,
  type StoredNotification,
} from "@/lib/notifications";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationCenter({
  onOpenCampaign,
}: {
  /** Called with the campaign id when an alert is opened as a deep link. */
  onOpenCampaign?: (campaignId: string) => void;
}) {
  const [items, setItems] = useState<StoredNotification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    const sync = () => setItems(readNotifications());
    sync();
    return subscribeNotifications(sync);
  }, []);

  const unread = items.filter((n) => !n.read);
  const visible = filter === "unread" ? unread : items;

  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" /> Notification centre
          {unread.length > 0 && <Badge variant="destructive">{unread.length} unread</Badge>}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            disabled={!unread.length}
            className="gap-1"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearNotifications}
            disabled={!items.length}
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <BellOff className="h-4 w-4" />
            {items.length ? "No unread alerts." : "No milestone alerts recorded yet."}
          </p>
        ) : (
          <ScrollArea className="max-h-96 pr-3">
            <ul className="space-y-2">
              {visible.map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start gap-2 rounded-lg border p-3 ${
                    n.read ? "border-border/60 bg-muted/30" : "border-primary/40 bg-primary/5"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      markRead(n.id);
                      onOpenCampaign?.(n.campaignId);
                    }}
                    aria-label={`Open ${n.campaignName} drilldown`}
                    className="flex min-w-0 flex-1 items-start gap-3 rounded-md p-1 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="mt-0.5">
                      {n.kind === "milestone" ? (
                        <PartyPopper className="h-4 w-4 text-primary" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 text-sm font-medium">
                        {n.title}
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                      <span className="block text-sm text-muted-foreground">{n.body}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {formatWhen(n.firstSeen)}
                      </span>
                    </span>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markRead(n.id, !n.read)}
                    aria-label={n.read ? `Mark ${n.title} unread` : `Mark ${n.title} read`}
                  >
                    {n.read ? "Unread" : "Mark read"}
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}