import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { boardQuery, type BoardMember } from "@/lib/queries";
import { useT } from "@/lib/i18n";
import personFallback from "@/assets/person-fallback.jpg";

export const Route = createFileRoute("/board")({
  head: () => ({
    meta: [
      { title: "CCGMs Board — Current and Past Teams" },
      {
        name: "description",
        content:
          "Meet the current CCGMs executive board and browse the teams who served in previous terms.",
      },
      { property: "og:title", content: "CCGMs Board — Current and Past Teams" },
      {
        property: "og:description",
        content: "The current CCGMs board and the teams who served before them.",
      },
    ],
  }),
  component: BoardPage,
});

function MemberGrid({ members }: { members: BoardMember[] }) {
  const t = useT();
  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("No members recorded for this term yet.")}</p>;
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <Card key={member.id} className="border-border/70">
          <CardContent className="p-6">
            <img
              src={member.photo_url ?? personFallback}
              alt={member.full_name}
              loading="lazy"
              className="size-16 rounded-full object-cover"
            />
            <p className="mt-4 font-display text-lg">{member.full_name}</p>
            <p className="text-sm text-primary">{member.role_title}</p>
            <Badge variant="secondary" className="mt-3">
              {member.term_label}
            </Badge>
            {member.bio ? (
              <p className="mt-3 text-sm text-muted-foreground">{member.bio}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BoardPage() {
  const t = useT();
  const { data: board = [] } = useQuery(boardQuery);
  const current = board.filter((m) => m.is_current);
  const past = useMemo(() => board.filter((m) => !m.is_current), [board]);
  const pastTerms = useMemo(
    () => Array.from(new Set(past.map((m) => m.term_label))).sort().reverse(),
    [past],
  );
  const [term, setTerm] = useState<string | null>(null);
  const activeTerm = term ?? pastTerms[0] ?? null;

  return (
    <>
      <PageHeader
        eyebrow={t("About CCGMs")}
        title={t("Our board")}
        description={t("The current executive team is shown by default. Switch to past teams to see who served before.")}
      />
      <section className="container-page py-14">
        <Tabs defaultValue="current">
          <TabsList>
            <TabsTrigger value="current">{t("Current team")}</TabsTrigger>
            <TabsTrigger value="past">{t("Past teams")}</TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="mt-8">
            <MemberGrid members={current} />
          </TabsContent>
          <TabsContent value="past" className="mt-8">
            <div className="mb-6 flex flex-wrap gap-2">
              {pastTerms.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTerm(label)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    activeTerm === label
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <MemberGrid members={past.filter((m) => m.term_label === activeTerm)} />
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}