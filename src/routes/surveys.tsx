import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { FilterPage, FilterSelect } from "@/components/site/FilterPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { formatDateShort, surveysQuery, surveyStatus, type Survey } from "@/lib/queries";
import surveyFallback from "@/assets/survey-fallback.jpg";
import { useT } from "@/lib/i18n";
import { searchString, useSearchFilter } from "@/lib/use-search-filter";

export const Route = createFileRoute("/surveys")({
  validateSearch: (search: Record<string, unknown>): { view?: string | undefined; survey?: string | undefined } => ({
    view: searchString(search, "view"),
    survey: searchString(search, "survey"),
  }),
  head: () => ({
    meta: [
      { title: "Surveys — Have Your Say at CCGMs" },
      {
        name: "description",
        content:
          "Take part in active CCGMs surveys and help shape events, welfare priorities and community programmes.",
      },
      { property: "og:title", content: "Surveys — Have Your Say at CCGMs" },
      { property: "og:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { name: "twitter:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { property: "og:description", content: "Answer active surveys and shape community decisions." },
    ],
  }),
  component: SurveysPage,
});

type SurveysSearch = {
  view?: string | undefined;
  survey?: string | undefined;
};

function SurveyForm({ survey, onClose }: { survey: Survey; onClose: () => void }) {
  const t = useT();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [membership, setMembership] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const unanswered = survey.questions.filter((q) => !answers[q.id]?.trim());
    if (unanswered.length > 0) {
      toast.error(t("Please answer every question"));
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("survey_responses").insert({
      survey_id: survey.id,
      answers,
      membership_number: membership.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error(t("Your response could not be saved. Please try again."));
      return;
    }
    setDone(true);
    toast.success(t("Thank you — your response has been recorded."));
  }

  if (done) {
    return (
      <div className="space-y-4 rounded-xl border border-primary/40 bg-accent px-4 py-6 text-center">
        <CheckCircle2 className="mx-auto size-10 text-primary" aria-hidden />
        <h3 className="text-lg">{t("Response recorded")}</h3>
        <p className="text-sm text-muted-foreground">
          {t('Thank you for helping shape "{title}".').replace("{title}", survey.title)}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("Your answers have been saved. You can close this window and browse the other surveys.")}
        </p>
        <Button type="button" variant="hero" className="w-full" onClick={onClose}>
          {t("Close and back to surveys")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor={`m-${survey.id}`}>
          {t("Membership number (Recommend)")}
        </Label>
        <Input
          id={`m-${survey.id}`}
          value={membership}
          onChange={(e) => setMembership(e.target.value)}
          placeholder="CCGM-1000"
          maxLength={30}
        />
      </div>

      {survey.questions.map((question) => (
        <div key={question.id} className="space-y-2">
          <Label>{question.label}</Label>
          {question.type === "choice" ? (
            <div className="flex flex-wrap gap-2">
              {(question.options ?? []).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [question.id]: option }))
                  }
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    answers[question.id] === option
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <Textarea
              rows={3}
              maxLength={1000}
              value={answers[question.id] ?? ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
              }
            />
          )}
        </div>
      ))}

      <Button type="submit" variant="hero" className="w-full" disabled={saving}>
        {saving ? t("Submitting…") : t("Submit response")}
      </Button>
    </form>
  );
}

function SurveyDialog({
  survey,
  onOpenChange,
}: {
  survey: Survey | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();

  return (
    <Dialog open={!!survey} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-left">{survey?.title}</DialogTitle>
          <DialogDescription className="text-left">
            {survey
              ? survey.closes_at
                ? `${t("Closes")} ${formatDateShort(survey.closes_at)}`
                : t("Active survey")
              : null}
          </DialogDescription>
        </DialogHeader>
        {survey ? (
          <div className="space-y-4">
            <img
              src={survey.image_url ?? surveyFallback}
              alt={survey.title}
              loading="lazy"
              className="aspect-[16/6] w-full rounded-xl object-cover"
            />
            <p className="text-sm text-foreground/85">{survey.description}</p>
            <SurveyForm key={survey.id} survey={survey} onClose={() => onOpenChange(false)} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function SurveyCard({
  survey,
  onOpen,
  status,
}: {
  survey: Survey;
  onOpen: () => void;
  status: "active" | "closed";
}) {
  const t = useT();
  const questionCount = survey.questions.length;
  return (
    <Card
      className="cursor-pointer border-border/70 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label={`${t("Complete this survey")}: ${survey.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <CardContent className="p-6">
        <img
          src={survey.image_url ?? surveyFallback}
          alt={survey.title}
          loading="lazy"
          className="mb-4 aspect-[16/6] w-full rounded-xl object-cover"
        />
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg">{survey.title}</h3>
          {status === "active" ? (
            survey.closes_at ? (
              <Badge variant="secondary">{t("Closes")} {formatDateShort(survey.closes_at)}</Badge>
            ) : (
              <Badge className="bg-primary text-primary-foreground">{t("Active")}</Badge>
            )
          ) : (
            <Badge variant="secondary">{t("Closed")}</Badge>
          )}
        </div>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{survey.description}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          {questionCount} {questionCount === 1 ? t("question") : t("questions")}
        </p>
        {status === "active" ? (
          <Button type="button" variant="soft" className="mt-4 w-full" onClick={onOpen}>
            {t("Complete survey")}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SurveysPage() {
  const t = useT();
  const navigate = useNavigate({ from: "/surveys" });
  const search = Route.useSearch();
  const { data: surveys = [] } = useQuery(surveysQuery);
  const active = surveys.filter((s) => surveyStatus(s) === "active");
  const closed = surveys.filter((s) => surveyStatus(s) !== "active");
  const [view, setView] = useSearchFilter("view", "active");
  const list = view === "active" ? active : closed;

  const selected = surveys.find((s) => s.id === search.survey) ?? null;
  const openSurvey = (survey: Survey | null) =>
    navigate({ search: (prev: SurveysSearch) => ({ ...prev, survey: survey?.id }) });

  return (
    <>
      <PageHeader
        eyebrow={t("Get involved")}
        title={t("Surveys")}
        description={t("Your answers shape what we fund, where we meet and how we support each other.")}
      />
      <FilterPage
        filters={(
          <FilterSelect
            label={t("Surveys")}
            value={view}
            onChange={(value) => setView(value as "active" | "closed")}
            options={[
              {
                value: "active",
                label: t("Active surveys"),
                meta: `${active.length} ${t("surveys")}`,
              },
              {
                value: "closed",
                label: t("Closed surveys"),
                meta: `${closed.length} ${t("surveys")}`,
              },
            ]}
          />
        )}
      >
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {view === "active" ? t("No active surveys right now.") : t("No closed surveys yet.")}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {list.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                status={view === "active" ? "active" : "closed"}
                onOpen={() => openSurvey(survey)}
              />
            ))}
          </div>
        )}
      </FilterPage>

      <SurveyDialog survey={selected} onOpenChange={(open) => !open && openSurvey(null)} />
    </>
  );
}
