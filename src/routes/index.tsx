import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Apple, ArrowRight, CalendarDays, HandHeart, Smartphone, Users } from "lucide-react";

import logo from "@/assets/ccgms-logo.png";
import hero from "@/assets/hero-community.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { campaignsQuery, eventsQuery, formatDate, formatMoney } from "@/lib/queries";

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

  const upcoming = events.filter((e) => new Date(e.start_at) >= new Date()).slice(0, 3);
  const activeCampaigns = campaigns.filter((c) => c.status === "active").slice(0, 3);

  return (
    <>
      {/* Magazine masthead hero: editorial split */}
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <div className="container-page grid items-center gap-10 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24">
          <div className="min-w-0">
            <div className="flex items-center gap-4">
              <img
                src={logo}
                alt="CCGMs logo"
                width={140}
                height={140}
                className="h-16 w-16 shrink-0 md:h-20 md:w-20"
              />
              <p className="eyebrow text-gold">Community association</p>
            </div>
            <h1 className="mt-7 text-[2.6rem] leading-[0.98] md:text-[4.2rem]">
              Stronger together,
              <br />
              <span className="text-gold">generation after generation</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-primary-foreground/80 md:text-lg">
              CCGMs is built on family, culture and mutual support. Join us, give to a cause, and
              be part of everything we build together.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold" size="xl">
                <Link to="/donate">
                  Donate <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="onHero" size="xl">
                <Link to="/fundraising">Support Our Causes</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {[
                { icon: Smartphone, label: "Android" },
                { icon: Apple, label: "iPhone" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="inline-flex items-center gap-3 rounded-2xl border border-primary-foreground/25 px-5 py-3 text-left transition-colors hover:bg-primary-foreground/10"
                >
                  <Icon className="size-6 shrink-0" />
                  <span>
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

      <section className="container-page py-16 md:py-20">
        <div className="grid items-start gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow text-terracotta">Who we are</p>
            <h2 className="mt-2 text-3xl md:text-4xl">A family of families</h2>
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

      <section className="surface-panel border-y border-border py-16 md:py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-terracotta">What's on</p>
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
    </>
  );
}
