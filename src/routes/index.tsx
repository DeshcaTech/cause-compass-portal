import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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

import logo from "@/assets/ccgms-logo.png";
import hero from "@/assets/hero-community.jpg";
import communityTogether from "@/assets/community-together.jpg";
import eventFallback from "@/assets/event-fallback.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  announcementsQuery,
  campaignsQuery,
  eventsQuery,
  formatDate,
  formatMoney,
  homeStatsQuery,
  partnersQuery,
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
  const { data: events = [] } = useQuery(eventsQuery);
  const { data: campaigns = [] } = useQuery(campaignsQuery);
  const { data: announcements = [] } = useQuery(announcementsQuery);
  const { data: partners = [] } = useQuery(partnersQuery);
  const { data: stats } = useQuery(homeStatsQuery);

  const upcoming = events.filter((e) => new Date(e.start_at) >= new Date()).slice(0, 3);
  const activeCampaigns = campaigns.filter((c) => c.status === "active").slice(0, 3);
  const latestNews = announcements.slice(0, 3);
  const featuredPartners = partners.slice(0, 4);

  const statTiles = [
    { icon: Users, label: "Members", value: stats?.members ?? 0 },
    { icon: Building2, label: "Member businesses", value: stats?.businesses ?? 0 },
    { icon: CalendarDays, label: "Coming events", value: stats?.upcoming_events ?? 0 },
    { icon: UserRound, label: "Board members", value: stats?.board_members ?? 0 },
    { icon: HeartHandshake, label: "Active campaigns", value: stats?.active_campaigns ?? 0 },
  ];

  return (
    <>
      {/* Magazine masthead hero: editorial split */}
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <div className="container-page grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <img
                src={logo}
                alt="CCGMs logo"
                width={140}
                height={140}
                className="h-14 w-14 shrink-0 sm:h-16 sm:w-16 md:h-20 md:w-20"
              />
              <p className="eyebrow min-w-0 text-gold">Community association</p>
            </div>
            <h1 className="mt-6 text-[2.15rem] leading-[1.02] sm:mt-7 sm:text-[2.6rem] sm:leading-[0.98] lg:text-[4.2rem]">
              Stronger together,
              <br />
              <span className="text-gold">generation after generation</span>
            </h1>
            <p className="mt-5 max-w-xl text-[0.95rem] text-primary-foreground/80 sm:text-base md:text-lg">
              CCGMs is built on family, culture and mutual support. Join us, give to a cause, and
              be part of everything we build together.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild variant="gold" size="xl">
                <Link to="/membership">
                  Join the Community <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="onHero" size="xl">
                <Link to="/fundraising">Support Our Causes</Link>
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
                      Download for
                    </span>
                    <span className="block text-sm font-semibold">{label}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src={hero}
              alt="CCGMs members of all generations celebrating together"
              width={1920}
              height={1200}
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]"
            />
          </div>
        </div>
      </section>

      {/* Community at a glance */}
      <section className="border-b border-border bg-card">
        <div className="container-page grid grid-cols-2 divide-border py-10 sm:grid-cols-3 lg:grid-cols-5">
          {statTiles.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-2 py-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-2xl font-semibold leading-none">{value}</span>
                <span className="mt-1 block text-xs uppercase tracking-widest text-muted-foreground">
                  {label}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid items-start gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow text-terracotta">Who we are</p>
            <h2 className="mt-2 text-3xl md:text-4xl">A family of families</h2>
            <img
              src={communityTogether}
              alt="CCGMs members of all ages gathered together"
              loading="lazy"
              width={1280}
              height={960}
              className="mt-6 aspect-[4/3] w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]"
            />
          </div>
          <div className="space-y-5">
            <p className="text-base text-muted-foreground md:text-lg">
              CCGMs brings together members of our community across generations — parents,
              students, elders and children — around culture, faith, friendship and mutual
              support. What began as a handful of families sharing meals and traditions is now an
              association with a board, an events calendar and campaigns that back people when
              life gets hard.
            </p>
            <p className="text-sm text-muted-foreground md:text-base">
              We celebrate together, raise funds for causes that matter to our members, promote
              businesses run by our community, and stand beside anyone who needs a hand.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Members & families", value: "One community" },
                { label: "Events each year", value: "All year round" },
                { label: "Causes supported", value: "Together" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/70 bg-card p-5">
                  <p className="text-lg font-semibold">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <Button asChild variant="soft">
              <Link to="/about">
                More about CCGMs <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page pb-16 md:pb-20">
        <div className="grid gap-5 md:grid-cols-3">
          {highlights.map((item) => (
            <Link key={item.to} to={item.to} className="group">
              <Card className="h-full border-border/70 transition-all group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-lift)]">
                <CardContent className="p-7">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <item.icon className="size-5" />
                  </span>
                  <h2 className="mt-5 text-xl">{item.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Learn more <ArrowRight className="size-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest news & announcements */}
      <section className="container-page pb-16 md:pb-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-terracotta">Noticeboard</p>
              <h2 className="mt-2 text-3xl md:text-4xl">Latest news &amp; announcements</h2>
            </div>
          </div>
          {latestNews.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">
              No announcements yet — check back soon for community news and updates.
            </p>
          ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {latestNews.map((item) => (
              <Link key={item.id} to="/news/$id" params={{ id: item.id }} className="block">
              <Card className="h-full border-border/70 transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <p className="eyebrow text-terracotta">{formatDate(item.published_at)}</p>
                  <h3 className="mt-2 text-lg">{item.title}</h3>
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

      <section className="surface-panel border-y border-border py-16 md:py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-terracotta">What&apos;s on</p>
              <h2 className="mt-2 text-3xl md:text-4xl">Coming events</h2>
            </div>
            <Button asChild variant="soft">
              <Link to="/events">All events</Link>
            </Button>
          </div>
          {upcoming.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">New events are being planned.</p>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              {/* Lead story */}
              <Card className="overflow-hidden border-border/70 bg-primary text-primary-foreground">
                <img
                  src={upcoming[0]!.image_url ?? eventFallback}
                  alt={upcoming[0]!.title}
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover"
                />
                <CardContent className="flex h-full flex-col p-8 md:p-10">
                  <p className="eyebrow text-gold">{formatDate(upcoming[0]!.start_at)}</p>
                  <h3 className="mt-3 text-3xl leading-tight md:text-4xl">{upcoming[0]!.title}</h3>
                  <p className="mt-4 line-clamp-4 text-sm text-primary-foreground/80 md:text-base">
                    {upcoming[0]!.description}
                  </p>
                  <p className="mt-auto pt-6 text-xs uppercase tracking-widest text-primary-foreground/60">
                    {upcoming[0]!.location}
                  </p>
                </CardContent>
              </Card>
              {/* Supporting column */}
              <div className="divide-y divide-border rounded-xl border border-border/70 bg-card">
                {upcoming.slice(1).map((event) => (
                  <div key={event.id} className="p-6">
                    <p className="eyebrow text-terracotta">{formatDate(event.start_at)}</p>
                    <h3 className="mt-2 text-lg">{event.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">{event.location}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-terracotta">Fundraising</p>
            <h2 className="mt-2 text-3xl md:text-4xl">Active campaigns</h2>
          </div>
          <Button asChild variant="soft">
            <Link to="/fundraising">See all campaigns</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {activeCampaigns.map((campaign) => {
            const pct = Math.min(
              100,
              Math.round((campaign.raised_amount / Math.max(campaign.goal_amount, 1)) * 100),
            );
            return (
              <Card key={campaign.id} className="border-border/70">
                <CardContent className="p-6">
                  <h3 className="text-lg">{campaign.title}</h3>
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
                      raised of {formatMoney(campaign.goal_amount)}
                    </span>
                  </p>
                  <Button asChild variant="hero" size="sm" className="mt-5">
                    <Link to="/donate" search={{ campaign: campaign.id }}>
                      Donate
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
        <section className="surface-panel border-t border-border py-16 md:py-20">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-terracotta">Our members at work</p>
                <h2 className="mt-2 text-3xl md:text-4xl">Selected community businesses</h2>
              </div>
              <Button asChild variant="soft">
                <Link to="/partners">All businesses</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredPartners.map((partner) => (
                <Link key={partner.id} to="/partners" className="group">
                  <Card className="h-full border-border/70 transition-all group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-lift)]">
                    <CardContent className="p-6">
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt={`${partner.business_name} logo`}
                          loading="lazy"
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                          <Building2 className="size-6" />
                        </span>
                      )}
                      <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                        {partner.category}
                      </p>
                      <h3 className="mt-1 text-lg">{partner.business_name}</h3>
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
