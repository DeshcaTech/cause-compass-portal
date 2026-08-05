import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { FilterPage, FilterSelect } from "@/components/site/FilterPage";
import { Lightbox } from "@/components/site/Lightbox";
import { SmartImage } from "@/components/site/SmartImage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { galleriesQuery, galleryPhotosQuery } from "@/lib/queries";
import galleryFallback from "@/assets/gallery-fallback.jpg";
import communityTogether from "@/assets/community-together.jpg";
import eventFallback from "@/assets/event-fallback.jpg";
import heroCommunity from "@/assets/hero-community.jpg";
import surveyFallback from "@/assets/survey-fallback.jpg";
import volunteerHero from "@/assets/volunteer-hero.jpg";
import { useT } from "@/lib/i18n";
import { searchString, useSearchFilter } from "@/lib/use-search-filter";

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
  validateSearch: (search: Record<string, unknown>): { gallery?: string | undefined} => ({
    gallery: searchString(search, "gallery"),
  }),
  head: () => ({
    meta: [
      { title: "Gallery — CCGMs Photos by Event" },
      {
        name: "description",
        content: "Photos from CCGMs gatherings, grouped by event — gala nights, festivals and community days.",
      },
      { property: "og:title", content: "Gallery — CCGMs Photos by Event" },
      { property: "og:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { name: "twitter:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
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
  const [galleryParam, setActiveId] = useSearchFilter("gallery", "");
  // No URL selection yet: open the admin-chosen default album.
  const defaultId = (galleries.find((g) => g.is_default) ?? galleries[0])?.id ?? null;
  const activeId = galleryParam || defaultId;

  const active = galleries.find((g) => g.id === activeId) ?? null;
  const activePhotos = photos.filter((p) => p.gallery_id === activeId);

  // Main photo: the album cover set in the admin panel, else its first photo,
  // else a stable placeholder so every album still looks complete.
  const mainPhoto = (galleryId: string, cover: string | null) =>
    cover ??
    photos.find((p) => p.gallery_id === galleryId)?.photo_url ??
    placeholdersFor(galleryId)[0]!;

  const tiles = useMemo(() => {
    const real = activePhotos.map((photo) => ({
      key: photo.id,
      src: photo.photo_url,
      caption: photo.caption ?? null,
    }));
    // The album's main photo leads the viewer when it isn't already a photo.
    const cover = active?.cover_url;
    if (cover && !real.some((tile) => tile.src === cover)) {
      real.unshift({ key: `cover-${active!.id}`, src: cover, caption: active!.title });
    }
    const fillers = placeholdersFor(activeId ?? "gallery")
      .slice(0, Math.max(0, 6 - real.length))
      .map((src, index) => ({ key: `placeholder-${index}`, src, caption: null }));
    return [...real, ...fillers];
  }, [activePhotos, activeId, active?.cover_url, active?.id, active?.title]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setLightboxIndex(null);
  }, [activeId]);

  return (
    <>
      <PageHeader
        eyebrow={t("Gallery")}
        title={t("Moments from our community")}
        description={t("Photos are grouped per event — pick an album to browse its moments.")}
      />
      <FilterPage
        filters={(
          <FilterSelect
            label={t("Gallery")}
            value={activeId ?? ""}
            onChange={setActiveId}
            options={galleries.map((gallery) => ({
              value: gallery.id,
              label: gallery.title,
              meta: gallery.event_date
                ? new Date(gallery.event_date).toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })
                : t("Undated"),
            }))}
          />
        )}
      >
        <div>
          {active ? (
            <div className="relative overflow-hidden rounded-2xl border border-border">
              <SmartImage
                src={mainPhoto(active.id, active.cover_url)}
                alt={`${active.title} — ${t("main photo")}`}
                loading="eager"
                wrapperClassName="aspect-[16/7] w-full"
                className="size-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                <h2 className="text-2xl text-white">{active.title}</h2>
                {active.description ? (
                  <p className="mt-1 max-w-2xl text-sm text-white/85">{active.description}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <h2 className="text-2xl">{t("Gallery")}</h2>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((tile, index) => (
              <button
                key={tile.key}
                type="button"
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setLightboxIndex(index);
                }}
                aria-label={`${t("View photo")} ${index + 1} ${t("of")} ${tiles.length}`}
                aria-haspopup="dialog"
                className="group overflow-hidden rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <SmartImage
                  src={tile.src}
                  alt={tile.caption ?? active?.title ?? t("Community photo")}
                  loading="lazy"
                  wrapperClassName="aspect-[4/3] h-56 w-full"
                  className="size-full object-cover transition-transform group-hover:scale-105"
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
      </FilterPage>

      <Lightbox
        tiles={tiles}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => {
          setLightboxIndex(null);
          // Radix restores focus to the last focused element; make it explicit
          // so the originating thumbnail is always the one focused.
          window.setTimeout(() => triggerRef.current?.focus(), 0);
        }}
        fallbackTitle={active?.title ?? t("Community photo")}
      />
    </>
  );
}
