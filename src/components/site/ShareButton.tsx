import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { withShareMeta } from "@/lib/share-meta";

/**
 * Shares a deep link to the current item — native share sheet on mobile,
 * clipboard copy everywhere else.
 */
export function ShareButton({
  title,
  path,
  image,
  description,
  label,
  className,
  variant = "soft",
}: {
  title: string;
  /** Path with query, e.g. "/jobs?job=123". */
  path: string;
  /** Picture shown in the link preview (absolute URL or site-relative path). */
  image?: string | null;
  description?: string | null;
  label?: string;
  className?: string;
  variant?: "soft" | "outline" | "ghost";
}) {
  const t = useT();

  async function share() {
    const withMeta = withShareMeta(path, title, image);
    const url = typeof window === "undefined" ? withMeta : `${window.location.origin}${withMeta}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url, ...(description ? { text: description } : {}) });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success(t("Link copied — paste it to share."));
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={share}
      aria-label={`${t("Share")}: ${title}`}
    >
      <Share2 aria-hidden="true" /> {label ?? t("Share")}
    </Button>
  );
}
