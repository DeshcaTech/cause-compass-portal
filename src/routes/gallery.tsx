import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { galleriesQuery, galleryPhotosQuery } from "@/lib/queries";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — CCGMs Photos by Event" },
      {
        name: "description",
        content: "Photos from CCGMs gatherings, grouped by event — gala nights, festivals and community days.",
      },
      { property: "og:title", content: "Gallery — CCGMs Photos by Event" },
      { property: "og:description", content: "Browse community photos grouped by event." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { data: rawGalleries = [] } = useQuery(galleriesQuery);
  const galleries = [...rawGalleries].sort(
    (a, b) => Number(b.is_default) - Number(a.is_default),
  );
  const { data: photos = [] } = useQuery(galleryPhotosQuery);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeId && galleries.length > 0) {
      setActiveId((galleries.find((g) => g.is_default) ?? galleries[0])!.id);
    }
  }, [galleries, activeId]);

  const active = galleries.find((g) => g.id === activeId) ?? null;
  const activePhotos = photos.filter((p) => p.gallery_id === activeId);

  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Moments from our community"
        description="Photos are grouped per event. The gallery marked as default opens first."
      />
      <section className="container-page grid gap-8 py-14 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          {galleries.map((gallery) => (
            <button
              key={gallery.id}
              type="button"
              onClick={() => setActiveId(gallery.id)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                activeId === gallery.id
                  ? "border-primary bg-accent"
                  : "border-border bg-card hover:bg-secondary"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-medium">{gallery.title}</span>
                {gallery.is_default ? <Badge variant="secondary">Default</Badge> : null}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {gallery.event_date
                  ? new Date(gallery.event_date).toLocaleDateString("en-GB", {
                      month: "long",
                      year: "numeric",
                    })
                  : "Undated"}
              </span>
            </button>
          ))}
        </aside>

        <div>
          <h2 className="text-2xl">{active?.title ?? "Gallery"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{active?.description}</p>

          {activePhotos.length === 0 ? (
            <Card className="mt-6 border-dashed border-border">
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <ImageIcon className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No photos uploaded to this gallery yet. Photos added by the admin appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activePhotos.map((photo) => (
                <figure key={photo.id} className="overflow-hidden rounded-xl border border-border">
                  <img
                    src={photo.photo_url}
                    alt={photo.caption ?? active?.title ?? "Community photo"}
                    loading="lazy"
                    className="h-56 w-full object-cover transition-transform hover:scale-105"
                  />
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}