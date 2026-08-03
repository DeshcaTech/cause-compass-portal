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
          "Join CCGMs, support our causes and stay connected with community events, partners and campaigns.",
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
      <section className="relative isolate overflow-hidden">
        <img
          src={hero}
          alt="CCGMs members of all generations celebrating together"
          width={1920}
          height={1200}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="hero-overlay absolute inset-0 -z-10" />
        <div className="container-page flex flex-col items-center py-24 text-center text-primary-foreground md:py-32">
          <img
            src={logo}
            alt="CCGMs logo"
            width={140}
            height={140}
            className="h-28 w-28 drop-shadow-lg md:h-36 md:w-36"
          />
          <h1 className="mt-8 max-w-4xl text-4xl leading-[1.05] md:text-6xl">
            Stronger together, <span className="text-gold">generation after generation</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-primary-foreground/85 md:text-lg">
            CCGMs is a community association built on family, culture and mutual support. Join us,
            give to a cause, and be part of everything we build together.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="hero" size="xl">
              <Link to="/donate">
                Donate <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="onHero" size="xl">
              <Link to="/fundraising">Support Our Causes</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <a
              href="#"
              className="inline-flex items-center gap-3 rounded-xl border border-primary-foreground/30 bg-primary-foreground/10 px-5 py-3 text-left backdrop-blur-sm transition-colors hover:bg-primary-foreground/20"
            >
              <Smartphone className="size-6" />
              <span>
                <span className="block text-[11px] uppercase tracking-widest opacity-75">
                  Download for
                </span>
                <span className="block text-sm font-semibold">Android</span>
              </span>
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-3 rounded-xl border border-primary-foreground/30 bg-primary-foreground/10 px-5 py-3 text-left backdrop-blur-sm transition-colors hover:bg-primary-foreground/20"
            >
              <Apple className="size-6" />
              <span>
                <span className="block text-[11px] uppercase tracking-widest opacity-75">
                  Download for
                </span>
                <span className="block text-sm font-semibold">iPhone</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {highlights.map((item) => (
            <Link key={item.to} to={item.to} className="group">
              <Card className="h-full border-border/70 shadow-[var(--shadow-soft)] transition-all group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-lift)]">
                <CardContent className="p-7">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
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
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {upcoming.map((event) => (
              <Card key={event.id} className="border-border/70">
                <CardContent className="p-6">
                  <p className="eyebrow text-primary">{formatDate(event.start_at)}</p>
                  <h3 className="mt-2 text-lg">{event.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {event.description}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">{event.location}</p>
                </CardContent>
              </Card>
            ))}
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">New events are being planned.</p>
            ) : null}
          </div>
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
