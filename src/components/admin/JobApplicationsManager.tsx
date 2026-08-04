import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

type ApplicationRow = {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  membership_number: string | null;
  message: string | null;
  cv_url: string | null;
  created_at: string;
};

type JobRow = { id: string; title: string; company: string };

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function formatStamp(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-GB", { timeZone: "Europe/London" });
}

export function JobApplicationsManager() {
  const [jobId, setJobId] = useState("all");
  const [search, setSearch] = useState("");

  const { data: jobs = [] } = useQuery({
    queryKey: ["admin-jobs-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, company")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as JobRow[];
    },
  });

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin-job-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id, job_id, full_name, email, phone, membership_number, message, cv_url, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ApplicationRow[];
    },
  });

  const jobById = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applications.filter((row) => {
      if (jobId !== "all" && row.job_id !== jobId) return false;
      if (!term) return true;
      return [row.full_name, row.email, row.phone, row.membership_number, row.message]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [applications, jobId, search]);

  const openCv = async (path: string) => {
    const { data, error } = await supabase.storage.from("job-cvs").createSignedUrl(path, 300);
    if (error || !data) {
      toast.error("Could not open that CV");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  };

  const exportCsv = () => {
    const header = [
      "Job title",
      "Company",
      "Applicant",
      "Email",
      "Phone",
      "Membership number",
      "Message",
      "CV file",
      "Submitted (London)",
      "Submitted (ISO)",
    ];
    const rows = filtered.map((row) => {
      const job = jobById.get(row.job_id);
      return [
        job?.title ?? "",
        job?.company ?? "",
        row.full_name,
        row.email,
        row.phone ?? "",
        row.membership_number ?? "",
        row.message ?? "",
        row.cv_url ?? "",
        formatStamp(row.created_at),
        row.created_at,
      ].map(csvCell).join(",");
    });
    const blob = new Blob([[header.map(csvCell).join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `job-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl">Job applications</h2>
        <p className="text-sm text-muted-foreground">
          Everyone who applied through the Jobs board, with their CV where provided.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="app-job">Advert</Label>
          <select
            id="app-job"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
          >
            <option value="all">All adverts</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} — {job.company}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="app-search">Search</Label>
          <Input
            id="app-search"
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
          {filtered.length} application{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading applications…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No applications yet for this selection.</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((row) => {
            const job = jobById.get(row.job_id);
            return (
              <Card key={row.id} className="border-border/70">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{row.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {job ? `${job.title} · ${job.company}` : "Advert removed"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatStamp(row.created_at)}</p>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <li>{row.email}</li>
                    {row.phone ? <li>{row.phone}</li> : null}
                    {row.membership_number ? <li>Membership: {row.membership_number}</li> : null}
                  </ul>
                  {row.message ? (
                    <p className="mt-3 text-sm text-foreground/85">{row.message}</p>
                  ) : null}
                  {row.cv_url ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4"
                      onClick={() => openCv(row.cv_url as string)}
                    >
                      <FileText /> View CV
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
