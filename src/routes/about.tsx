import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Quote } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { boardQuery, presidentQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About CCGMs — President's Message" },
      {
        name: "description",
        content:
          "Read the president's message and meet the executive board leading the CCGMs community association.",
      },
      { property: "og:title", content: "About CCGMs — President's Message" },
      {
        property: "og:description",
        content: "The president's message and the team leading CCGMs.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: president } = useQuery(presidentQuery);
  const { data: board = [] } = useQuery(boardQuery);
  const current = board.filter((m) => m.is_current).slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow="About CCGMs"
        title="A message from our President"
        description="Who we are, what we stand for, and the people who serve the community."
      />

      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <Card className="h-fit border-border/70 bg-primary text-primary-foreground">
            <CardContent className="p-7">
              <Quote className="size-8 text-gold" />
              <p className="mt-5 font-display text-2xl">{president?.president_name ?? "—"}</p>
              <p className="text-sm text-primary-foreground/70">{president?.title}</p>
            </CardContent>
          </Card>

          <article className="space-y-5 text-base leading-relaxed text-foreground/85">
            {(president?.message ?? "").split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </article>
        </div>
      </section>

      <section className="surface-panel border-y border-border py-16">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-terracotta">Leadership</p>
              <h2 className="mt-2 text-3xl md:text-4xl">The board team</h2>
            </div>
            <Button asChild variant="hero">
              <Link to="/board">Meet the full board</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {current.map((member) => (
              <Card key={member.id} className="border-border/70">
                <CardContent className="p-6">
                  <p className="font-display text-lg">{member.full_name}</p>
                  <p className="text-sm text-primary">{member.role_title}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}