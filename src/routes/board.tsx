import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { FilterPage, FilterSelect } from "@/components/site/FilterPage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { boardQuery, type BoardMember } from "@/lib/queries";
import { useT } from "@/lib/i18n";
import { searchString, useSearchFilter } from "@/lib/use-search-filter";
import personFallback from "@/assets/person-fallback.jpg";
import boardM1 from "@/assets/board/m1.jpg";
import boardM2 from "@/assets/board/m2.jpg";
import boardM3 from "@/assets/board/m3.jpg";
import boardM4 from "@/assets/board/m4.jpg";
import boardM5 from "@/assets/board/m5.jpg";
import boardF1 from "@/assets/board/f1.jpg";
import boardF2 from "@/assets/board/f2.jpg";
import boardF3 from "@/assets/board/f3.jpg";
import boardF4 from "@/assets/board/f4.jpg";
import boardF5 from "@/assets/board/f5.jpg";

const MALE_PORTRAITS = [boardM1, boardM2, boardM3, boardM4, boardM5];
const FEMALE_PORTRAITS = [boardF1, boardF2, boardF3, boardF4, boardF5];
const FEMALE_HINTS = [
  "rose",
  "alice",
  "marie",
  "claire",
  "grace",
  "linda",
  "mary",
  "anne",
  "sarah",
  "esther",
  "julie",
  "brenda",
];

function hash(value: string) {
  let total = 0;
  for (let i = 0; i < value.length; i += 1) total = (total * 31 + value.charCodeAt(i)) >>> 0;
  return total;
}

function portraitFor(member: BoardMember) {
  if (member.photo_url) return member.photo_url;
  const name = member.full_name.toLowerCase();
  const pool = FEMALE_HINTS.some((hint) => name.includes(hint)) ? FEMALE_PORTRAITS : MALE_PORTRAITS;
  return pool[hash(member.id) % pool.length] ?? personFallback;
}

export const Route = createFileRoute("/board")({
  validateSearch: (search: Record<string, unknown>): { team?: string | undefined} => ({
    team: searchString(search, "team"),
  }),
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
              src={portraitFor(member)}
              alt={member.full_name}
              loading="lazy"
              className="size-16 rounded-full object-cover object-top"
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
  const [term, setTerm] = useSearchFilter("team", "current");
  const showing = term === "current" ? current : past.filter((m) => m.term_label === term);
  return (
    <>
      <PageHeader
        eyebrow={t("About CCGMs")}
        title={t("Our board")}
        description={t("The current executive team is shown by default. Switch to past teams to see who served before.")}
      />
      <FilterPage
        filters={(
          <FilterSelect
            label={t("Team")}
            value={term}
            onChange={setTerm}
            options={[
              {
                value: "current",
                label: t("Current team"),
                meta: `${current.length} ${t("members")}`,
              },
              ...pastTerms.map((label) => ({
                value: label,
                label,
                meta: `${past.filter((m) => m.term_label === label).length} ${t("members")}`,
              })),
            ]}
          />
        )}
      >
        <MemberGrid members={showing} />
      </FilterPage>
    </>
  );
}