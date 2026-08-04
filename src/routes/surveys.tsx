import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { SidebarNavItem, SidebarPage } from "@/components/site/SidebarPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, surveysQuery, type Survey } from "@/lib/queries";
import surveyFallback from "@/assets/survey-fallback.jpg";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/surveys")({
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

function SurveyForm({ survey }: { survey: Survey }) {
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
      <Card className="border-border/70">
        <CardContent className="p-8 text-center">
          <h3 className="text-lg">{t("Response recorded")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('Thank you for helping shape "{title}".').replace("{title}", survey.title)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70">
      <CardContent className="p-6 sm:p-8">
        <img
          src={survey.image_url ?? surveyFallback}
          alt={survey.title}
          loading="lazy"
          className="mb-5 aspect-[16/6] w-full rounded-xl object-cover"
        />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-xl">{survey.title}</h3>
          {survey.closes_at ? (
            <Badge variant="secondary">{t("Closes")} {formatDate(survey.closes_at)}</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{survey.description}</p>

        <form onSubmit={submit} className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor={`m-${survey.id}`}>
              {t("Membership number (optional, but recommended)")}
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

          <Button type="submit" variant="hero" disabled={saving}>
            {saving ? t("Submitting…") : t("Submit response")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SurveysPage() {
  const t = useT();
  const { data: surveys = [] } = useQuery(surveysQuery);
  const active = surveys.filter((s) => s.is_active);
  const closed = surveys.filter((s) => !s.is_active);
  const [view, setView] = useState<"active" | "closed">("active");
  const list = view === "active" ? active : closed;

  return (
    <>
      <PageHeader
        eyebrow={t("Get involved")}
        title={t("Surveys")}
        description={t("Your answers shape what we fund, where we meet and how we support each other.")}
      />
      <SidebarPage
        banner={{
          image: list[0]?.image_url ?? surveyFallback,
          title: view === "active" ? t("Active surveys") : t("Closed surveys"),
          description: t("Your answers shape what we fund, where we meet and how we support each other."),
        }}
        sidebar={(
          <>
            <SidebarNavItem
              image={active[0]?.image_url ?? surveyFallback}
              title={t("Active surveys")}
              meta={`${active.length} ${t("surveys")}`}
              active={view === "active"}
              onClick={() => setView("active")}
            />
            <SidebarNavItem
              image={closed[0]?.image_url ?? surveyFallback}
              title={t("Closed surveys")}
              meta={`${closed.length} ${t("surveys")}`}
              active={view === "closed"}
              onClick={() => setView("closed")}
            />
          </>
        )}
      >
        {view === "active" ? (
          <div className="space-y-6">
            {active.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("No active surveys right now.")}</p>
            ) : (
              active.map((survey) => <SurveyForm key={survey.id} survey={survey} />)
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {closed.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("No closed surveys yet.")}</p>
            ) : (
              closed.map((survey) => (
                <Card key={survey.id} className="border-border/70">
                  <CardContent className="p-6">
                    <img
                      src={survey.image_url ?? surveyFallback}
                      alt={survey.title}
                      loading="lazy"
                      className="mb-4 aspect-[16/6] w-full rounded-xl object-cover"
                    />
                    <h3 className="text-lg">{survey.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{survey.description}</p>
                    <Badge variant="secondary" className="mt-3">
                      {t("Closed")}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </SidebarPage>
    </>
  );
}
