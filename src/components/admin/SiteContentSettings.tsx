import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_SITE_SETTINGS,
  SITE_SETTINGS_KEY,
  siteSettingsQuery,
  type SiteSettings,
} from "@/lib/site-settings";

type Field = {
  key: keyof SiteSettings;
  label: string;
  hint?: string;
  multiline?: boolean;
  toggle?: boolean;
  number?: boolean;
};

type Group = {
  title: string;
  description: string;
  fields: Field[];
  superAdminOnly?: boolean;
  whatsappAdminOnly?: boolean;
};

const GROUPS: Group[] = [
  {
    title: "Home page hero",
    description: "The headline block at the top of the home page.",
    fields: [
      { key: "org_name", label: "Organisation short name" },
      { key: "hero_eyebrow", label: "Eyebrow line (above the headline)" },
      { key: "hero_title_line1", label: "Headline — first line" },
      { key: "hero_title_line2", label: "Headline — second line (gold)" },
      { key: "hero_intro", label: "Intro paragraph", multiline: true },
    ],
  },
  {
    title: "Who we are section",
    description: "The 'A family of families' block on the home page.",
    fields: [
      { key: "about_eyebrow", label: "Eyebrow line" },
      { key: "about_title", label: "Section heading" },
      { key: "about_body_1", label: "First paragraph", multiline: true },
      { key: "about_body_2", label: "Second paragraph", multiline: true },
    ],
  },
  {
    title: "App download links",
    description: "Where the store badges on the home page point. Leave empty to disable the badge.",
    fields: [
      { key: "android_app_url", label: "Google Play link", hint: "https://play.google.com/..." },
      { key: "ios_app_url", label: "App Store link", hint: "https://apps.apple.com/..." },
    ],
  },
  {
    title: "Contact details",
    description: "Shown in the footer and on the contact page.",
    fields: [
      { key: "contact_address", label: "Address" },
      { key: "contact_phone", label: "Phone" },
      { key: "contact_email", label: "Email" },
      { key: "footer_blurb", label: "Footer description", multiline: true },
    ],
  },
  {
    title: "Card pictures",
    description:
      "Shape of the pictures on cards across the site, as width ÷ height. A6 landscape is 1.41, A6 portrait is 0.71, square is 1.",
    fields: [
      {
        key: "card_image_ratio",
        label: "Picture shape (width ÷ height)",
        hint: "1.41",
        number: true,
      },
    ],
  },
  {
    title: "Contact details (legacy)",
    description: "Shown in the footer and on the contact page.",
    fields: [
      { key: "contact_address", label: "Address" },
      { key: "contact_phone", label: "Phone" },
      { key: "contact_email", label: "Email" },
      { key: "footer_blurb", label: "Footer description", multiline: true },
    ],
  },
  {
    title: "Social media",
    description:
      "Links to your community profiles. Shown as quick-contact icons in the footer. Leave empty to hide an icon.",
    fields: [
      { key: "facebook_url", label: "Facebook", hint: "https://facebook.com/…" },
      { key: "instagram_url", label: "Instagram", hint: "https://instagram.com/…" },
      { key: "x_url", label: "X (Twitter)", hint: "https://x.com/…" },
      { key: "youtube_url", label: "YouTube", hint: "https://youtube.com/…" },
      { key: "tiktok_url", label: "TikTok", hint: "https://tiktok.com/@…" },
    ],
  },
  {
    title: "Membership fees (level 1 & 2)",
    description:
      "Yearly price for each membership type. Turn on free membership to waive all fees.",
    whatsappAdminOnly: true,
    fields: [
      { key: "membership_free", label: "Make membership free for everyone", toggle: true },
      { key: "membership_fee_individual", label: "Individual fee (£ per year)", number: true },
      { key: "membership_fee_student", label: "Student fee (£ per year)", number: true },
      { key: "membership_fee_family", label: "Family fee (£ per year)", number: true },
    ],
  },
  {
    title: "Developer credit (level 1 only)",
    description:
      "WhatsApp number behind the 'Powered by DeshcaTech' link in the footer. Use the international format, e.g. 447700900000.",
    superAdminOnly: true,
    fields: [
      { key: "developer_whatsapp", label: "DeshcaTech WhatsApp number", hint: "447700900000" },
    ],
  },
  {
    title: "Contact WhatsApp (level 1 & 2)",
    description:
      "Number behind the 'WhatsApp Us' button on the contact page. Use the international format, e.g. 447700900000. Leave empty to hide the button.",
    whatsappAdminOnly: true,
    fields: [
      { key: "contact_whatsapp", label: "Community WhatsApp number", hint: "447700900000" },
      {
        key: "show_contact_whatsapp",
        label: "Show the WhatsApp button on the contact page",
        toggle: true,
      },
      {
        key: "whatsapp_message",
        label: "Default WhatsApp message (optional)",
        hint: "Hello CCGMs, I'd like to ask about…",
        multiline: true,
      },
    ],
  },
];

export function SiteContentSettings({
  isSuperAdmin = false,
  canManageWhatsapp = false,
}: {
  isSuperAdmin?: boolean;
  canManageWhatsapp?: boolean;
}) {
  const whatsappAllowed = isSuperAdmin || canManageWhatsapp;
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(siteSettingsQuery);
  const [draft, setDraft] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(data ?? DEFAULT_SITE_SETTINGS),
    [draft, data],
  );

  function set(key: keyof SiteSettings, value: string | boolean | number) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...draft,
        android_app_url: draft.android_app_url?.trim() ? draft.android_app_url.trim() : null,
        ios_app_url: draft.ios_app_url?.trim() ? draft.ios_app_url.trim() : null,
        developer_whatsapp: draft.developer_whatsapp?.trim()
          ? draft.developer_whatsapp.trim()
          : null,
        contact_whatsapp: draft.contact_whatsapp?.trim() ? draft.contact_whatsapp.trim() : null,
        whatsapp_message: draft.whatsapp_message?.trim() ? draft.whatsapp_message.trim() : null,
        facebook_url: draft.facebook_url?.trim() ? draft.facebook_url.trim() : null,
        instagram_url: draft.instagram_url?.trim() ? draft.instagram_url.trim() : null,
        x_url: draft.x_url?.trim() ? draft.x_url.trim() : null,
        youtube_url: draft.youtube_url?.trim() ? draft.youtube_url.trim() : null,
        tiktok_url: draft.tiktok_url?.trim() ? draft.tiktok_url.trim() : null,
      };
      if (!isSuperAdmin) {
        delete (payload as Partial<SiteSettings>).developer_whatsapp;
      }
      if (!whatsappAllowed) {
        delete (payload as Partial<SiteSettings>).contact_whatsapp;
        delete (payload as Partial<SiteSettings>).show_contact_whatsapp;
        delete (payload as Partial<SiteSettings>).whatsapp_message;
        delete (payload as Partial<SiteSettings>).membership_free;
        delete (payload as Partial<SiteSettings>).membership_fee_individual;
        delete (payload as Partial<SiteSettings>).membership_fee_student;
        delete (payload as Partial<SiteSettings>).membership_fee_family;
      }
      const { error } = await supabase.from("site_settings").update(payload).eq("id", 1);
      if (error) throw new Error(error.message);
      await queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_KEY });
      toast.success("Site content saved and live across the site.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading site content…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl">Site content</h2>
        <p className="text-sm text-muted-foreground">
          Wording, links and contact details used on the home page, footer and contact page.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {GROUPS.filter(
          (group) =>
            (!group.superAdminOnly || isSuperAdmin) &&
            (!group.whatsappAdminOnly || whatsappAllowed),
        ).map((group) => (
          <Card key={group.title} className="border-border/70">
            <CardContent className="space-y-5 p-6">
              <div>
                <h3 className="text-lg">{group.title}</h3>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>
              {group.fields.map((field) =>
                field.toggle ? (
                  <div
                    key={String(field.key)}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border/70 p-3"
                  >
                    <Label htmlFor={String(field.key)}>{field.label}</Label>
                    <Switch
                      id={String(field.key)}
                      checked={Boolean(draft[field.key])}
                      onCheckedChange={(checked) => set(field.key, checked)}
                    />
                  </div>
                ) : (
                <div key={String(field.key)} className="space-y-2">
                  <Label htmlFor={String(field.key)}>{field.label}</Label>
                  {field.multiline ? (
                    <Textarea
                      id={String(field.key)}
                      rows={4}
                      value={String(draft[field.key] ?? "")}
                      onChange={(e) => set(field.key, e.target.value)}
                    />
                  ) : field.number ? (
                    <Input
                      id={String(field.key)}
                      type="number"
                      min={0}
                      step="0.01"
                      value={String(draft[field.key] ?? 0)}
                      onChange={(e) => set(field.key, Number(e.target.value))}
                    />
                  ) : (
                    <Input
                      id={String(field.key)}
                      value={String(draft[field.key] ?? "")}
                      placeholder={field.hint ?? ""}
                      onChange={(e) => set(field.key, e.target.value)}
                    />
                  )}
                </div>
                ),
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => void save()} disabled={!dirty || saving} variant="hero">
          {saving ? "Saving…" : "Save site content"}
        </Button>
        {dirty ? <span className="text-sm text-muted-foreground">Unsaved changes</span> : null}
      </div>
    </div>
  );
}
