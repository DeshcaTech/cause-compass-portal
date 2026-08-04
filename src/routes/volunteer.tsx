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

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(30).optional(),
  membership_number: z.string().trim().max(30).optional(),
  availability: z.string().trim().max(200).optional(),
  message: z.string().trim().max(1000).optional(),
});

function VolunteerPage() {
  const t = useT();
  const [areas, setAreas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

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
    setSaving(true);
    try {
      await submitVolunteerApplication({
        data: {
          full_name: parsed.data.full_name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          membership_number: parsed.data.membership_number,
          availability: parsed.data.availability,
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
                  {t("Membership number (optional, but recommended)")}
                </Label>
                <Input id="membership_number" name="membership_number" placeholder="CCGM-1000" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t("Full name")}</Label>
                  <Input id="full_name" name="full_name" required maxLength={120} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("Email")}</Label>
                  <Input id="email" name="email" type="email" required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("Phone")}</Label>
                  <Input id="phone" name="phone" maxLength={30} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">{t("Availability")}</Label>
                  <Input
                    id="availability"
                    name="availability"
                    placeholder="Weekends, evenings…"
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>{t("Where would you like to help?")}</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {AREAS.map((area) => (
                    <label
                      key={area}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
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
