import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, Quote, Sparkles, Target } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { boardQuery, presidentQuery } from "@/lib/queries";
import { useT } from "@/lib/i18n";
import presidentFallback from "@/assets/president-fallback.jpg";

const coreValues = [
  {
    title: "Family",
    body: "We are a family of families — nurturing bonds across parents, children, students and elders.",
  },
  {
    title: "Community",
    body: "We show up for one another, celebrating together and standing beside anyone who needs a hand.",
  },
  {
    title: "Culture",
    body: "We honour and share our heritage, keeping traditions alive for the generations to come.",
  },
  {
    title: "Generosity",
    body: "We give our time, skills and resources so that no one in our community faces hardship alone.",
  },
  {
    title: "Integrity",
    body: "We lead with honesty and transparency, earning the trust of every member we serve.",
  },
  {
    title: "Faith",
    body: "We are guided by shared faith and values that anchor our actions and unite our purpose.",
  },
];

const SITE_ORIGIN = "https://cause-compass-portal.lovable.app";
const ABOUT_URL = `${SITE_ORIGIN}/about`;

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title:
          "About CCGMs — President's Message, Mission & Board | Cause Compass",
      },
      {
        name: "description",
        content:
          "Discover the CCGMs community: our president's message, mission, vision, core values, and the executive board leading our community association.",
      },
      { property: "og:title", content: "About CCGMs — President's Message, Mission & Board" },
      {
        property: "og:description",
        content:
          "Read the president's message, explore our mission, vision and core values, and meet the executive board of the CCGMs community association.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: ABOUT_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "About CCGMs — President's Message, Mission & Board" },
      {
        name: "twitter:description",
        content:
          "Read the president's message, explore our mission, vision and core values, and meet the CCGMs board.",
      },
    ],
    links: [{ rel: "canonical", href: ABOUT_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About CCGMs",
          url: ABOUT_URL,
          description:
            "The president's message, mission, vision, core values, and executive board of the CCGMs community association.",
          mainEntity: {
            "@type": "Organization",
            name: "CCGMs — Cause Compass",
            url: SITE_ORIGIN,
          },
        }),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const t = useT();
  const { data: president } = useQuery(presidentQuery);
  const { data: board = [] } = useQuery(boardQuery);
  const current = board.filter((m) => m.is_current).slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow={t("About CCGMs")}
        title={t("A message from our President")}
        description={t("Who we are, what we stand for, and the people who serve the community.")}
      />

      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <Card className="h-fit overflow-hidden border-border/70 bg-primary text-primary-foreground">
            <img
              src={president?.photo_url ?? presidentFallback}
              alt={president?.president_name ?? t("CCGMs President")}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
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

      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="h-full border-border/70">
            <CardContent className="p-7">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Target className="size-5" />
              </span>
              <h2 className="mt-5 text-2xl">{t("Our Mission")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("To unite and uplift our community by bringing families together across generations — celebrating our culture, supporting one another through hardship, and building a future where every member feels valued, connected and never alone.")}
              </p>
            </CardContent>
          </Card>
          <Card className="h-full border-border/70">
            <CardContent className="p-7">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Eye className="size-5" />
              </span>
              <h2 className="mt-5 text-2xl">{t("Our Vision")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("A thriving, self-reliant community where heritage is preserved, businesses flourish, and every family — parents, students and elders alike — can grow, give back and find support, generation after generation.")}
              </p>
            </CardContent>
          </Card>
          <Card className="h-full border-border/70">
            <CardContent className="p-7">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Sparkles className="size-5" />
              </span>
              <h2 className="mt-5 text-2xl">{t("Our Promise")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("To lead with integrity and compassion, organising events, campaigns and support networks that reflect the values our community holds dear — and to always be there when one of our own needs a hand.")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="surface-panel border-y border-border py-16">
        <div className="container-page">
          <p className="eyebrow text-terracotta">{t("What guides us")}</p>
          <h2 className="mt-2 text-3xl md:text-4xl">{t("Our core values")}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value) => (
              <Card key={value.title} className="h-full border-border/70">
                <CardContent className="p-6">
                  <p className="font-display text-lg text-primary">{t(value.title)}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{t(value.body)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-terracotta">{t("Leadership")}</p>
            <h2 className="mt-2 text-3xl md:text-4xl">{t("The board team")}</h2>
          </div>
          <Button asChild variant="hero">
            <Link to="/board">{t("Meet the full board")}</Link>
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
      </section>
    </>
  );
}