import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Pin, Search, Star } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { FilterPage, FilterSelect } from "@/components/site/FilterPage";
import newsFallback from "@/assets/news-fallback.jpg";
import { NewsSubscribe } from "@/components/site/NewsSubscribe";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { announcementsQuery } from "@/lib/queries";
import { useT } from "@/lib/i18n";
import { useDyn } from "@/lib/i18n/dynamic";
import { searchString, useSearchFilter } from "@/lib/use-search-filter";

export const Route = createFileRoute("/news/")({
  validateSearch: (search: Record<string, unknown>): { view?: string | undefined; q?: string | undefined} => ({
    view: searchString(search, "view"),
    q: searchString(search, "q"),
  }),
  head: () => ({
    meta: [
      { title: "News & Announcements — CCGMs" },
      {
        name: "description",
        content:
          "Latest CCGMs community news, notices and announcements for members, families and partners.",
      },
      { property: "og:title", content: "News & Announcements — CCGMs" },
      { property: "og:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { name: "twitter:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      {
        property: "og:description",
        content: "Community news, notices and announcements from CCGMs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewsPage,
});

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function NewsPage() {
  const t = useT();
  const dyn = useDyn();
  const { data: news = [] } = useQuery(announcementsQuery);
  const [search, setSearch] = useSearchFilter("q", "");
  const [view, setView] = useSearchFilter("view", "all");
  const featuredOnly = view === "featured";
  const pinnedOnly = view === "pinned";

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return news
      .filter((item) => (featuredOnly ? item.is_featured : true))
      .filter((item) => (pinnedOnly ? item.is_pinned : true))
      .filter((item) =>
        term
          ? [item.title, item.summary, item.body]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(term))
          : true,
      );
  }, [news, search, featuredOnly, pinnedOnly]);

  const featuredCount = news.filter((item) => item.is_featured).length;
  const pinnedCount = news.filter((item) => item.is_pinned).length;

  return (
    <div>
      <PageHeader
        eyebrow={t("Noticeboard")}
        title={t("News & announcements")}
        description={t("Updates, notices and community news from the CCGMs board.")}
      />
      <FilterPage
        filters={(
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="sm:min-w-[200px]">
              <FilterSelect
                label={t("Category")}
                value={pinnedOnly ? "pinned" : featuredOnly ? "featured" : "all"}
                onChange={(value) => setView(value)}
                options={[
                  { value: "all", label: t("All news"), meta: `${news.length}` },
                  { value: "pinned", label: t("Pinned"), meta: `${pinnedCount}` },
                  { value: "featured", label: t("Featured"), meta: `${featuredCount}` },
                ]}
              />
            </div>
            <div className="relative flex-1">
              <Label className="mb-1.5 block">{t("Search")}</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("Search news by title, summary or text")}
                  aria-label={t("Search news")}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        )}
      >

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {news.length === 0
              ? t("No announcements yet — check back soon for community news and updates.")
              : t("No news matches your search.")}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((item) => (
              <Link key={item.id} to="/news/$id" params={{ id: item.id }} className="block">
                <Card
                  className={`h-full overflow-hidden border-border/70 transition-shadow hover:shadow-lg ${
                    item.is_pinned ? "ring-2 ring-primary/30" : ""
                  }`}
                >
                  {item.is_pinned && (
                    <img
                      src={item.image_url || newsFallback}
                      alt={dyn(item.title)}
                      loading="lazy"
                      className="aspect-[16/9] w-full object-cover"
                    />
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <p className="eyebrow text-terracotta">{formatDate(item.published_at)}</p>
                      {item.is_pinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-terracotta/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-terracotta">
                          <Pin className="size-3 fill-current" /> {t("Pinned")}
                        </span>
                      )}
                      {item.is_featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                          <Star className="size-3 fill-current" /> {t("Featured")}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 text-xl">{dyn(item.title)}</h2>
                    {item.summary && (
                      <p className="mt-2 text-sm text-muted-foreground">{dyn(item.summary)}</p>
                    )}
                    {item.body && (
                      <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-foreground/80">
                        {dyn(item.body)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <NewsSubscribe />
        </div>
      </FilterPage>
    </div>
  );
}
