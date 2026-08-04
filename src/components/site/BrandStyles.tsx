import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  brandQuery,
  fontStack,
  googleFontsHref,
  readableForeground,
  type Brand,
} from "@/lib/brand";

/**
 * Applies the admin-managed brand (colours, fonts, favicon) to the live
 * document. Rendered once from the root route.
 */
export function applyBrand(brand: Brand, doc: Document) {
  const root = doc.documentElement;
  root.style.setProperty("--primary", brand.primary_color);
  root.style.setProperty("--primary-foreground", readableForeground(brand.primary_color));
  root.style.setProperty("--accent", brand.accent_color);
  root.style.setProperty("--accent-foreground", readableForeground(brand.accent_color));
  root.style.setProperty("--ring", brand.primary_color);
  root.style.setProperty("--font-display", fontStack(brand.heading_font));
  root.style.setProperty("--font-body", fontStack(brand.body_font));

  let fonts = doc.getElementById("brand-fonts") as HTMLLinkElement | null;
  if (!fonts) {
    fonts = doc.createElement("link");
    fonts.id = "brand-fonts";
    fonts.rel = "stylesheet";
    doc.head.appendChild(fonts);
  }
  const href = googleFontsHref(brand.heading_font, brand.body_font);
  if (fonts.href !== href) fonts.href = href;

  const icon = doc.querySelector<HTMLLinkElement>('link[rel="icon"]');
  const nextIcon = brand.use_logo_favicon && brand.logo_url ? brand.logo_url : "/favicon.png";
  if (icon && icon.getAttribute("href") !== nextIcon) icon.setAttribute("href", nextIcon);
}

export function BrandStyles() {
  const { data: brand } = useQuery(brandQuery);

  useEffect(() => {
    if (brand) applyBrand(brand, document);
  }, [brand]);

  return null;
}
