import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { SidebarNavItem, SidebarPage } from "@/components/site/SidebarPage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
      { property: "og:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { name: "twitter:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
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
  // "current" or a past term label.
  const [term, setTerm] = useState<string>("current");
  const showing = term === "current" ? current : past.filter((m) => m.term_label === term);
  const bannerPhoto =
    showing.find((m) => m.photo_url)?.photo_url ?? personFallback;

  return (
    <>
      <PageHeader
        eyebrow={t("About CCGMs")}
        title={t("Our board")}
        description={t("The current executive team is shown by default. Switch to past teams to see who served before.")}
      />
      <SidebarPage
        banner={{
          image: bannerPhoto,
          title: term === "current" ? t("Current team") : term,
          description: t("The current executive team is shown by default. Switch to past teams to see who served before."),
        }}
        sidebar={(
          <>
            <SidebarNavItem
              image={current.find((m) => m.photo_url)?.photo_url ?? personFallback}
              title={t("Current team")}
              meta={`${current.length} ${t("members")}`}
              active={term === "current"}
              onClick={() => setTerm("current")}
            />
            {pastTerms.map((label) => (
              <SidebarNavItem
                key={label}
                image={
                  past.find((m) => m.term_label === label && m.photo_url)?.photo_url ??
                  personFallback
                }
                title={label}
                meta={`${past.filter((m) => m.term_label === label).length} ${t("members")}`}
                active={term === label}
                onClick={() => setTerm(label)}
              />
            ))}
          </>
        )}
      >
        <MemberGrid members={showing} />
      </SidebarPage>
    </>
  );
}