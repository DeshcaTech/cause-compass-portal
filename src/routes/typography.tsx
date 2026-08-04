import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { TypographyPreview } from "@/components/site/TypographyPreview";

export const Route = createFileRoute("/typography")({
  head: () => ({
    meta: [
      { title: "Typography Preview | CCGMs" },
      {
        name: "description",
        content:
          "Preview CCGMs headings, body text, navigation links, buttons and form labels at mobile, tablet and desktop breakpoints.",
      },
      { property: "og:title", content: "Typography Preview | CCGMs" },
      {
        property: "og:description",
        content:
          "Compare CCGMs typography and UI text sizing across mobile, tablet and desktop widths.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TypographyPage,
});

function TypographyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Design system"
        title="Typography preview"
        description="Headings, body copy, navigation links, buttons and form labels rendered at mobile, tablet and desktop widths."
      />
      <div className="container-page py-12">
        <TypographyPreview />
      </div>
    </>
  );
}
