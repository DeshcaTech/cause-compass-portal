import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getEventRsvpReport } from "@/lib/rsvp-report.functions";
import { downloadRsvpPdf } from "@/lib/rsvp-pdf";

export const Route = createFileRoute("/rsvp-report/$eventId")({
  validateSearch: (search: Record<string, unknown>) => ({ k: String(search['k'] ?? "") }),
  head: () => ({
    meta: [
      { title: "Event RSVP report | CCGMs" },
      {
        name: "description",
        content: "Private RSVP status report for a CCGMs event, with PDF export and cover sheet.",
      },
      { property: "og:title", content: "Event RSVP report | CCGMs" },
      {
        property: "og:description",
        content: "Private RSVP status report for a CCGMs event contact.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RsvpReportPage,
});

function stamp(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-GB", { timeZone: "Europe/London" });
}

function RsvpReportPage() {
  const { eventId } = Route.useParams();
  const { k } = Route.useSearch();
  const [managerName, setManagerName] = useState("");
  const [organisation, setOrganisation] = useState("Cameroonian Community of Greater Manchester");
  const [note, setNote] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["rsvp-report", eventId, k],
    queryFn: () => getEventRsvpReport({ data: { eventId, signature: k } }),
    enabled: Boolean(k),
  });

  if (!k) {
    return <p className="p-10 text-center text-sm text-muted-foreground">Missing report link code.</p>;
  }
  if (isLoading) {
    return <p className="p-10 text-center text-sm text-muted-foreground">Loading report…</p>;
  }
  if (error || !data) {
    return (
      <p className="p-10 text-center text-sm text-muted-foreground">
        This report link is not valid or has expired.
      </p>
    );
  }

  const rsvps = data.rsvps;
  const going = rsvps.filter((r) => r.status === "going").length;
  const totals = {
    responses: rsvps.length,
    going,
    interested: rsvps.length - going,
    attendees: rsvps.reduce((sum, r) => sum + 1 + (r.guests ?? 0), 0),
  };

  async function exportPdf(withCover: boolean) {
    if (!data) return;
    await downloadRsvpPdf({
      title: `RSVPs — ${data.event.title}`,
      filterSummary: `Event: ${data.event.title}   |   ${stamp(data.event.start_at)}   |   ${
        data.event.location ?? "No location"
      }`,
      totals,
      generatedAt: stamp(new Date().toISOString()),
      coverSheet: withCover ? { managerName, organisation, note } : null,
      fileName: `ccgms-rsvps-${data.event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`,
      rows: rsvps.map((row) => ({
        eventTitle: data.event.title,
        eventDate: stamp(data.event.start_at),
        fullName: row.full_name,
        email: row.email,
        phone: row.phone ?? "",
        membership: row.membership_number ?? "",
        status: row.status,
        guests: row.guests ?? 0,
        note: row.note ?? "",
        submitted: stamp(row.created_at),
        updated: stamp(row.updated_at),
      })),
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Event RSVP report</p>
        <h1 className="mt-2 text-3xl">{data.event.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {stamp(data.event.start_at)}
          {data.event.location ? ` · ${data.event.location}` : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Responses", value: totals.responses },
          { label: "Going", value: totals.going },
          { label: "Interested", value: totals.interested },
          { label: "Expected attendees", value: totals.attendees },
        ].map((s) => (
          <Card key={s.label} className="border-border/70">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/70">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cover-manager">Event manager name</Label>
            <Input
              id="cover-manager"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cover-org">Organisation</Label>
            <Input
              id="cover-org"
              value={organisation}
              onChange={(e) => setOrganisation(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cover-note">Cover note</Label>
            <Textarea id="cover-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button onClick={() => void exportPdf(true)}>
              <FileText /> PDF with cover sheet
            </Button>
            <Button variant="outline" onClick={() => void exportPdf(false)}>
              PDF without cover sheet
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="p-0">
          {rsvps.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No responses yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-border bg-secondary/40 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Membership</th>
                    <th className="px-4 py-3 font-medium">Response</th>
                    <th className="px-4 py-3 font-medium">Guests</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((row) => (
                    <tr key={row.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3">{row.full_name}</td>
                      <td className="px-4 py-3">
                        {row.email}
                        {row.phone ? (
                          <span className="block text-xs text-muted-foreground">{row.phone}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{row.membership_number ?? "—"}</td>
                      <td className="px-4 py-3 capitalize">{row.status}</td>
                      <td className="px-4 py-3">{row.guests}</td>
                      <td className="px-4 py-3">{stamp(row.created_at)}</td>
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