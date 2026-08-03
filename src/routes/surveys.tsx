import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, surveysQuery, type Survey } from "@/lib/queries";

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
      { property: "og:description", content: "Answer active surveys and shape community decisions." },
    ],
  }),
  component: SurveysPage,
});

function SurveyForm({ survey }: { survey: Survey }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [membership, setMembership] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const unanswered = survey.questions.filter((q) => !answers[q.id]?.trim());
    if (unanswered.length > 0) {
      toast.error("Please answer every question");
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
      toast.error("Your response could not be saved. Please try again.");
      return;
    }
    setDone(true);
    toast.success("Thank you — your response has been recorded.");
  }

  if (done) {
    return (
      <Card className="border-border/70">
        <CardContent className="p-8 text-center">
          <h3 className="text-lg">Response recorded</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you for helping shape "{survey.title}".
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-xl">{survey.title}</h3>
          {survey.closes_at ? (
            <Badge variant="secondary">Closes {formatDate(survey.closes_at)}</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{survey.description}</p>

        <form onSubmit={submit} className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor={`m-${survey.id}`}>
              Membership number (optional, but recommended)
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
            {saving ? "Submitting…" : "Submit response"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SurveysPage() {
  const { data: surveys = [] } = useQuery(surveysQuery);
  const active = surveys.filter((s) => s.is_active);
  const closed = surveys.filter((s) => !s.is_active);

  return (
    <>
      <PageHeader
        eyebrow="Get involved"
        title="Surveys"
        description="Your answers shape what we fund, where we meet and how we support each other."
      />
      <section className="container-page py-14">
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active surveys</TabsTrigger>
            <TabsTrigger value="closed">Closed surveys</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-8 space-y-6">
            {active.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active surveys right now.</p>
            ) : (
              active.map((survey) => <SurveyForm key={survey.id} survey={survey} />)
            )}
          </TabsContent>
          <TabsContent value="closed" className="mt-8 space-y-4">
            {closed.length === 0 ? (
              <p className="text-sm text-muted-foreground">No closed surveys yet.</p>
            ) : (
              closed.map((survey) => (
                <Card key={survey.id} className="border-border/70">
                  <CardContent className="p-6">
                    <h3 className="text-lg">{survey.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{survey.description}</p>
                    <Badge variant="secondary" className="mt-3">
                      Closed
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}