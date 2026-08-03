import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { documentsQuery } from "@/lib/queries";

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
      {
        property: "og:description",
        content: "Constitution, forms, reports and policies available to download.",
      },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { data: documents = [] } = useQuery(documentsQuery);
  const categories = Array.from(new Set(documents.map((d) => d.category)));
  const [active, setActive] = useState<string>("All");
  const filters = ["All", ...categories];
  const visible =
    active === "All" ? documents : documents.filter((d) => d.category === active);

  return (
    <>
      <PageHeader
        eyebrow="About CCGMs"
        title="Download centre"
        description="Official documents, forms and reports, free to download for members and the public."
      />
      <section className="container-page py-14">
        <div className="flex flex-wrap gap-2">
          {filters.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                active === category
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border/70 bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                      <Download /> {doc.file_type ?? "Download"}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No documents in this category yet.</p>
        ) : null}
      </section>
    </>
  );
}