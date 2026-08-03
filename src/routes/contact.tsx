import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact CCGMs" },
      {
        name: "description",
        content:
          "Get in touch with the CCGMs team about membership, events, asset rental or community support.",
      },
      { property: "og:title", content: "Contact CCGMs" },
      { property: "og:description", content: "Send a message to the CCGMs community team." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().min(3, "Please add a subject").max(150),
  message: z.string().trim().min(10, "Please write a little more").max(2000),
});

function ContactPage() {
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("contact_messages").insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
    setSaving(false);
    if (error) {
      toast.error("Sorry, your message could not be sent. Please try again.");
      return;
    }
    toast.success("Thank you — we have received your message.");
    form.reset();
  }

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to the CCGMs team"
        description="Questions about membership, events, renting community assets or getting support? We're here."
      />
      <section className="container-page grid gap-8 py-14 lg:grid-cols-[1fr_360px]">
        <Card className="border-border/70">
          <CardContent className="p-7">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" name="full_name" required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" name="phone" maxLength={30} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" required maxLength={150} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" rows={6} required maxLength={2000} />
              </div>
              <Button type="submit" variant="hero" size="lg" disabled={saving}>
                {saving ? "Sending…" : "Send message"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit border-border/70 bg-primary text-primary-foreground">
          <CardContent className="space-y-5 p-7">
            <h2 className="text-xl text-primary-foreground">Community office</h2>
            <p className="flex items-start gap-3 text-sm text-primary-foreground/80">
              <MapPin className="mt-0.5 size-4 shrink-0" /> CCGMs Centre, 24 Unity Road
            </p>
            <p className="flex items-start gap-3 text-sm text-primary-foreground/80">
              <Phone className="mt-0.5 size-4 shrink-0" /> 07700 900000
            </p>
            <p className="flex items-start gap-3 text-sm text-primary-foreground/80">
              <Mail className="mt-0.5 size-4 shrink-0" /> hello@ccgms.org
            </p>
            <div className="rounded-xl bg-primary-foreground/10 p-4 text-sm text-primary-foreground/80">
              Office hours: Tuesday to Saturday, 10:00 – 17:00. Urgent welfare requests are reviewed
              within 72 hours.
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}