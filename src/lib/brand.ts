import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type Brand = {
  logo_url: string | null;
  og_image_url: string | null;
  show_logo_header: boolean;
  show_logo_footer: boolean;
  use_logo_favicon: boolean;
  primary_color: string;
  accent_color: string;
  heading_font: string;
  body_font: string;
};

export const DEFAULT_BRAND: Brand = {
  logo_url: null,
  og_image_url: "/og-ccgms.jpg",
  show_logo_header: true,
  show_logo_footer: true,
  use_logo_favicon: true,
  primary_color: "#064e3b",
  accent_color: "#c9a84c",
  heading_font: "Outfit",
  body_font: "Figtree",
};

/** Google fonts offered in the brand settings panel. */
export const HEADING_FONTS = [
  "Outfit",
  "Sora",
  "Space Grotesk",
  "Playfair Display",
  "Lora",
  "Archivo",
] as const;

export const BODY_FONTS = [
  "Figtree",
  "Manrope",
  "Work Sans",
  "DM Sans",
  "Nunito Sans",
  "IBM Plex Sans",
] as const;

export function fontStack(name: string) {
  return `"${name}", ui-sans-serif, system-ui, sans-serif`;
}

export function googleFontsHref(heading: string, body: string) {
  const family = (name: string, weights: string) =>
    `family=${encodeURIComponent(name).replace(/%20/g, "+")}:wght@${weights}`;
  return `https://fonts.googleapis.com/css2?${family(heading, "400;500;600;700;800")}&${family(
    body,
    "300;400;500;600;700",
  )}&display=swap`;
}

/** Picks black or white text for a background colour so labels stay readable. */
export function readableForeground(hex: string) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#ffffff";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
  return luminance > 0.45 ? "#101615" : "#fdfcf7";
}

export const brandQuery = queryOptions({
  queryKey: ["brand-settings"],
  staleTime: 5 * 60 * 1000,
  queryFn: async (): Promise<Brand> => {
    const { data, error } = await supabase
      .from("brand_settings")
      .select(
        "logo_url, og_image_url, show_logo_header, show_logo_footer, use_logo_favicon, primary_color, accent_color, heading_font, body_font",
      )
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return DEFAULT_BRAND;
    return { ...DEFAULT_BRAND, ...data } as Brand;
  },
});
