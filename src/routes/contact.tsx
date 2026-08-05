import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { useT } from "@/lib/i18n";
import { siteSettingsQuery, whatsappHref } from "@/lib/site-settings";
import { trackEvent } from "@/lib/analytics";
import whatsappUs from "@/assets/whatsapp-us.png";

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
      { property: "og:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { name: "twitter:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
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
  const t = useT();
  const [saving, setSaving] = useState(false);
  const { data: site } = useQuery(siteSettingsQuery);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(t(parsed.error.issues[0]?.message ?? "Please check the form"));
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
      toast.error(t("Sorry, your message could not be sent. Please try again."));
      return;
    }
    toast.success(t("Thank you — we have received your message."));
    form.reset();
  }

  return (
    <>
      <PageHeader
        eyebrow={t("Contact")}
        title={t("Talk to the CCGMs team")}
        description={t("Questions about membership, events, renting community assets or getting support? We're here.")}
      />
      <section className="container-page grid gap-8 py-14 lg:grid-cols-[1fr_360px]">
        <Card className="border-border/70">
          <CardContent className="p-7">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t("Full name")}</Label>
                  <Input id="full_name" name="full_name" required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("Email")}</Label>
                  <Input id="email" name="email" type="email" required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("Phone (optional)")}</Label>
                  <Input id="phone" name="phone" maxLength={30} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t("Subject")}</Label>
                  <Input id="subject" name="subject" required maxLength={150} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t("Message")}</Label>
                <Textarea id="message" name="message" rows={6} required maxLength={2000} />
              </div>
              <Button type="submit" variant="hero" size="lg" disabled={saving}>
                {saving ? t("Sending…") : t("Send message")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit border-border/70 bg-primary text-primary-foreground">
          <CardContent className="space-y-5 p-7">
            <h2 className="text-xl text-primary-foreground">{t("Community office")}</h2>
            <p className="flex items-start gap-3 text-sm text-primary-foreground/80">
              <MapPin className="mt-0.5 size-4 shrink-0" />{" "}
              {site?.contact_address ?? t("CCGMs Centre, 24 Unity Road")}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <Phone className="mt-0.5 size-4 shrink-0" /> {site?.contact_phone ?? "07700 900000"}
              </p>
              {site?.show_contact_whatsapp !== false &&
              whatsappHref(site?.contact_whatsapp || site?.contact_phone, site?.whatsapp_message) ? (
                <a
                  href={
                    whatsappHref(
                      site?.contact_whatsapp || site?.contact_phone,
                      site?.whatsapp_message,
                    )!
                  }
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("Chat with CCGMs on WhatsApp")}
                  onClick={() => void trackEvent("whatsapp_us_click", { source: "contact_page" })}
                  className="block transition-transform hover:scale-[1.02]"
                >
                  <img
                    src={whatsappUs}
                    alt={t("Chat with CCGMs on WhatsApp")}
                    loading="lazy"
                    width={1536}
                    height={512}
                    className="h-14 w-auto"
                  />
                </a>
              ) : null}
            </div>
            <p className="flex items-start gap-3 text-sm text-primary-foreground/80">
              <Mail className="mt-0.5 size-4 shrink-0" /> {site?.contact_email ?? "hello@ccgms.org"}
            </p>
            <div className="rounded-xl bg-primary-foreground/10 p-4 text-sm text-primary-foreground/80">
              {t("Office hours: Tuesday to Saturday, 10:00 – 17:00. Urgent welfare requests are reviewed within 72 hours.")}
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
