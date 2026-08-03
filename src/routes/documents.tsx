import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <>
      <PageHeader
        eyebrow="About CCGMs"
        title="Download centre"
        description="Official documents, forms and reports, free to download for members and the public."
      />
      <section className="container-page space-y-12 py-14">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="text-2xl">{category}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {documents
                .filter((d) => d.category === category)
                .map((doc) => (
                  <Card key={doc.id} className="border-border/70">
                    <CardContent className="flex items-start gap-4 p-6">
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                        <FileText className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{doc.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{doc.description}</p>
                      </div>
                      <Button asChild variant="soft" size="sm">
                        <a href={doc.file_url} download>
                          <Download /> {doc.file_type ?? "File"}
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}