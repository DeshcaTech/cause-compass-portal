import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Banknote, Briefcase, CalendarClock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { FilterPage, FilterSelect } from "@/components/site/FilterPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobsQuery, type Job } from "@/lib/queries";
import { submitJobApplication } from "@/lib/jobs.functions";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Jobs — Opportunities Shared by the CCGMs Community" },
      {
        name: "description",
        content:
          "Browse job openings, apprenticeships and opportunities shared by CCGMs members and partner businesses.",
      },
      { property: "og:title", content: "Jobs — Opportunities Shared by the CCGMs Community" },
      { property: "og:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { name: "twitter:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      {
        property: "og:description",
        content: "Job openings and opportunities shared within the CCGMs community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JobsPage,
});

const ALL = "all";

const isExpired = (job: Job) => {
  if (!job.closes_at) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${job.closes_at}T00:00:00`) < today;
};

function JobsPage() {
  const t = useT();
  const { data: allJobs = [] } = useQuery(jobsQuery);
  const jobs = useMemo(() => allJobs.filter((job) => !isExpired(job)), [allJobs]);
  const [selected, setSelected] = useState<Job | null>(null);
  const [applyFor, setApplyFor] = useState<Job | null>(null);
  const [category, setCategory] = useState(ALL);
  const [location, setLocation] = useState(ALL);
  const [jobType, setJobType] = useState(ALL);

  const filtered = useMemo(
    () =>
      jobs.filter(
        (job) =>
          (category === ALL || job.category === category) &&
          (location === ALL || (job.location ?? "") === location) &&
          (jobType === ALL || job.job_type === jobType),
      ),
    [jobs, category, location, jobType],
  );

  // Options reflect the other active filters so dropdowns never offer empty results.
  const options = useMemo(() => {
    const match = (job: Job, skip: "category" | "location" | "jobType") =>
      (skip === "category" || category === ALL || job.category === category) &&
      (skip === "location" || location === ALL || (job.location ?? "") === location) &&
      (skip === "jobType" || jobType === ALL || job.job_type === jobType);
    const uniq = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort();
    return {
      categories: uniq(jobs.filter((j) => match(j, "category")).map((j) => j.category)),
      locations: uniq(jobs.filter((j) => match(j, "location")).map((j) => j.location ?? "")),
      jobTypes: uniq(jobs.filter((j) => match(j, "jobType")).map((j) => j.job_type)),
    };
  }, [jobs, category, location, jobType]);

  const hasFilters = category !== ALL || location !== ALL || jobType !== ALL;

  const allCategories = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.category).filter(Boolean))).sort(),
    [jobs],
  );

  return (
    <>
      <PageHeader
        eyebrow={t("Partners")}
        title={t("Jobs")}
        description={t("Opportunities shared by our members and partner businesses. Click a role to see full details.")}
      />
      <FilterPage
        filters={(
          <>
            <FilterSelect
              label={t("Category")}
              value={category}
              onChange={setCategory}
              options={[
                { value: ALL, label: t("All categories"), meta: `${jobs.length} ${t("roles")}` },
                ...allCategories.map((item) => ({
                  value: item,
                  label: item,
                  meta: `${jobs.filter((job) => job.category === item).length} ${t("roles")}`,
                })),
              ]}
            />
            <FilterSelect
              label={t("Location")}
              value={location}
              onChange={setLocation}
              options={[
                { value: ALL, label: t("All locations") },
                ...options.locations.map((item) => ({ value: item, label: item })),
              ]}
            />
            <FilterSelect
              label={t("Job type")}
              value={jobType}
              onChange={setJobType}
              options={[
                { value: ALL, label: t("All job types") },
                ...options.jobTypes.map((item) => ({ value: item, label: item })),
              ]}
            />
          </>
        )}
      >
        {hasFilters ? (
          <button
            type="button"
            className="mt-3 text-sm text-muted-foreground underline underline-offset-4"
            onClick={() => {
              setCategory(ALL);
              setLocation(ALL);
              setJobType(ALL);
            }}
          >
            {t("Clear filters")}
          </button>
        ) : null}

        {filtered.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            {t("No job adverts at the moment. Please check back soon.")}
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {filtered.map((job) => (
              <Card
                key={job.id}
                onClick={() => setSelected(job)}
                className="cursor-pointer border-border/70 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
              >
                <CardContent className="p-6">
                  <h3 className="text-lg">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">{job.job_type}</Badge>
                    <Badge variant="secondary">{job.category}</Badge>
                    {job.location ? <Badge variant="secondary">{job.location}</Badge> : null}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{job.short_description}</p>
                  {job.closes_at ? (
                    <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarClock className="size-3.5" /> {t("Closing date")}:{" "}
                      {new Date(job.closes_at).toLocaleDateString()}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </FilterPage>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{selected.category}</Badge>
                <Badge variant="outline">{selected.job_type}</Badge>
              </div>
              <p className="text-sm text-foreground/85">{selected.description}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Briefcase className="size-4" /> {selected.company}
                </li>
                {selected.location ? (
                  <li className="flex items-center gap-2">
                    <MapPin className="size-4" /> {selected.location}
                  </li>
                ) : null}
                {selected.salary_range ? (
                  <li className="flex items-center gap-2">
                    <Banknote className="size-4" /> {selected.salary_range}
                  </li>
                ) : null}
                {selected.closes_at ? (
                  <li className="flex items-center gap-2">
                    <CalendarClock className="size-4" /> {t("Closing date")}:{" "}
                    {new Date(selected.closes_at).toLocaleDateString()}
                  </li>
                ) : null}
                {selected.contact_email ? (
                  <li className="flex items-center gap-2">
                    <Mail className="size-4" />
                    <a className="underline underline-offset-4" href={`mailto:${selected.contact_email}`}>
                      {selected.contact_email}
                    </a>
                  </li>
                ) : null}
                {selected.contact_phone ? (
                  <li className="flex items-center gap-2">
                    <Phone className="size-4" />
                    <a className="underline underline-offset-4" href={`tel:${selected.contact_phone}`}>
                      {selected.contact_phone}
                    </a>
                  </li>
                ) : null}
              </ul>
              <Button
                variant="hero"
                className="w-full"
                onClick={() => {
                  setApplyFor(selected);
                  setSelected(null);
                }}
              >
                <ExternalLink /> {t("Apply now")}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ApplyDialog job={applyFor} onClose={() => setApplyFor(null)} />
    </>
  );
}

function ApplyDialog({ job, onClose }: { job: Job | null; onClose: () => void }) {
  const t = useT();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    membership_number: "",
    message: "",
  });
  const [saving, setSaving] = useState(false);
  const [cv, setCv] = useState<File | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!job) return;
    setSaving(true);
    try {
      let cvPath = "";
      if (cv) {
        if (cv.size > 5 * 1024 * 1024) throw new Error(t("Your CV must be smaller than 5 MB"));
        const ext = cv.name.split(".").pop()?.toLowerCase() ?? "pdf";
        cvPath = `${job.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("job-cvs").upload(cvPath, cv, {
          contentType: cv.type || "application/octet-stream",
        });
        if (error) throw new Error(t("We could not upload your CV. Please try again."));
      }
      const result = await submitJobApplication({
        data: { job_id: job.id, ...form, cv_url: cvPath },
      });
      toast.success(t("Your details have been sent to the employer."));
      setForm({ full_name: "", email: "", phone: "", membership_number: "", message: "" });
      setCv(null);
      onClose();
      if (result.whatsappUrl) window.open(result.whatsappUrl, "_blank", "noopener");
      if (result.applyUrl) window.open(result.applyUrl, "_blank", "noopener");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("Something went wrong"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!job} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("Apply")}: {job?.title}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label htmlFor="job-name">{t("Full name")}</Label>
            <Input
              id="job-name"
              required
              maxLength={120}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job-email">{t("Email")}</Label>
            <Input
              id="job-email"
              type="email"
              required
              maxLength={255}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="job-phone">{t("Phone (optional)")}</Label>
              <Input
                id="job-phone"
                maxLength={30}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="job-membership">{t("Membership number (optional)")}</Label>
              <Input
                id="job-membership"
                maxLength={40}
                value={form.membership_number}
                onChange={(e) => setForm({ ...form, membership_number: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job-cv">{t("Upload your CV (optional, PDF or Word, max 5 MB)")}</Label>
            <Input
              id="job-cv"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setCv(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job-message">{t("Message (optional)")}</Label>
            <Textarea
              id="job-message"
              rows={4}
              maxLength={2000}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={saving}>
            {saving ? t("Sending…") : t("Send and continue")}
          </Button>
          {job?.apply_url ? (
            <p className="text-xs text-muted-foreground">
              {t("We will email the employer and then open their application page.")}
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
