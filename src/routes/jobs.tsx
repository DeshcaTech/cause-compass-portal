import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Banknote, Briefcase, CalendarClock, ExternalLink, MapPin } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { jobsQuery, type Job } from "@/lib/queries";
import businessFallback from "@/assets/business-fallback.jpg";
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

function JobsPage() {
  const t = useT();
  const { data: jobs = [] } = useQuery(jobsQuery);
  const [selected, setSelected] = useState<Job | null>(null);
  const [category, setCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(jobs.map((j) => j.category)))];
  const filtered = category === "All" ? jobs : jobs.filter((j) => j.category === category);

  return (
    <>
      <PageHeader
        eyebrow={t("Partners")}
        title={t("Jobs")}
        description={t("Opportunities shared by our members and partner businesses. Click a role to see full details.")}
      />
      <section className="container-page py-14">
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                category === item
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              {item === "All" ? t("All") : item}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            {t("No job adverts at the moment. Please check back soon.")}
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((job) => (
              <Card
                key={job.id}
                onClick={() => setSelected(job)}
                className="cursor-pointer border-border/70 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
              >
                <CardContent className="p-6">
                  <img
                    src={job.image_url ?? businessFallback}
                    alt={job.title}
                    loading="lazy"
                    className="mb-4 aspect-[16/9] w-full rounded-xl object-cover"
                  />
                  <h2 className="mt-4 text-lg">{job.title}</h2>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">{job.category}</Badge>
                    <Badge variant="outline">{job.job_type}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{job.short_description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4">
              <img
                src={selected.image_url ?? businessFallback}
                alt={selected.title}
                className="aspect-[16/9] w-full rounded-xl object-cover"
              />
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
              </ul>
              {selected.apply_url ? (
                <Button asChild variant="hero" className="w-full">
                  <a href={selected.apply_url} target="_blank" rel="noreferrer">
                    <ExternalLink /> {t("Apply now")}
                  </a>
                </Button>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}