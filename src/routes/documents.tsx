import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { SidebarNavItem, SidebarPage } from "@/components/site/SidebarPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { documentsQuery } from "@/lib/queries";
import { useT } from "@/lib/i18n";
import documentsBanner from "@/assets/community-together.jpg";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Downloads — CCGMs Documents" },
      {
        name: "description",
        content:
          "Download the CCGMs constitution, membership forms, annual reports and community policies.",
      },
      { property: "og:title", content: "Downloads — CCGMs Documents" },
      { property: "og:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { name: "twitter:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      {
        property: "og:description",
        content: "Constitution, forms, reports and policies available to download.",
      },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const t = useT();
  const { data: documents = [] } = useQuery(documentsQuery);
  const categories = Array.from(new Set(documents.map((d) => d.category)));
  const [active, setActive] = useState<string>("All");
  const filters = ["All", ...categories];
  const visible =
    active === "All" ? documents : documents.filter((d) => d.category === active);

  return (
    <>
      <PageHeader
        eyebrow={t("About CCGMs")}
        title={t("Download centre")}
        description={t("Official documents, forms and reports, free to download for members and the public.")}
      />
      <SidebarPage
        banner={{
          image: documentsBanner,
          title: active === "All" ? t("All documents") : active,
          description: t("Official documents, forms and reports, free to download."),
        }}
        sidebar={filters.map((category) => (
          <SidebarNavItem
            key={category}
            icon={<FileText className="size-5" />}
            title={category === "All" ? t("All") : category}
            meta={`${
              category === "All"
                ? documents.length
                : documents.filter((d) => d.category === category).length
            } ${t("documents")}`}
            active={active === category}
            onClick={() => setActive(category)}
          />
        ))}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {visible.map((doc) => (
            <Card key={doc.id} className="flex h-full flex-col border-border/70">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-medium leading-snug">{doc.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{doc.description}</p>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                  <Badge variant="secondary">{doc.category}</Badge>
                  <Button asChild variant="soft" size="sm">
                    <a href={doc.file_url} download>
                      <Download /> {doc.file_type ?? t("Download")}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">{t("No documents in this category yet.")}</p>
        ) : null}
      </SidebarPage>
    </>
  );
}
