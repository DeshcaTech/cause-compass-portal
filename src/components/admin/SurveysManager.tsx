import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { surveyStatus, type Survey, type SurveyQuestion } from "@/lib/queries";

const db = supabase as unknown as { from: (table: string) => any };

type Draft = {
  title: string;
  description: string;
  image_url: string;
  opens_at: string;
  closes_at: string;
  is_active: boolean;
  questions: SurveyQuestion[];
};

const emptyDraft: Draft = {
  title: "",
  description: "",
  image_url: "",
  opens_at: "",
  closes_at: "",
  is_active: true,
  questions: [],
};

function newQuestion(): SurveyQuestion {
  return { id: `q${Date.now().toString(36)}`, type: "text", label: "", options: [] };
}

function statusLabel(survey: Survey) {
  if (!survey.is_active) return "Switched off";
  const today = new Date().toISOString().slice(0, 10);
  if (survey.opens_at && survey.opens_at > today) return `Opens ${survey.opens_at}`;
  if (survey.closes_at && survey.closes_at < today) return `Closed ${survey.closes_at}`;
  return survey.closes_at ? `Active until ${survey.closes_at}` : "Active";
}

export function SurveysManager() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Survey | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [deleting, setDeleting] = useState<Survey | null>(null);

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ["admin", "surveys"],
    queryFn: async () => {
      const { data, error } = await db
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map((row: any) => ({
        ...row,
        questions: (row.questions ?? []) as SurveyQuestion[],
      })) as Survey[];
    },
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin", "surveys"] });
    queryClient.invalidateQueries({ queryKey: ["surveys"] });
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!draft.title.trim()) throw new Error("Give the survey a title.");
      if (draft.questions.length === 0) throw new Error("Add at least one question.");
      if (draft.questions.some((q) => !q.label.trim())) throw new Error("Every question needs a wording.");
      if (draft.questions.some((q) => q.type === "choice" && (q.options ?? []).length < 2))
        throw new Error("Multiple-choice questions need at least two answers.");
      if (draft.opens_at && draft.closes_at && draft.opens_at > draft.closes_at)
        throw new Error("The start date must come before the closing date.");
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        image_url: draft.image_url.trim() || null,
        opens_at: draft.opens_at || null,
        closes_at: draft.closes_at || null,
        is_active: draft.is_active,
        questions: draft.questions.map((q) => ({
          id: q.id,
          type: q.type,
          label: q.label.trim(),
          ...(q.type === "choice" ? { options: (q.options ?? []).map((o) => o.trim()).filter(Boolean) } : {}),
        })),
      };
      if (editing) {
        const { error } = await db.from("surveys").update(payload).eq("id", editing.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await db.from("surveys").insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Survey updated" : "Survey created");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (survey: Survey) => {
      const { error } = await db.from("surveys").delete().eq("id", survey.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Survey deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function startCreate() {
    setEditing(null);
    setDraft({ ...emptyDraft, questions: [newQuestion()] });
    setOpen(true);
  }

  function startEdit(survey: Survey) {
    setEditing(survey);
    setDraft({
      title: survey.title,
      description: survey.description ?? "",
      image_url: survey.image_url ?? "",
      opens_at: survey.opens_at ?? "",
      closes_at: survey.closes_at ?? "",
      is_active: survey.is_active,
      questions: survey.questions.length > 0 ? survey.questions : [newQuestion()],
    });
    setOpen(true);
  }

  function patchQuestion(index: number, patch: Partial<SurveyQuestion>) {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    }));
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl">Surveys</h2>
            <p className="text-sm text-muted-foreground">
              Build the questions and set the dates — surveys open and close automatically.
            </p>
          </div>
          <Button onClick={startCreate}>
            <Plus /> New survey
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : surveys.length === 0 ? (
          <p className="text-sm text-muted-foreground">No surveys yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {surveys.map((survey) => (
              <li key={survey.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{survey.title}</span>
                    <Badge
                      variant={surveyStatus(survey) === "active" ? "default" : "secondary"}
                    >
                      {surveyStatus(survey) === "active" ? "Active" : "Closed"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {survey.questions.length} question{survey.questions.length === 1 ? "" : "s"} ·{" "}
                    {statusLabel(survey)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="soft" size="sm" onClick={() => startEdit(survey)}>
                    <Pencil /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleting(survey)}>
                    <Trash2 /> Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit survey" : "New survey"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="survey-title">Title</Label>
              <Input
                id="survey-title"
                value={draft.title}
                onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="survey-description">Description</Label>
              <Textarea
                id="survey-description"
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="survey-image">Picture link (optional)</Label>
              <Input
                id="survey-image"
                value={draft.image_url}
                onChange={(e) => setDraft((p) => ({ ...p, image_url: e.target.value }))}
                placeholder="https://…"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="survey-opens">Start date</Label>
                <Input
                  id="survey-opens"
                  type="date"
                  value={draft.opens_at}
                  onChange={(e) => setDraft((p) => ({ ...p, opens_at: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="survey-closes">End date</Label>
                <Input
                  id="survey-closes"
                  type="date"
                  value={draft.closes_at}
                  onChange={(e) => setDraft((p) => ({ ...p, closes_at: e.target.value }))}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave the dates empty to keep the survey open indefinitely. Before the start date and after the
              end date it shows as closed automatically.
            </p>

            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <Label htmlFor="survey-active">Published</Label>
                <p className="text-xs text-muted-foreground">Switch off to hide it from members entirely.</p>
              </div>
              <Switch
                id="survey-active"
                checked={draft.is_active}
                onCheckedChange={(checked) => setDraft((p) => ({ ...p, is_active: checked }))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">Questions</h3>
                <Button
                  type="button"
                  variant="soft"
                  size="sm"
                  onClick={() => setDraft((p) => ({ ...p, questions: [...p.questions, newQuestion()] }))}
                >
                  <Plus /> Add question
                </Button>
              </div>

              {draft.questions.map((question, index) => (
                <div key={question.id} className="space-y-3 rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="size-4 text-muted-foreground" aria-hidden />
                    <span className="text-xs text-muted-foreground">Question {index + 1}</span>
                    <div className="ml-auto flex gap-2">
                      <Button
                        type="button"
                        variant="soft"
                        size="sm"
                        disabled={index === 0}
                        onClick={() =>
                          setDraft((p) => {
                            const next = [...p.questions];
                            const item = next[index]!;
                            next[index] = next[index - 1]!;
                            next[index - 1] = item;
                            return { ...p, questions: next };
                          })
                        }
                      >
                        Up
                      </Button>
                      <Button
                        type="button"
                        variant="soft"
                        size="sm"
                        disabled={index === draft.questions.length - 1}
                        onClick={() =>
                          setDraft((p) => {
                            const next = [...p.questions];
                            const item = next[index]!;
                            next[index] = next[index + 1]!;
                            next[index + 1] = item;
                            return { ...p, questions: next };
                          })
                        }
                      >
                        Down
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setDraft((p) => ({ ...p, questions: p.questions.filter((_, i) => i !== index) }))
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`q-label-${question.id}`}>Question</Label>
                    <Input
                      id={`q-label-${question.id}`}
                      value={question.label}
                      onChange={(e) => patchQuestion(index, { label: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(["text", "choice"] as const).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        size="sm"
                        variant={question.type === type ? "default" : "soft"}
                        onClick={() => patchQuestion(index, { type })}
                      >
                        {type === "text" ? "Free text" : "Multiple choice"}
                      </Button>
                    ))}
                  </div>

                  {question.type === "choice" ? (
                    <div className="space-y-2">
                      <Label htmlFor={`q-options-${question.id}`}>Answers (one per line)</Label>
                      <Textarea
                        id={`q-options-${question.id}`}
                        rows={3}
                        value={(question.options ?? []).join("\n")}
                        onChange={(e) =>
                          patchQuestion(index, { options: e.target.value.split("\n") })
                        }
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="soft" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : editing ? "Save changes" : "Create survey"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(value) => !value && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete “{deleting?.title}”?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This removes the survey and its responses can no longer be linked to it.
          </p>
          <DialogFooter>
            <Button variant="soft" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => deleting && remove.mutate(deleting)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}