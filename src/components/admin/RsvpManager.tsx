import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { eventsQuery } from "@/lib/queries";

type RsvpRow = {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  membership_number: string | null;
  guests: number;
  status: string;
  note: string | null;
  created_at: string;
};

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function RsvpManager() {
  const { data: events = [] } = useQuery(eventsQuery);
  const [eventId, setEventId] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "going" | "interested">("all");
  const [search, setSearch] = useState("");

  const { data: rsvps = [], isLoading } = useQuery({
    queryKey: ["admin-rsvps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_rsvps")
        .select(
          "id, event_id, full_name, email, phone, membership_number, guests, status, note, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as RsvpRow[];
    },
  });

  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title ?? "Unknown event";

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rsvps.filter((row) => {
      if (eventId !== "all" && row.event_id !== eventId) return false;
      if (status !== "all" && row.status !== status) return false;
      if (!needle) return true;
      return [row.full_name, row.email, row.membership_number ?? "", row.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [rsvps, eventId, status, search]);

  const totals = filtered.reduce(
    (acc, row) => {
      acc.responses += 1;
      acc.attendees += 1 + row.guests;
      if (row.status === "going") acc.going += 1;
      else acc.interested += 1;
      return acc;
    },
    { responses: 0, attendees: 0, going: 0, interested: 0 },
  );

  function exportCsv() {
    const header = [
      "Event",
      "Name",
      "Email",
      "Phone",
      "Membership number",
      "Response",
      "Extra guests",
      "Note",
      "Submitted",
    ];
    const lines = [
      header.map(csvCell).join(","),
      ...filtered.map((row) =>
        [
          eventTitle(row.event_id),
          row.full_name,
          row.email,
          row.phone ?? "",
          row.membership_number ?? "",
          row.status,
          row.guests,
          row.note ?? "",
          new Date(row.created_at).toISOString(),
        ]
          .map(csvCell)
          .join(","),
      ),
    ];
    const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ccgms-rsvps-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl">RSVPs & interest</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every response submitted from the event popup. Filter by event or response, then export
          the list for catering and seating.
        </p>
      </div>

      <Card className="border-border/70">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="rsvp-filter-event">Event</Label>
            <select
              id="rsvp-filter-event"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            >
              <option value="all">All events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rsvp-filter-status">Response</Label>
            <select
              id="rsvp-filter-status"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">All responses</option>
              <option value="going">Going</option>
              <option value="interested">Interested</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rsvp-filter-search">Search</Label>
            <Input
              id="rsvp-filter-search"
              placeholder="Name, email or membership number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="soft"
              className="w-full"
              onClick={exportCsv}
              disabled={filtered.length === 0}
            >
              <Download /> Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Responses", value: totals.responses },
          { label: "Going", value: totals.going },
          { label: "Interested", value: totals.interested },
          { label: "Expected attendees", value: totals.attendees },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/70">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/70">
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading responses…</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No responses match these filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="border-b border-border bg-secondary/40 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Event</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Membership</th>
                    <th className="px-4 py-3 font-medium">Response</th>
                    <th className="px-4 py-3 font-medium">Guests</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3">{eventTitle(row.event_id)}</td>
                      <td className="px-4 py-3">
                        {row.full_name}
                        {row.note ? (
                          <span className="block text-xs text-muted-foreground">{row.note}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        {row.email}
                        {row.phone ? (
                          <span className="block text-xs text-muted-foreground">{row.phone}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{row.membership_number ?? "—"}</td>
                      <td className="px-4 py-3 capitalize">{row.status}</td>
                      <td className="px-4 py-3">{row.guests}</td>
                      <td className="px-4 py-3">
                        {new Date(row.created_at).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
