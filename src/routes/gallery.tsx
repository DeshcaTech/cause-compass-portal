import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { galleriesQuery, galleryPhotosQuery } from "@/lib/queries";
import galleryFallback from "@/assets/gallery-fallback.jpg";
import communityTogether from "@/assets/community-together.jpg";
import eventFallback from "@/assets/event-fallback.jpg";
import heroCommunity from "@/assets/hero-community.jpg";
import surveyFallback from "@/assets/survey-fallback.jpg";
import volunteerHero from "@/assets/volunteer-hero.jpg";
import { useT } from "@/lib/i18n";

const PLACEHOLDER_PHOTOS = [
  galleryFallback,
  communityTogether,
  eventFallback,
  heroCommunity,
  volunteerHero,
  surveyFallback,
];

function placeholdersFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  return PLACEHOLDER_PHOTOS.map(
    (_, i) => PLACEHOLDER_PHOTOS[(hash + i) % PLACEHOLDER_PHOTOS.length]!,
  );
}

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
  const t = useT();
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

  const tiles = useMemo(() => {
    const real = activePhotos.map((photo) => ({
      key: photo.id,
      src: photo.photo_url,
      caption: photo.caption ?? null,
    }));
    const fillers = placeholdersFor(activeId ?? "gallery")
      .slice(0, Math.max(0, 6 - real.length))
      .map((src, index) => ({ key: `placeholder-${index}`, src, caption: null }));
    return [...real, ...fillers];
  }, [activePhotos, activeId]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const open = lightboxIndex !== null;
  const currentTile = lightboxIndex !== null ? tiles[lightboxIndex] : undefined;

  const step = useCallback(
    (delta: number) =>
      setLightboxIndex((index) =>
        index === null || tiles.length === 0
          ? index
          : (index + delta + tiles.length) % tiles.length,
      ),
    [tiles.length],
  );

  useEffect(() => {
    setLightboxIndex(null);
  }, [activeId]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  return (
    <>
      <PageHeader
        eyebrow={t("Gallery")}
        title={t("Moments from our community")}
        description={t("Photos are grouped per event. The gallery marked as default opens first.")}
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
                {gallery.is_default ? <Badge variant="secondary">{t("Default")}</Badge> : null}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {gallery.event_date
                  ? new Date(gallery.event_date).toLocaleDateString("en-GB", {
                      month: "long",
                      year: "numeric",
                    })
                  : t("Undated")}
              </span>
            </button>
          ))}
        </aside>

        <div>
          <h2 className="text-2xl">{active?.title ?? t("Gallery")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{active?.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((tile, index) => (
              <button
                key={tile.key}
                type="button"
                onClick={() => setLightboxIndex(index)}
                aria-label={`${t("View photo")} ${index + 1} ${t("of")} ${tiles.length}`}
                className="group overflow-hidden rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <img
                  src={tile.src}
                  alt={tile.caption ?? active?.title ?? t("Community photo")}
                  loading="lazy"
                  className="aspect-[4/3] h-56 w-full object-cover transition-transform group-hover:scale-105"
                />
              </button>
            ))}
          </div>
          {activePhotos.length === 0 ? (
            <Card className="mt-4 border-dashed border-border">
              <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                <ImageIcon className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t("No photos uploaded to this gallery yet. Photos added by the admin appear here.")}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>

      <Dialog open={open} onOpenChange={(next) => !next && setLightboxIndex(null)}>
        <DialogContent className="max-h-[92dvh] gap-3 overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-left text-base">
              {currentTile?.caption ?? active?.title ?? t("Gallery")}
            </DialogTitle>
            <DialogDescription className="text-left">
              {`${(lightboxIndex ?? 0) + 1} ${t("of")} ${tiles.length}`}
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            {currentTile ? (
              <img
                src={currentTile.src}
                alt={currentTile.caption ?? active?.title ?? t("Community photo")}
                className="max-h-[60dvh] w-full rounded-xl border border-border bg-secondary object-contain"
              />
            ) : null}
            {tiles.length > 1 ? (
              <>
                <Button
                  variant="soft"
                  size="icon"
                  aria-label={t("Previous photo")}
                  onClick={() => step(-1)}
                  className="absolute left-2 top-1/2 min-h-11 min-w-11 -translate-y-1/2 shadow-md"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="soft"
                  size="icon"
                  aria-label={t("Next photo")}
                  onClick={() => step(1)}
                  className="absolute right-2 top-1/2 min-h-11 min-w-11 -translate-y-1/2 shadow-md"
                >
                  <ChevronRight />
                </Button>
              </>
            ) : null}
          </div>

          {tiles.length > 1 ? (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {tiles.map((tile, index) => (
                <button
                  key={`thumb-${tile.key}`}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`${t("View photo")} ${index + 1}`}
                  aria-current={index === lightboxIndex}
                  className={`shrink-0 overflow-hidden rounded-lg border transition-opacity ${
                    index === lightboxIndex
                      ? "border-primary"
                      : "border-border opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={tile.src} alt="" className="h-14 w-20 object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
