import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { announcementQuery } from "@/lib/queries";

export const Route = createFileRoute("/news/$id")({
  head: () => ({
    meta: [
      { title: "News article — CCGMs" },
      {
        name: "description",
        content: "Read the full CCGMs community announcement, notice or news update.",
      },
      { property: "og:title", content: "News article — CCGMs" },
      {
        property: "og:description",
        content: "Read the full CCGMs community announcement, notice or news update.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewsDetailPage,
});

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function NewsDetailPage() {
  const { id } = Route.useParams();
  const { data: item, isPending } = useQuery(announcementQuery(id));

  return (
    <article className="container-page py-14 md:py-20">
      <Button asChild variant="soft" size="sm">
        <Link to="/news">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All news
        </Link>
      </Button>

      {isPending ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading article…</p>
      ) : !item ? (
        <p className="mt-10 text-sm text-muted-foreground">
          This announcement is no longer available.
        </p>
      ) : (
        <div className="mt-8 max-w-3xl">
          <p className="eyebrow text-terracotta">{formatDate(item.published_at)}</p>
          <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{item.title}</h1>
          {item.summary && (
            <p className="mt-4 text-lg text-muted-foreground">{item.summary}</p>
          )}
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.title}
              className="mt-8 aspect-[16/9] w-full rounded-xl object-cover"
            />
          )}
          {item.body && (
            <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-foreground/85">
              {item.body}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
