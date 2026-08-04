import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Apple,
  ArrowRight,
  Building2,
  CalendarDays,
  HandHeart,
  HeartHandshake,
  Smartphone,
  UserRound,
  Users,
} from "lucide-react";

import flagsAsset from "@/assets/cm-uk-flags.jpg.asset.json";
import hero from "@/assets/hero-community.jpg?w=1200&quality=72&format=jpg";
import heroAvif from "@/assets/hero-community.jpg?w=1200&quality=55&format=avif";
import heroWebp from "@/assets/hero-community.jpg?w=1200&quality=70&format=webp";
import communityTogether from "@/assets/family-of-families.jpg?w=900&quality=72&format=jpg";
import communityAvif from "@/assets/family-of-families.jpg?w=900&quality=55&format=avif";
import communityWebp from "@/assets/family-of-families.jpg?w=900&quality=70&format=webp";
import eventFallback from "@/assets/event-fallback.jpg?w=1000&quality=72&format=jpg";
import eventFallbackAvif from "@/assets/event-fallback.jpg?w=1000&quality=55&format=avif";
import eventFallbackWebp from "@/assets/event-fallback.jpg?w=1000&quality=70&format=webp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Picture } from "@/components/site/Picture";
import { EventDialog } from "@/components/site/EventDialog";
import { useT } from "@/lib/i18n";
import {
  announcementsQuery,
  campaignsQuery,
  eventsQuery,
  formatDate,
  formatMoney,
  homeStatsQuery,
  partnersQuery,
  type EventRow,
} from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CCGMs — Community Association" },
      {
        name: "description",
        content:
          "CCGMs is a community association for families: membership, events, fundraising campaigns, member businesses and support when you need it.",
      },
      { property: "og:title", content: "CCGMs — Community Association" },
      { property: "og:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { name: "twitter:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      {
        property: "og:description",
        content:
          "CCGMs is a community association for families: membership, events, fundraising campaigns, member businesses and support when you need it.",
      },
    ],
  }),
  component: Index,
});

const highlights = [
  {
    icon: Users,
    title: "Become a member",
    body: "Individual, student or family membership with a unique membership number.",
    to: "/membership",
  },
  {
    icon: CalendarDays,
    title: "Community events",
    body: "Gala nights, workshops, health days and cultural festivals all year round.",
    to: "/events",
  },
  {
    icon: HandHeart,
    title: "Get involved",
    body: "Volunteer, refer someone who needs support or back an active campaign.",
    to: "/volunteer",
  },
];

function Index() {
  const t = useT();
  const { data: events = [] } = useQuery(eventsQuery);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const { data: campaigns = [] } = useQuery(campaignsQuery);
  const { data: announcements = [] } = useQuery(announcementsQuery);
  const { data: partners = [] } = useQuery(partnersQuery);
  const { data: stats } = useQuery(homeStatsQuery);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return events.filter((e) => new Date(e.start_at).getTime() >= now).slice(0, 4);
  }, [events]);
  const activeCampaigns = useMemo(
    () => campaigns.filter((c) => c.status === "active"),
    [campaigns],
  );
  const latestNews = useMemo(() => announcements.slice(0, 3), [announcements]);
  const featuredPartners = useMemo(() => partners.slice(0, 4), [partners]);

  const statTiles = useMemo(
    () => [
      { icon: Users, label: t("Members"), value: stats?.members ?? 0 },
      { icon: Building2, label: t("Member businesses"), value: stats?.businesses ?? 0 },
      { icon: CalendarDays, label: t("Coming events"), value: stats?.upcoming_events ?? 0 },
      { icon: UserRound, label: t("Board members"), value: stats?.board_members ?? 0 },
      { icon: HeartHandshake, label: t("Active campaigns"), value: stats?.active_campaigns ?? 0 },
    ],
    [stats],
  );

  return (
    <>
      {/* Magazine masthead hero: editorial split */}
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <div className="container-page grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <p className="eyebrow min-w-0 text-right text-gold">
                {t("Cameroonian Community in Greater Manchester and Surrounding area")}
              </p>
              <img
                src={flagsAsset.url}
                alt="Cameroon and United Kingdom flags"
                loading="eager"
                className="h-8 w-auto shrink-0 rounded-md object-cover sm:h-10"
              />
            </div>
            <h1 className="mt-6 text-[1.91rem] leading-[1.02] sm:mt-7 sm:text-[2.31rem] sm:leading-[0.98] lg:text-[3.73rem]">
              {t("Stronger together,")}
              <br />
              <span className="text-gold">{t("generation after generation")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[16px] text-primary-foreground/80">
              {t("CCGMs is built on family, culture and mutual support. Join us, give to a cause, and be part of everything we build together.")}
            </p>
            <div className="mt-8 flex flex-row gap-3 sm:flex-wrap">
              <Button asChild variant="gold" size="xl">
                <Link to="/membership">{t("Join")}</Link>
              </Button>
              <Button asChild variant="onHero" size="xl">
                <Link to="/fundraising">{t("Support Our Causes")}</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {[
                { icon: Smartphone, label: "Android" },
                { icon: Apple, label: "iPhone" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="inline-flex min-w-0 items-center gap-3 rounded-2xl border border-primary-foreground/25 px-5 py-3 text-left transition-colors hover:bg-primary-foreground/10"
                >
                  <Icon className="size-6 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-widest opacity-70">
                      {t("Download for")}
                    </span>
                    <span className="block text-sm font-semibold">{t(label)}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
          <div className="relative">
            <Picture
              avif={heroAvif}
              webp={heroWebp}
              src={hero}
              alt={t("CCGMs members of all generations celebrating together")}
              width={1920}
              height={1200}
              fetchPriority="high"
              decoding="async"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]"
            />
          </div>
        </div>
      </section>

      {/* Community at a glance */}
      <section className="border-b border-border bg-card">
        <div className="container-page grid grid-cols-2 gap-x-2 gap-y-1 divide-border py-8 sm:grid-cols-3 sm:py-10 lg:grid-cols-5">
          {statTiles.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex min-w-0 items-center gap-3 px-1 py-3 sm:px-2">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground sm:size-10">
                <Icon className="size-4 sm:size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xl font-semibold leading-none sm:text-2xl">{value}</span>
                <span className="mt-1 block text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs sm:tracking-widest">
                  {label}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-14 sm:py-16 md:py-20">
        <div className="grid items-start gap-8 md:gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow text-terracotta">{t("Who we are")}</p>
            <h2 className="mt-2 text-2xl sm:text-3xl md:text-[2rem]">{t("A family of families")}</h2>
            <Picture
              avif={communityAvif}
              webp={communityWebp}
              src={communityTogether}
              alt={t("CCGMs members of all ages gathered together")}
              loading="lazy"
              width={1280}
              height={960}
              decoding="async"
              pictureClassName="mt-6 block"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]"
            />
          </div>
          <div className="space-y-5">
            <p className="text-base text-muted-foreground md:text-lg">
              {t("CCGMs brings together members of our community across generations — parents, students, elders and children — around culture, faith, friendship and mutual support. What began as a handful of families sharing meals and traditions is now an association with a board, an events calendar and campaigns that back people when life gets hard.")}
            </p>
            <p className="text-sm text-muted-foreground md:text-base">
              {t("We celebrate together, raise funds for causes that matter to our members, promote businesses run by our community, and stand beside anyone who needs a hand.")}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Members & families", value: "One community" },
                { label: "Events each year", value: "All year round" },
                { label: "Causes supported", value: "Together" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="min-w-0 rounded-2xl border border-border/70 bg-card p-4 sm:p-5"
                >
                  <p className="text-base font-semibold sm:text-lg">{t(item.value)}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                    {t(item.label)}
                  </p>
                </div>
              ))}
            </div>
            <Button asChild variant="soft" className="w-full sm:w-auto">
              <Link to="/about">
                {t("More about CCGMs")} <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page pb-14 sm:pb-16 md:pb-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item) => (
            <Link key={item.to} to={item.to} className="group">
              <Card className="h-full border-border/70 transition-all group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-lift)]">
                <CardContent className="p-6 sm:p-7">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <item.icon className="size-5" />
                  </span>
                  <h2 className="mt-5 text-lg sm:text-xl">{t(item.title)}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{t(item.body)}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {t("Learn more")} <ArrowRight className="size-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest news & announcements */}
      <section className="container-page pb-14 sm:pb-16 md:pb-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-terracotta">{t("Noticeboard")}</p>
              <h2 className="mt-2 text-2xl sm:text-3xl md:text-[2rem]">
                {t("Latest news & announcements")}
              </h2>
            </div>
          </div>
          {latestNews.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">
              {t("No announcements yet — check back soon for community news and updates.")}
            </p>
          ) : (
          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {latestNews.map((item) => (
              <Link key={item.id} to="/news/$id" params={{ id: item.id }} className="block">
              <Card className="h-full border-border/70 transition-shadow hover:shadow-lg">
                <CardContent className="p-5 sm:p-6">
                  <p className="eyebrow text-terracotta">{formatDate(item.published_at)}</p>
                  <h3 className="mt-2 text-base leading-snug sm:text-lg">{item.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {item.summary ?? item.body}
                  </p>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
          )}
      </section>

      <section className="surface-panel border-y border-border py-14 sm:py-16 md:py-20">
        <div className="container-page">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-terracotta">{t("What's on")}</p>
              <h2 className="mt-2 text-2xl sm:text-3xl md:text-[2rem]">{t("Coming events")}</h2>
            </div>
            <Button asChild variant="soft" className="w-full sm:w-auto">
              <Link to="/events">{t("All events")}</Link>
            </Button>
          </div>
          {upcoming.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">{t("New events are being planned.")}</p>
          ) : (
            <div className="mt-6 grid gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-[1.4fr_1fr]">
              {/* Lead story */}
              <Card
                role="button"
                tabIndex={0}
                onClick={() => setSelectedEvent(upcoming[0]!)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedEvent(upcoming[0]!);
                  }
                }}
                className="cursor-pointer overflow-hidden border-border/70 bg-primary text-primary-foreground transition-shadow hover:shadow-[var(--shadow-lift)]"
              >
                <Picture
                  {...(upcoming[0]!.image_url
                    ? { src: upcoming[0]!.image_url }
                    : { src: eventFallback, avif: eventFallbackAvif, webp: eventFallbackWebp })}
                  alt={upcoming[0]!.title}
                  loading="lazy"
                  decoding="async"
                  width={1280}
                  height={720}
                  pictureClassName="block"
                  className="aspect-[16/9] w-full object-cover"
                />
                <CardContent className="flex h-full flex-col p-6 sm:p-8 md:p-10">
                  <p className="eyebrow text-gold">{formatDate(upcoming[0]!.start_at)}</p>
                  <h3 className="mt-3 text-2xl leading-tight sm:text-3xl md:text-4xl">
                    {upcoming[0]!.title}
                  </h3>
                  <p className="mt-4 line-clamp-4 text-sm text-primary-foreground/80 md:text-base">
                    {upcoming[0]!.description}
                  </p>
                  <p className="mt-auto break-words pt-6 text-[11px] uppercase tracking-wider text-primary-foreground/60 sm:text-xs sm:tracking-widest">
                    {upcoming[0]!.location}
                  </p>
                </CardContent>
              </Card>
              {/* Supporting column */}
              <div className="divide-y divide-border rounded-xl border border-border/70 bg-card">
                {upcoming.slice(1).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    className="block w-full cursor-pointer p-5 text-left transition-colors hover:bg-secondary sm:p-6"
                  >
                    <p className="eyebrow text-terracotta">{formatDate(event.start_at)}</p>
                    <h3 className="mt-2 text-base leading-snug sm:text-lg">{event.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">{event.location}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <EventDialog
        event={selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />

      <section className="container-page py-14 sm:py-16 md:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-terracotta">{t("Fundraising")}</p>
            <h2 className="mt-2 text-2xl sm:text-3xl md:text-[2rem]">{t("Active campaigns")}</h2>
          </div>
          <Button asChild variant="soft" className="w-full sm:w-auto">
            <Link to="/fundraising">{t("See all campaigns")}</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {activeCampaigns.map((campaign) => {
            const pct = Math.min(
              100,
              Math.round((campaign.raised_amount / Math.max(campaign.goal_amount, 1)) * 100),
            );
            return (
              <Card key={campaign.id} className="border-border/70">
                <CardContent className="p-5 sm:p-6">
                  <h3 className="text-base leading-snug sm:text-lg">{campaign.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {campaign.summary}
                  </p>
                  <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-[image:var(--gradient-gold)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm">
                    <span className="font-semibold">{formatMoney(campaign.raised_amount)}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      {t("raised of")} {formatMoney(campaign.goal_amount)}
                    </span>
                  </p>
                  <Button asChild variant="hero" size="sm" className="mt-5 w-full sm:w-auto">
                    <Link to="/donate" search={{ campaign: campaign.id }}>
                      {t("Donate")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Selected community businesses */}
      {featuredPartners.length > 0 && (
        <section className="surface-panel border-t border-border py-14 sm:py-16 md:py-20">
          <div className="container-page">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-terracotta">{t("Our members at work")}</p>
                <h2 className="mt-2 text-2xl sm:text-3xl md:text-[2rem]">
                  {t("Selected community businesses")}
                </h2>
              </div>
              <Button asChild variant="soft" className="w-full sm:w-auto">
                <Link to="/partners">{t("All businesses")}</Link>
              </Button>
            </div>
            <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {featuredPartners.map((partner) => (
                <Link key={partner.id} to="/partners" className="group">
                  <Card className="h-full border-border/70 transition-all group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-lift)]">
                    <CardContent className="p-5 sm:p-6">
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt={`${partner.business_name} logo`}
                          loading="lazy"
                          decoding="async"
                          width={112}
                          height={112}
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                          <Building2 className="size-6" />
                        </span>
                      )}
                      <p className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                        {partner.category}
                      </p>
                      <h3 className="mt-1 text-base leading-snug sm:text-lg">
                        {partner.business_name}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {partner.short_description ?? partner.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
