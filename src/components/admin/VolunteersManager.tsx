import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

type VolunteerRow = {
  id: string;
  membership_number: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  areas: string[] | null;
  availability: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function formatStamp(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-GB", { timeZone: "Europe/London" });
}

/** "Sat: Morning, Afternoon; Sun: Evening" -> readable multi-line summary. */
function availabilitySummary(value: string | null) {
  if (!value || !value.trim()) return "Not provided";
  return value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n");
}

export function VolunteersManager() {
  const [area, setArea] = useState("all");
  const [search, setSearch] = useState("");
  const [openRow, setOpenRow] = useState<VolunteerRow | null>(null);
  const [exporting, setExporting] = useState(false);

  const { data: volunteers = [], isLoading } = useQuery({
    queryKey: ["admin-volunteers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("volunteer_applications")
        .select(
          "id, membership_number, full_name, email, phone, areas, availability, message, status, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as VolunteerRow[];
    },
  });

  const areaOptions = useMemo(() => {
    const set = new Set<string>();
    volunteers.forEach((row) => (row.areas ?? []).forEach((a) => set.add(a)));
    return Array.from(set).sort();
  }, [volunteers]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return volunteers.filter((row) => {
      if (area !== "all" && !(row.areas ?? []).includes(area)) return false;
      if (!term) return true;
      return [
        row.full_name,
        row.email,
        row.phone,
        row.membership_number,
        row.availability,
        row.message,
        (row.areas ?? []).join(" "),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [volunteers, area, search]);

  const stamp = () => new Date().toISOString().slice(0, 10);

  const exportCsv = () => {
    const header = [
      "Name",
      "Email",
      "Phone",
      "Membership number",
      "Areas",
      "Availability summary",
      "Message",
      "Status",
      "Submitted (London)",
      "Submitted (ISO)",
    ];
    const rows = filtered.map((row) =>
      [
        row.full_name,
        row.email,
        row.phone ?? "",
        row.membership_number ?? "",
        (row.areas ?? []).join("; "),
        row.availability ?? "",
        row.message ?? "",
        row.status,
        formatStamp(row.created_at),
        row.created_at,
      ]
        .map(csvCell)
        .join(","),
    );
    const blob = new Blob([[header.map(csvCell).join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `volunteer-applications-${stamp()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      const [{ jsPDF }, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const autoTable = autoTableModule.default;
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

      doc.setFontSize(18);
      doc.text("Volunteer applications", 40, 50);
      doc.setFontSize(10);
      doc.text(
        `${area === "all" ? "All areas" : area} · ${filtered.length} application${filtered.length === 1 ? "" : "s"} · generated ${new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}`,
        40,
        68,
      );

      autoTable(doc, {
        startY: 88,
        head: [["Name", "Email", "Phone", "Membership", "Areas", "Availability", "Submitted"]],
        body: filtered.map((row) => [
          row.full_name,
          row.email,
          row.phone ?? "—",
          row.membership_number ?? "—",
          (row.areas ?? []).join(", ") || "—",
          availabilitySummary(row.availability),
          formatStamp(row.created_at),
        ]),
        styles: { fontSize: 8, cellPadding: 4, valign: "top", overflow: "linebreak" },
        headStyles: { fillColor: [16, 88, 66], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 130 },
          2: { cellWidth: 70 },
          3: { cellWidth: 70 },
          4: { cellWidth: 150 },
          5: { cellWidth: 160 },
          6: { cellWidth: 90 },
        },
      });

      doc.save(`volunteer-applications-${stamp()}.pdf`);
    } catch {
      toast.error("Could not build the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl">Volunteer applications</h2>
        <p className="text-sm text-muted-foreground">
          Everyone who offered to help, with the days and times they are available.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="vol-area">Area of help</Label>
          <select
            id="vol-area"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={area}
            onChange={(event) => setArea(event.target.value)}
          >
            <option value="all">All areas</option>
            {areaOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="vol-search">Search</Label>
          <Input
            id="vol-search"
            placeholder="Name, email, phone, membership number…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant="soft" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download /> Export CSV
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={exportPdf}
          disabled={filtered.length === 0 || exporting}
        >
          <FileText /> {exporting ? "Building PDF…" : "Export PDF"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {filtered.length} application{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading volunteers…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No volunteer applications for this selection.</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((row) => (
            <Card key={row.id} className="border-border/70">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{row.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(row.areas ?? []).join(", ") || "No areas chosen"}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatStamp(row.created_at)}</p>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                  {availabilitySummary(row.availability)}
                </p>
                <div className="mt-4">
                  <Button size="sm" variant="outline" onClick={() => setOpenRow(row)}>
                    <Eye /> View details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openRow !== null} onOpenChange={(open) => !open && setOpenRow(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {openRow ? (
            <>
              <DialogHeader>
                <DialogTitle>{openRow.full_name}</DialogTitle>
                <DialogDescription>{formatStamp(openRow.created_at)}</DialogDescription>
              </DialogHeader>
              <dl className="space-y-3 text-sm">
                <Detail term="Email" value={openRow.email} />
                <Detail term="Phone" value={openRow.phone} />
                <Detail term="Membership number" value={openRow.membership_number} />
                <Detail term="Areas" value={(openRow.areas ?? []).join(", ")} />
                <Detail term="Availability" value={availabilitySummary(openRow.availability)} />
                <Detail term="Message" value={openRow.message} />
                <Detail term="Status" value={openRow.status} />
              </dl>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ term, value }: { term: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{term}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-foreground/90">
        {value && value.trim() ? value : "—"}
      </dd>
    </div>
  );
}
