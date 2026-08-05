import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  org_name: string;
  hero_eyebrow: string;
  hero_title_line1: string;
  hero_title_line2: string;
  hero_intro: string;
  about_eyebrow: string;
  about_title: string;
  about_body_1: string;
  about_body_2: string;
  android_app_url: string | null;
  ios_app_url: string | null;
  contact_address: string;
  contact_phone: string;
  contact_email: string;
  footer_blurb: string;
  contact_whatsapp: string | null;
  show_contact_whatsapp: boolean;
  developer_whatsapp: string | null;
  whatsapp_message: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  x_url: string | null;
  youtube_url: string | null;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  org_name: "CCGMs",
  hero_eyebrow: "Cameroonian Community in Greater Manchester and Surrounding area",
  hero_title_line1: "Stronger together,",
  hero_title_line2: "generation after generation",
  hero_intro:
    "CCGMs is built on family, culture and mutual support. Join us, give to a cause, and be part of everything we build together.",
  about_eyebrow: "Who we are",
  about_title: "A family of families",
  about_body_1:
    "CCGMs brings together members of our community across generations — parents, students, elders and children — around culture, faith, friendship and mutual support.",
  about_body_2:
    "We celebrate together, raise funds for causes that matter to our members, promote businesses run by our community, and stand beside anyone who needs a hand.",
  android_app_url: null,
  ios_app_url: null,
  contact_address: "CCGMs Centre, 24 Unity Road",
  contact_phone: "07700 900000",
  contact_email: "hello@ccgms.org",
  footer_blurb:
    "A community association bringing families together — supporting one another, celebrating our culture and building a stronger future for the next generation.",
  contact_whatsapp: null,
  show_contact_whatsapp: true,
  developer_whatsapp: null,
  whatsapp_message: null,
};

export const SITE_SETTINGS_KEY = ["site-settings"] as const;

export const siteSettingsQuery = queryOptions({
  queryKey: SITE_SETTINGS_KEY,
  staleTime: 5 * 60 * 1000,
  queryFn: async (): Promise<SiteSettings> => {
    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "org_name, hero_eyebrow, hero_title_line1, hero_title_line2, hero_intro, about_eyebrow, about_title, about_body_1, about_body_2, android_app_url, ios_app_url, contact_address, contact_phone, contact_email, footer_blurb, contact_whatsapp, show_contact_whatsapp, developer_whatsapp, whatsapp_message",
      )
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { ...DEFAULT_SITE_SETTINGS, ...(data ?? {}) } as SiteSettings;
  },
});

/** Build a wa.me link from a raw number, optionally prefilling a message. */
export function whatsappHref(raw: string | null | undefined, message?: string | null) {
  let digits = (raw ?? "").replace(/[^\d]/g, "");
  if (digits.startsWith("0")) digits = `44${digits.slice(1)}`;
  if (digits.length < 9) return null;
  const text = message?.trim();
  return text
    ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${digits}`;
}
