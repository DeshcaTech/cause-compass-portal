import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/site/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { announcementsQuery } from "@/lib/queries";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News & Announcements — CCGMs" },
      {
        name: "description",
        content:
          "Latest CCGMs community news, notices and announcements for members, families and partners.",
      },
      { property: "og:title", content: "News & Announcements — CCGMs" },
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
  const { data: news = [] } = useQuery(announcementsQuery);

  return (
    <div>
      <PageHeader
        eyebrow="Noticeboard"
        title="News & announcements"
        description="Updates, notices and community news from the CCGMs board."
      />
      <section className="container-page pb-16 md:pb-20">
        {news.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No announcements yet — check back soon for community news and updates.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Link key={item.id} to="/news/$id" params={{ id: item.id }} className="block">
              <Card className="h-full overflow-hidden border-border/70 transition-shadow hover:shadow-lg">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover"
                  />
                )}
                <CardContent className="p-6">
                  <p className="eyebrow text-terracotta">{formatDate(item.published_at)}</p>
                  <h2 className="mt-2 text-xl">{item.title}</h2>
                  {item.summary && (
                    <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
                  )}
                  {item.body && (
                    <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-foreground/80">
                      {item.body}
                    </p>
                  )}
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
