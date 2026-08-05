import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const AREA_LABELS: Record<string, string> = {
  user_roles: "Admin levels & roles",
  announcements: "News",
  events: "Events",
  board_members: "Board members",
  president_message: "President's message",
  village_groups: "Groups",
  partners: "Businesses",
  jobs: "Jobs",
  documents: "Documents",
  campaigns: "Campaigns",
  surveys: "Surveys",
  community_assets: "Community assets",
  galleries: "Galleries",
  site_settings: "Site content",
  brand_settings: "Branding",
};

const ACTION_LABELS: Record<string, string> = {
  create: "Created",
  update: "Edited",
  delete: "Deleted",
};

type Entry = {
  id: string;
  actor_email: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  summary: string | null;
  changed_fields: unknown;
  created_at: string;
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "empty";
  if (typeof value === "string") return value.length > 80 ? `${value.slice(0, 80)}…` : value;
  return JSON.stringify(value);
}

export function AuditLog() {
  const [area, setArea] = useState("all");
  const [search, setSearch] = useState("");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["audit-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("id, actor_email, action, table_name, record_id, summary, changed_fields, created_at")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return (data ?? []) as Entry[];
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter((entry) => {
      if (area !== "all" && entry.table_name !== area) return false;
      if (!term) return true;
      return `${entry.actor_email ?? ""} ${entry.summary ?? ""} ${entry.table_name}`
        .toLowerCase()
        .includes(term);
    });
  }, [entries, area, search]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl">Activity log</h2>
        <p className="text-sm text-muted-foreground">
          Who changed what and when — admin level changes and content edits across the site. The
          log is read-only and keeps the 300 most recent entries.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Area</Label>
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All areas</SelectItem>
              {Object.entries(AREA_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-search">Search</Label>
          <Input
            id="audit-search"
            placeholder="Person, item or area"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border/70">
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading activity…</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border/70">
              {filtered.map((entry) => {
                const changes = (entry.changed_fields ?? {}) as Record<
                  string,
                  { from: unknown; to: unknown }
                >;
                const changedKeys = Object.keys(changes);
                return (
                  <li key={entry.id} className="space-y-2 p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium">
                        {ACTION_LABELS[entry.action] ?? entry.action}{" "}
                        {AREA_LABELS[entry.table_name] ?? entry.table_name}
                        {entry.summary ? ` — ${entry.summary}` : ""}
                      </p>
                      <time
                        className="text-sm text-muted-foreground"
                        dateTime={entry.created_at}
                      >
                        {new Date(entry.created_at).toLocaleString("en-GB")}
                      </time>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      By {entry.actor_email ?? "system / unknown"}
                    </p>
                    {changedKeys.length > 0 ? (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {changedKeys.slice(0, 6).map((key) => (
                          <li key={key}>
                            <span className="text-foreground">{key.replace(/_/g, " ")}</span>:{" "}
                            {formatValue(changes[key]?.from)} → {formatValue(changes[key]?.to)}
                          </li>
                        ))}
                        {changedKeys.length > 6 ? (
                          <li>+{changedKeys.length - 6} more field(s)</li>
                        ) : null}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}