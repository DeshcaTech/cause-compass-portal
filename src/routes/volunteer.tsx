import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HandHeart } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { Req } from "@/components/site/Req";
import { submitVolunteerApplication } from "@/lib/signup.functions";
import volunteerHero from "@/assets/volunteer-hero.jpg";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "Become a Volunteer — CCGMs" },
      {
        name: "description",
        content:
          "Give your time and skills to CCGMs — events, welfare visits, youth mentoring, media, catering and logistics.",
      },
      { property: "og:title", content: "Become a Volunteer — CCGMs" },
      { property: "og:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { name: "twitter:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { property: "og:description", content: "Join the volunteer team supporting our community." },
    ],
  }),
  component: VolunteerPage,
});

const AREAS = [
  "Event setup & logistics",
  "Welfare & hospital visits",
  "Youth mentoring",
  "Photography & media",
  "Catering",
  "Fundraising",
  "Admin & finance",
  "Transport",
];

const DAYS = [
  { key: "Mon", label: "Monday" },
  { key: "Tue", label: "Tuesday" },
  { key: "Wed", label: "Wednesday" },
  { key: "Thu", label: "Thursday" },
  { key: "Fri", label: "Friday" },
  { key: "Sat", label: "Saturday" },
  { key: "Sun", label: "Sunday" },
];

const TIME_SLOTS = [
  { key: "morning", label: "Morning", short: "Morning" },
  { key: "afternoon", label: "Afternoon", short: "Afternoon" },
  { key: "evening", label: "Evening", short: "Evening" },
];

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(30).optional(),
  membership_number: z.string().trim().max(30).optional(),
  availability: z.string().trim().max(500).optional(),
  message: z.string().trim().max(1000).optional(),
});

function VolunteerPage() {
  const t = useT();
  const [areas, setAreas] = useState<string[]>([]);
  const [areasOpen, setAreasOpen] = useState(false);
  const [slots, setSlots] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  function toggleSlot(key: string) {
    setSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function buildAvailability() {
    return DAYS.map((day) => {
      const selected = TIME_SLOTS.filter((s) =>
        slots.has(`${day.key}|${s.key}`),
      ).map((s) => s.short);
      return selected.length ? `${day.key}: ${selected.join(", ")}` : null;
    })
      .filter(Boolean)
      .join("; ");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      toast.error(t(parsed.error.issues[0]?.message ?? "Please check the form"));
      return;
    }
    if (areas.length === 0) {
      toast.error(t("Choose at least one area you'd like to help with"));
      return;
    }
    const availability = buildAvailability();
    setSaving(true);
    try {
      await submitVolunteerApplication({
        data: {
          full_name: parsed.data.full_name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          membership_number: parsed.data.membership_number,
          availability: availability || undefined,
          message: parsed.data.message,
          areas,
        },
      });
      setDone(true);
    } catch {
      toast.error(t("Your application could not be sent. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <>
        <PageHeader eyebrow={t("Get involved")} title={t("Application received")} />
        <section className="container-page py-16">
          <Card className="mx-auto max-w-xl border-border/70 text-center">
            <CardContent className="p-10">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[image:var(--gradient-gold)] text-gold-foreground">
                <HandHeart className="size-7" />
              </span>
              <h2 className="mt-6 text-2xl">{t("Thank you for stepping forward")}</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {t("The volunteer coordinator will be in touch to match you with a team.")}
              </p>
            </CardContent>
          </Card>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={t("Get involved")}
        title={t("Become a volunteer")}
        description={t("A few hours from many hands is what keeps this community moving.")}
      />
      <section className="container-page py-14">
        <Card className="mx-auto max-w-2xl overflow-hidden border-border/70">
          <img
            src={volunteerHero}
            alt="CCGMs volunteers helping at a community event"
            loading="lazy"
            className="aspect-[16/9] w-full object-cover"
          />
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="membership_number">
                  {t("Membership number (Recommend)")}
                </Label>
                <Input id="membership_number" name="membership_number" placeholder="CCGM-1000" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    {t("Full name")}
                    <Req />
                  </Label>
                  <Input id="full_name" name="full_name" required maxLength={120} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t("Email")}
                    <Req />
                  </Label>
                  <Input id="email" name="email" type="email" required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("Phone")}</Label>
                  <Input id="phone" name="phone" maxLength={30} />
                </div>
              </div>

              <div className="space-y-3">
                <Label>{t("Availability — pick the days and times you can help")}</Label>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/40">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                          {t("Day")}
                        </th>
                        {TIME_SLOTS.map((s) => (
                          <th
                            key={s.key}
                            className="px-3 py-2 text-center font-medium text-muted-foreground"
                          >
                            {t(s.label)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map((day, idx) => (
                        <tr key={day.key} className={idx % 2 ? "bg-muted/20" : ""}>
                          <td className="whitespace-nowrap px-3 py-2 font-medium">
                            {t(day.label)}
                          </td>
                          {TIME_SLOTS.map((s) => {
                            const slotKey = `${day.key}|${s.key}`;
                            return (
                              <td key={s.key} className="px-3 py-2 text-center">
                                <Checkbox
                                  checked={slots.has(slotKey)}
                                  onCheckedChange={() => toggleSlot(slotKey)}
                                  aria-label={`${day.label} ${s.label}`}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <Label>
                  {t("Where would you like to help?")}
                  <Req />
                </Label>
                <Popover open={areasOpen} onOpenChange={setAreasOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={areasOpen}
                      className="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm"
                    >
                      <span className={areas.length ? "" : "text-muted-foreground"}>
                        {areas.length
                          ? areas.map((area) => t(area)).join(", ")
                          : t("Select one or more areas")}
                      </span>
                      <ChevronDown className="size-4 shrink-0 opacity-60" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[min(22rem,90vw)] p-2">
                    <div role="listbox" aria-multiselectable className="grid gap-1">
                      {AREAS.map((area) => (
                        <label
                          key={area}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-secondary"
                        >
                          <Checkbox
                            checked={areas.includes(area)}
                            onCheckedChange={(value) =>
                              setAreas((prev) =>
                                value === true ? [...prev, area] : prev.filter((a) => a !== area),
                              )
                            }
                          />
                          {t(area)}
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t("Anything else we should know?")}</Label>
                <Textarea id="message" name="message" rows={4} maxLength={1000} />
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={saving}>
                {saving ? t("Sending…") : t("Submit application")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
