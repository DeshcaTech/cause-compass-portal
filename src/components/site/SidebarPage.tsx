import type { ReactNode } from "react";

import { SmartImage } from "@/components/site/SmartImage";
import { Badge } from "@/components/ui/badge";

type BannerProps = {
  image: string;
  title: string;
  description?: string | null;
};

/**
 * Shared "gallery style" page shell: a left sidebar of selectable sections and
 * a main panel led by a featured banner. Used across the public pages so they
 * all read the same way.
 */
export function SidebarPage({
  sidebar,
  banner,
  children,
}: {
  sidebar: ReactNode;
  banner?: BannerProps;
  children: ReactNode;
}) {
  return (
    <section className="container-page grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-2">{sidebar}</aside>
      <div>
        {banner ? (
          <div className="relative overflow-hidden rounded-2xl border border-border">
            <SmartImage
              src={banner.image}
              alt={banner.title}
              loading="eager"
              wrapperClassName="aspect-[16/7] w-full"
              className="size-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
              <h2 className="text-2xl text-white">{banner.title}</h2>
              {banner.description ? (
                <p className="mt-1 max-w-2xl text-sm text-white/85">{banner.description}</p>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className={banner ? "mt-4" : undefined}>{children}</div>
      </div>
    </section>
  );
}

export function SidebarSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2 pb-4">
      <p className="px-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

export function SidebarNavItem({
  image,
  icon,
  title,
  meta,
  badge,
  active,
  onClick,
}: {
  image?: string | null;
  icon?: ReactNode;
  title: string;
  meta?: string | null;
  badge?: string | null;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition-colors ${
        active ? "border-primary bg-accent" : "border-border bg-card hover:bg-secondary"
      }`}
    >
      {image ? (
        <SmartImage
          src={image}
          alt=""
          loading="lazy"
          wrapperClassName="size-14 shrink-0 rounded-lg"
          className="size-full object-cover"
        />
      ) : icon ? (
        <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="font-medium">{title}</span>
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
        </span>
        {meta ? (
          <span className="mt-1 block text-xs text-muted-foreground">{meta}</span>
        ) : null}
      </span>
    </button>
  );
}
