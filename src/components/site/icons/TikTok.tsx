import type { SVGProps } from "react";

/** TikTok glyph — lucide-react has no TikTok icon, so we ship our own. */
export function TikTok(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M16.5 3c.32 1.6 1.18 2.97 2.5 3.78v2.06a6.4 6.4 0 0 1-2.5-.62v6.43a5.4 5.4 0 1 1-5.4-5.4c.2 0 .4.02.6.05v2.2a3.2 3.2 0 1 0 2.6 3.15V3h2.2Z" />
    </svg>
  );
}
