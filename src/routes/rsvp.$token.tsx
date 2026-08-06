import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  cancelRsvpByToken,
  getRsvpByToken,
  updateRsvpByToken,
} from "@/lib/rsvp.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/rsvp/$token")({
  head: () => ({
    meta: [
      { title: "Edit your RSVP — CCGMs Events" },
      {
        name: "description",
        content:
          "Update or cancel your response to a CCGMs community event using your private RSVP link.",
      },
      { property: "og:title", content: "Edit your RSVP — CCGMs Events" },
      {
        property: "og:description",
        content: "Update or cancel your response to a CCGMs community event.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RsvpEditPage,
});

function RsvpEditPage() {
  const t = useT();
  const { token } = Route.useParams();
  const fetchRsvp = useServerFn(getRsvpByToken);
  const saveRsvp = useServerFn(updateRsvpByToken);
  const cancelRsvp = useServerFn(cancelRsvpByToken);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["rsvp", token],
    queryFn: () => fetchRsvp({ data: { token } }),
  });

  const [status, setStatus] = useState<"going" | "interested">("going");
  const [saving, setSaving] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (data?.status === "interested" || data?.status === "going") setStatus(data.status);
  }, [data?.status]);

  const event = (data as any)?.events as
    | { title: string; start_at: string; location: string | null; event_type: string }
    | undefined;

  async function onSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const form = new FormData(formEvent.currentTarget);
    setSaving(true);
    try {
      await saveRsvp({
        data: {
          token,
          status,
          full_name: String(form.get("full_name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          membership_number: String(form.get("membership_number") ?? ""),
          guests: Number(form.get("guests") ?? 0),
          note: String(form.get("note") ?? ""),
        },
      });
      toast.success(t("Your response has been updated."));
      await refetch();
    } catch {
      toast.error(t("We couldn't update your response. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  async function onCancel() {
    setSaving(true);
    try {
      await cancelRsvp({ data: { token } });
      setCancelled(true);
      toast.success(t("Your response has been cancelled."));
    } catch {
      toast.error(t("We couldn't cancel your response. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={t("Events")}
        title={t("Edit your response")}
        description={t("Update your details, change your response or cancel your place.")}
      />
      <section className="container-page py-14">
        <Button asChild variant="soft" className="mb-6">
          <Link to="/events">
            <ArrowLeft /> {t("Back to events")}
          </Link>
        </Button>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t("Loading…")}</p>
        ) : cancelled ? (
          <Card className="max-w-xl border-border/70">
            <CardContent className="p-8">
              <p className="text-sm">{t("Your response has been cancelled. We hope to see you next time.")}</p>
            </CardContent>
          </Card>
        ) : !data ? (
          <Card className="max-w-xl border-border/70">
            <CardContent className="p-8">
              <p className="text-sm">
                {t("This RSVP link is no longer valid. It may have already been cancelled.")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid max-w-4xl gap-6 lg:grid-cols-[1fr_1.2fr]">
            {event ? (
              <Card className="h-fit border-border/70">
                <CardContent className="space-y-3 p-6">
                  <p className="eyebrow text-terracotta">
                    {event.event_type === "ccgms" ? t("CCGMs event") : t("Other event")}
                  </p>
                  <h2 className="text-xl">{event.title}</h2>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="size-4" />
                    {new Date(event.start_at).toLocaleString("en-GB", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                  {event.location ? (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-4" /> {event.location}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            <Card className="border-border/70">
              <CardContent className="p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="flex flex-wrap gap-2" role="group" aria-label={t("Your response")}>
                    {(["going", "interested"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setStatus(value)}
                        aria-pressed={status === value}
                        className={`min-h-9 rounded-full border px-4 text-sm transition-colors ${
                          status === value
                            ? "border-transparent bg-primary text-primary-foreground"
                            : "border-border hover:bg-secondary"
                        }`}
                      >
                        {value === "going" ? t("I'm going") : t("Interested")}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="rsvp-edit-name">{t("Your name")}</Label>
                      <Input
                        id="rsvp-edit-name"
                        name="full_name"
                        required
                        maxLength={120}
                        defaultValue={data.full_name ?? ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rsvp-edit-email">{t("Your email")}</Label>
                      <Input
                        id="rsvp-edit-email"
                        name="email"
                        type="email"
                        required
                        maxLength={255}
                        defaultValue={data.email ?? ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rsvp-edit-phone">{t("Your phone (optional)")}</Label>
                      <Input
                        id="rsvp-edit-phone"
                        name="phone"
                        maxLength={30}
                        defaultValue={data.phone ?? ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rsvp-edit-guests">{t("Extra guests")}</Label>
                      <Input
                        id="rsvp-edit-guests"
                        name="guests"
                        type="number"
                        min={0}
                        max={20}
                        defaultValue={data.guests ?? 0}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="rsvp-edit-member">
                        {t("Membership number (Recommend)")}
                      </Label>
                      <Input
                        id="rsvp-edit-member"
                        name="membership_number"
                        maxLength={30}
                        defaultValue={data.membership_number ?? ""}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="rsvp-edit-note">
                        {t("Anything we should know? (optional)")}
                      </Label>
                      <Textarea
                        id="rsvp-edit-note"
                        name="note"
                        rows={2}
                        maxLength={500}
                        defaultValue={data.note ?? ""}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" variant="hero" disabled={saving}>
                      {saving ? t("Saving…") : t("Save changes")}
                    </Button>
                    <Button type="button" variant="soft" onClick={onCancel} disabled={saving}>
                      {t("Cancel my response")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </>
  );
}
