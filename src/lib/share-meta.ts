/**
 * Shared links carry the popup's own title and picture so previews on
 * WhatsApp, Facebook and X show that item instead of the generic page card.
 */
export const SHARE_TITLE_PARAM = "st";
export const SHARE_IMAGE_PARAM = "si";

type Meta = Record<string, string>;

/** Appends the share title / image params to a popup deep link. */
export function withShareMeta(path: string, title?: string | null, image?: string | null) {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  if (title) params.set(SHARE_TITLE_PARAM, title.slice(0, 120));
  if (image) params.set(SHARE_IMAGE_PARAM, image);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

function absolute(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window !== "undefined") return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
  return url;
}

/**
 * Overrides the route's default title / og:title / og:image with the shared
 * item's own values when the link carries them.
 */
export function mergeShareMeta(meta: Meta[], search: Record<string, unknown> | undefined): Meta[] {
  const rawTitle = search?.[SHARE_TITLE_PARAM];
  const rawImage = search?.[SHARE_IMAGE_PARAM];
  const title = typeof rawTitle === "string" && rawTitle.trim() ? rawTitle.trim() : null;
  const image = typeof rawImage === "string" && rawImage.trim() ? absolute(rawImage.trim()) : null;
  if (!title && !image) return meta;

  return meta.map((entry) => {
    if (title && "title" in entry) return { ...entry, title };
    if (title && entry.property === "og:title") return { ...entry, content: title };
    if (title && entry.name === "twitter:title") return { ...entry, content: title };
    if (image && (entry.property === "og:image" || entry.name === "twitter:image")) {
      return { ...entry, content: image };
    }
    return entry;
  });
}