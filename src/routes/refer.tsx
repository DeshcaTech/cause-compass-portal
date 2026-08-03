import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/refer")({
  head: () => ({
    meta: [
      { title: "Refer Someone — CCGMs Community Support" },
      {
        name: "description",
        content:
          "Know someone who needs support? Refer them confidentially to the CCGMs welfare team for bereavement, illness, housing or hardship help.",
      },
      { property: "og:title", content: "Refer Someone — CCGMs Community Support" },
      { property: "og:description", content: "Confidentially refer someone who needs our support." },
    ],
  }),
  component: ReferPage,
});

const SUPPORT_TYPES = [
  "Bereavement",
  "Illness or hospital visit",
  "Housing or hardship",
  "Immigration guidance",
  "Youth or education",
  "Other",
];

const schema = z.object({
  referrer_name: z.string().trim().min(2, "Enter your name").max(120),
  referrer_email: z.string().trim().email("Enter a valid email").max(255),
  referrer_phone: z.string().trim().max(30).optional(),
  membership_number: z.string().trim().max(30).optional(),
  person_name: z.string().trim().min(2, "Enter their name").max(120),
  person_contact: z.string().trim().max(200).optional(),
  details: z.string().trim().max(1000).optional(),
});

function ReferPage() {
  const [supportType, setSupportType] = useState(SUPPORT_TYPES[0]!);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("referrals").insert({
      referrer_name: parsed.data.referrer_name,
      referrer_email: parsed.data.referrer_email,
      referrer_phone: parsed.data.referrer_phone || null,
      membership_number: parsed.data.membership_number || null,
      person_name: parsed.data.person_name,
      person_contact: parsed.data.person_contact || null,
      details: parsed.data.details || null,
      support_type: supportType,
      consent,
    });
    setSaving(false);
    if (error) {
      toast.error("Your referral could not be sent. Please try again.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <>
        <PageHeader eyebrow="Get involved" title="Referral received" />
        <section className="container-page py-16">
          <Card className="mx-auto max-w-xl border-border/70 text-center">
            <CardContent className="p-10">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[image:var(--gradient-gold)] text-gold-foreground">
                <LifeBuoy className="size-7" />
              </span>
              <h2 className="mt-6 text-2xl">Thank you for looking out for them</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                The welfare team handles every referral confidentially and will follow up
                sensitively.
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
        eyebrow="Get involved"
        title="Refer someone for support"
        description="If you know a member of our community going through a difficult time, tell us confidentially."
      />
      <section className="container-page py-14">
        <Card className="mx-auto max-w-2xl border-border/70">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="membership_number">
                  Your membership number (optional, but recommended)
                </Label>
                <Input id="membership_number" name="membership_number" placeholder="CCGM-1000" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="referrer_name">Your name</Label>
                  <Input id="referrer_name" name="referrer_name" required maxLength={120} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referrer_email">Your email</Label>
                  <Input
                    id="referrer_email"
                    name="referrer_email"
                    type="email"
                    required
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="referrer_phone">Your phone (optional)</Label>
                  <Input id="referrer_phone" name="referrer_phone" maxLength={30} />
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-5">
                <Label>Type of support needed</Label>
                <div className="flex flex-wrap gap-2">
                  {SUPPORT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSupportType(type)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                        supportType === type
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="person_name">Their name</Label>
                  <Input id="person_name" name="person_name" required maxLength={120} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="person_contact">Their contact (if known)</Label>
                  <Input id="person_contact" name="person_contact" maxLength={200} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">How can we help?</Label>
                <Textarea id="details" name="details" rows={4} maxLength={1000} />
              </div>

              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={consent}
                  onCheckedChange={(value) => setConsent(value === true)}
                />
                They know about this referral and are happy to be contacted.
              </label>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={saving}>
                {saving ? "Sending…" : "Send referral"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </>
  );
}