import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { campaignsQuery, formatDate, formatMoney, type Campaign } from "@/lib/queries";
import campaignFallback from "@/assets/campaign-fallback.jpg";

export const Route = createFileRoute("/fundraising")({
  head: () => ({
    meta: [
      { title: "Fundraising — Support Our Causes" },
      {
        name: "description",
        content:
          "Active and past CCGMs fundraising campaigns — support education, welfare and cultural projects, or make a one-off donation.",
      },
      { property: "og:title", content: "Fundraising — Support Our Causes" },
      {
        property: "og:description",
        content: "See active and past campaigns and give to the cause that matters to you.",
      },
    ],
  }),
  component: FundraisingPage,
});

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const pct = campaign.goal_amount
    ? Math.min(100, Math.round((campaign.raised_amount / campaign.goal_amount) * 100))
    : 0;
  return (
    <Card className="flex flex-col border-border/70">
      <CardContent className="flex flex-1 flex-col p-6">
        <img
          src={campaign.image_url ?? campaignFallback}
          alt={campaign.title}
          loading="lazy"
          className="mb-4 aspect-[16/9] w-full rounded-xl object-cover"
        />
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg">{campaign.title}</h2>
          <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
            {campaign.status === "active" ? "Active" : "Completed"}
          </Badge>
        </div>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">
          {campaign.description ?? campaign.summary}
        </p>
        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-[image:var(--gradient-gold)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-sm">
            <span className="font-semibold">{formatMoney(campaign.raised_amount)}</span>
            <span className="text-muted-foreground">
              {" "}
              raised of {formatMoney(campaign.goal_amount)} ({pct}%)
            </span>
          </p>
          {campaign.ends_at ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {campaign.status === "active" ? "Closes" : "Closed"} {formatDate(campaign.ends_at)}
            </p>
          ) : null}
        </div>
        {campaign.status === "active" ? (
          <Button asChild variant="hero" className="mt-5">
            <Link to="/donate" search={{ campaign: campaign.id }}>
              Donate to this campaign
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function FundraisingPage() {
  const { data: campaigns = [] } = useQuery(campaignsQuery);
  const active = campaigns.filter((c) => c.status === "active");
  const past = campaigns.filter((c) => c.status !== "active");

  return (
    <>
      <PageHeader
        eyebrow="Get involved"
        title="Support our causes"
        description="Every campaign is proposed, voted on and reported back to the membership."
      />
      <section className="container-page py-14">
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active campaigns</TabsTrigger>
            <TabsTrigger value="past">Past campaigns</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {active.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </TabsContent>
          <TabsContent value="past" className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {past.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </TabsContent>
        </Tabs>

        <Card className="mt-12 border-border/70 bg-[image:var(--gradient-hero)]">
          <CardContent className="flex flex-wrap items-center justify-between gap-5 p-8">
            <div>
              <h2 className="text-2xl text-primary-foreground">Prefer to give freely?</h2>
              <p className="mt-2 max-w-xl text-sm text-primary-foreground/85">
                Make a random donation of any amount and we'll direct it to where the community
                needs it most.
              </p>
            </div>
            <Button asChild variant="onHero" size="lg">
              <Link to="/donate">Make a donation</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}