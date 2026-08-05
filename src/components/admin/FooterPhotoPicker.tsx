import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { footerPhotosQuery, galleriesQuery, galleryPhotosQuery } from "@/lib/queries";
import { Button } from "@/components/ui/button";

const MAX_FOOTER_PHOTOS = 10;

/**
 * Lets an admin tick photos straight from the gallery albums into the footer
 * pool (max 100). Ticking a selected photo removes it from the footer again.
 */
export function FooterPhotoPicker() {
  const queryClient = useQueryClient();
  const { data: galleries = [] } = useQuery(galleriesQuery);
  const { data: photos = [] } = useQuery(galleryPhotosQuery);
  const { data: footerPhotos = [] } = useQuery(footerPhotosQuery);
  const [album, setAlbum] = useState("all");

  const selectedUrls = useMemo(
    () => new Set(footerPhotos.map((p) => p.photo_url)),
    [footerPhotos],
  );

  const visible = album === "all" ? photos : photos.filter((p) => p.gallery_id === album);

  const toggle = useMutation({
    mutationFn: async (photo: { photo_url: string; caption: string | null }) => {
      const existing = footerPhotos.find((p) => p.photo_url === photo.photo_url);
      if (existing) {
        const { error } = await supabase.from("footer_photos").delete().eq("id", existing.id);
        if (error) throw error;
        return "removed" as const;
      }
      if (footerPhotos.length >= MAX_FOOTER_PHOTOS) {
        throw new Error(`You can select at most ${MAX_FOOTER_PHOTOS} footer photos.`);
      }
      const { error } = await supabase.from("footer_photos").insert({
        photo_url: photo.photo_url,
        caption: photo.caption,
        sort_order: footerPhotos.length,
      });
      if (error) throw error;
      return "added" as const;
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["footer_photos"] });
      toast.success(result === "added" ? "Added to the footer." : "Removed from the footer.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div>
      <h2 className="text-xl">Pick footer photos from the gallery</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tick photos to use them in the footer — up to {MAX_FOOTER_PHOTOS}. Six of the selected
        photos appear at random on every visit. Selected: {footerPhotos.length}/{MAX_FOOTER_PHOTOS}.
      </p>
      <select
        className="mt-3 h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 text-sm"
        value={album}
        onChange={(event) => setAlbum(event.target.value)}
        aria-label="Filter by album"
      >
        <option value="all">All albums</option>
        {galleries.map((gallery) => (
          <option key={gallery.id} value={gallery.id}>
            {gallery.title}
          </option>
        ))}
      </select>

      {visible.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No gallery photos yet — add photos to an album first.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {visible.map((photo) => {
            const selected = selectedUrls.has(photo.photo_url);
            return (
              <button
                key={photo.id}
                type="button"
                disabled={toggle.isPending}
                onClick={() =>
                  toggle.mutate({ photo_url: photo.photo_url, caption: photo.caption ?? null })
                }
                aria-pressed={selected}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                  selected ? "border-primary" : "border-border hover:border-muted-foreground"
                }`}
              >
                <img
                  src={photo.photo_url}
                  alt={photo.caption ?? "Gallery photo"}
                  loading="lazy"
                  className="size-full object-cover object-center"
                />
                {selected ? (
                  <span className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-4" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {footerPhotos.length > 0 ? (
        <Button
          variant="soft"
          size="sm"
          className="mt-4"
          disabled={toggle.isPending}
          onClick={async () => {
            const ids = footerPhotos.map((p) => p.id);
            const { error } = await supabase.from("footer_photos").delete().in("id", ids);
            if (error) {
              toast.error(error.message);
              return;
            }
            void queryClient.invalidateQueries({ queryKey: ["footer_photos"] });
            toast.success("Footer selection cleared.");
          }}
        >
          Clear footer selection
        </Button>
      ) : null}
    </div>
  );
}
