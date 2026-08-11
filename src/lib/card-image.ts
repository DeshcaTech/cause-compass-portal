import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";

import { DEFAULT_SITE_SETTINGS, siteSettingsQuery } from "@/lib/site-settings";

/** A6 paper, landscape (148 × 105 mm). */
export const A6_LANDSCAPE = 1.414;

/**
 * Shape of every picture tile on cards across the site. Admins pick the
 * width ÷ height ratio in the backend; A6 landscape is the default.
 */
export function useCardAspect(): CSSProperties {
  const { data } = useQuery(siteSettingsQuery);
  const ratio = Number(data?.card_image_ratio ?? DEFAULT_SITE_SETTINGS.card_image_ratio);
  return { aspectRatio: Number.isFinite(ratio) && ratio > 0 ? ratio : A6_LANDSCAPE };
}
