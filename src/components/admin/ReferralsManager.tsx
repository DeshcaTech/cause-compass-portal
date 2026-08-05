import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye } from "lucide-react";
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

type ReferralRow = {
  id: string;
  membership_number: string | null;
  referrer_name: string;
  referrer_email: string;
  referrer_phone: string | null;
  person_name: string;
  person_contact: string | null;
  support_type: string;
  details: string | null;
  consent: boolean;
  status: string;
  is_self: boolean;
  created_at: string;
};

const STATUSES = ["new", "in_progress", "closed"] as const;

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function formatStamp(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-GB", { timeZone: "Europe/London" });
}

function label(status: string) {
  return status.replace(/_/g, " ");
}

export function ReferralsManager() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [openRow, setOpenRow] = useState<ReferralRow | null>(null);

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select(
          "id, membership_number, referrer_name, referrer_email, referrer_phone, person_name, person_contact, support_type, details, consent, status, is_self, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReferralRow[];
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return referrals.filter((row) => {
      if (mode === "self" && !row.is_self) return false;
      if (mode === "other" && row.is_self) return false;
      if (status !== "all" && row.status !== status) return false;
      if (!term) return true;
      return [
        row.referrer_name,
        row.referrer_email,
        row.referrer_phone,
        row.person_name,
        row.person_contact,
        row.membership_number,
        row.support_type,
        row.details,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [referrals, mode, status, search]);

  const updateStatus = async (id: string, next: string) => {
    const { error } = await supabase.from("referrals").update({ status: next }).eq("id", id);
    if (error) {
      toast.error("Could not update that referral");
      return;
    }
    toast.success("Status updated");
    setOpenRow((current) => (current && current.id === id ? { ...current, status: next } : current));
    await queryClient.invalidateQueries({ queryKey: ["admin-referrals"] });
  };

  const exportCsv = () => {
    const header = [
      "Type",
      "Status",
      "Support needed",
      "Person",
      "Person contact",
      "Referrer",
      "Referrer email",
      "Referrer phone",
      "Membership number",
      "Details",
      "Consent",
      "Submitted (London)",
      "Submitted (ISO)",
    ];
    const rows = filtered.map((row) =>
      [
        row.is_self ? "Refer myself" : "Refer someone else",
        label(row.status),
        row.support_type,
        row.person_name,
        row.person_contact ?? "",
        row.referrer_name,
        row.referrer_email,
        row.referrer_phone ?? "",
        row.membership_number ?? "",
        row.details ?? "",
        row.consent ? "yes" : "no",
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
    link.download = `get-support-referrals-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl">Get Support referrals</h2>
        <p className="text-sm text-muted-foreground">
          Everyone who asked for support for themselves or referred someone else.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="ref-mode">Referral type</Label>
          <select
            id="ref-mode"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={mode}
            onChange={(event) => setMode(event.target.value)}
          >
            <option value="all">All referrals</option>
            <option value="self">Refer myself</option>
            <option value="other">Refer someone else</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ref-status">Status</Label>
          <select
            id="ref-status"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ref-search">Search</Label>
          <Input
            id="ref-search"
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
        <span className="text-sm text-muted-foreground">
          {filtered.length} referral{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading referrals…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No referrals for this selection.</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((row) => (
            <Card key={row.id} className="border-border/70">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{row.person_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {row.is_self ? "Refer myself" : `Referred by ${row.referrer_name}`} ·{" "}
                      {row.support_type}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatStamp(row.created_at)}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <select
                    aria-label={`Status for ${row.person_name}`}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm capitalize"
                    value={STATUSES.includes(row.status as (typeof STATUSES)[number]) ? row.status : "new"}
                    onChange={(event) => updateStatus(row.id, event.target.value)}
                  >
                    {STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </select>
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
                <DialogTitle>{openRow.person_name}</DialogTitle>
                <DialogDescription>
                  {openRow.is_self ? "Refer myself" : "Refer someone else"} ·{" "}
                  {formatStamp(openRow.created_at)}
                </DialogDescription>
              </DialogHeader>
              <dl className="space-y-3 text-sm">
                <Detail term="Support needed" value={openRow.support_type} />
                <Detail term="Status" value={label(openRow.status)} />
                <Detail term="Person contact" value={openRow.person_contact} />
                <Detail term="Referrer" value={openRow.referrer_name} />
                <Detail term="Referrer email" value={openRow.referrer_email} />
                <Detail term="Referrer phone" value={openRow.referrer_phone} />
                <Detail term="Membership number" value={openRow.membership_number} />
                <Detail term="Consent given" value={openRow.consent ? "Yes" : "No"} />
                <Detail term="Details" value={openRow.details} />
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
      <dd className="mt-0.5 whitespace-pre-wrap text-foreground/90 capitalize-none">
        {value && value.trim() ? value : "—"}
      </dd>
    </div>
  );
}