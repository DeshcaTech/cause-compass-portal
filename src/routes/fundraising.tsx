import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/site/PageHeader";
import { ShareButton } from "@/components/site/ShareButton";
import { FilterPage, FilterSelect } from "@/components/site/FilterPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { campaignsQuery, formatDate, formatMoney, type Campaign } from "@/lib/queries";
import campaignFallback from "@/assets/campaign-fallback.jpg";
import { useT } from "@/lib/i18n";
import { useDyn } from "@/lib/i18n/dynamic";
import { searchString, useSearchFilter } from "@/lib/use-search-filter";
import { mergeShareMeta } from "@/lib/share-meta";
import { useDialogParam } from "@/lib/use-dialog-param";
import { useCardAspect } from "@/lib/card-image";

export const Route = createFileRoute("/fundraising")({
  validateSearch: (search: Record<string, unknown>): { view?: string | undefined; campaign?: string | undefined; st?: string | undefined; si?: string | undefined} => ({
    view: searchString(search, "view"),
    campaign: searchString(search, "campaign"),
    st: searchString(search, "st"),
    si: searchString(search, "si"),
  }),
  head: ({ match }) => ({
    meta: mergeShareMeta([
      { title: "Fundraising — Support Our Causes" },
      {
        name: "description",
        content:
          "Active and past CCGMs fundraising campaigns — support education, welfare and cultural projects, or make a one-off donation.",
      },
      { property: "og:title", content: "Fundraising — Support Our Causes" },
      { property: "og:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { name: "twitter:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      {
        property: "og:description",
        content: "See active and past campaigns and give to the cause that matters to you.",
      },
    ], match.search as Record<string, unknown>),
  }),
  component: FundraisingPage,
});

function CampaignCard({ campaign, onOpen }: { campaign: Campaign; onOpen: () => void }) {
  const t = useT();
  const dyn = useDyn();
  const cardAspect = useCardAspect();
  const pct = campaign.goal_amount
    ? Math.min(100, Math.round((campaign.raised_amount / campaign.goal_amount) * 100))
    : 0;
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className="flex cursor-pointer flex-col border-border/70 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
    >
      <CardContent className="flex flex-1 flex-col p-6">
        <img
          src={campaign.image_url ?? campaignFallback}
          alt={dyn(campaign.title)}
          loading="lazy"
          style={cardAspect}
          className="mb-4 w-full rounded-xl object-cover"
        />
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg">{dyn(campaign.title)}</h2>
          <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
            {campaign.status === "active" ? t("Active") : t("Completed")}
          </Badge>
        </div>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {dyn(campaign.description ?? campaign.summary)}
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
              {t("raised of")} {formatMoney(campaign.goal_amount)} ({pct}%)
            </span>
          </p>
          {campaign.ends_at ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {campaign.status === "active" ? t("Closes") : t("Closed")} {formatDate(campaign.ends_at)}
            </p>
          ) : null}
        </div>
        {campaign.status === "active" ? (
          <Button asChild variant="hero" className="mt-5" onClick={(e) => e.stopPropagation()}>
            <Link to="/donate" search={{ campaign: campaign.id }}>
              {t("Donate to this campaign")}
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CampaignDialog({
  campaign,
  onClose,
}: {
  campaign: Campaign | null;
  onClose: () => void;
}) {
  const t = useT();
  const dyn = useDyn();
  const pct = campaign?.goal_amount
    ? Math.min(100, Math.round((campaign.raised_amount / campaign.goal_amount) * 100))
    : 0;
  return (
    <Dialog open={!!campaign} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {campaign ? (
          <>
            <DialogHeader>
              <DialogTitle>{dyn(campaign.title)}</DialogTitle>
              <DialogDescription>{dyn(campaign.summary)}</DialogDescription>
            </DialogHeader>
            <img
              src={campaign.image_url ?? campaignFallback}
              alt={dyn(campaign.title)}
              className="max-h-[60vh] w-full rounded-xl bg-secondary object-contain"
            />
            <Badge variant={campaign.status === "active" ? "default" : "secondary"} className="w-fit">
              {campaign.status === "active" ? t("Active") : t("Completed")}
            </Badge>
            <p className="text-sm text-foreground/85">{dyn(campaign.description ?? campaign.summary)}</p>
            <div>
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
                  {t("raised of")} {formatMoney(campaign.goal_amount)} ({pct}%)
                </span>
              </p>
              {campaign.ends_at ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {campaign.status === "active" ? t("Closes") : t("Closed")}{" "}
                  {formatDate(campaign.ends_at)}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {campaign.status === "active" ? (
                <Button asChild variant="hero" className="flex-1">
                  <Link to="/donate" search={{ campaign: campaign.id }}>
                    {t("Donate to this campaign")}
                  </Link>
                </Button>
              ) : null}
              <ShareButton
                title={dyn(campaign.title)}
                path={`/fundraising?campaign=${campaign.id}`}
                image={campaign.image_url ?? null}
                label={t("Share campaign")}
                className="flex-1"
              />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function FundraisingPage() {
  const t = useT();
  const { data: campaigns = [] } = useQuery(campaignsQuery);
  const active = campaigns.filter((c) => c.status === "active");
  const past = campaigns.filter((c) => c.status !== "active");
  const [view, setView] = useSearchFilter("view", "active");
  const list = view === "active" ? active : past;
  // The open campaign lives in the URL so the popup can be shared as a link.
  const search = Route.useSearch();
  const selected = campaigns.find((c) => c.id === search.campaign) ?? null;
  const openCampaign = useDialogParam("campaign");
  const setSelected = (campaign: Campaign | null) => openCampaign(campaign?.id ?? null);

  return (
    <>
      <PageHeader
        eyebrow={t("Get involved")}
        title={t("Support our causes")}
        description={t("Every campaign is proposed, voted on and reported back to the membership.")}
      />
      <FilterPage
        filters={(
          <FilterSelect
            label={t("Campaigns")}
            value={view}
            onChange={(value) => setView(value as "active" | "past")}
            options={[
              {
                value: "active",
                label: t("Active campaigns"),
                meta: `${active.length} ${t("campaigns")}`,
              },
              {
                value: "past",
                label: t("Past campaigns"),
                meta: `${past.length} ${t("campaigns")}`,
              },
            ]}
          />
        )}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onOpen={() => setSelected(campaign)}
            />
          ))}
        </div>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("No campaigns to show yet.")}</p>
        ) : null}
        <Card className="mt-12 border-border/70 bg-[image:var(--gradient-hero)]">
          <CardContent className="flex flex-wrap items-center justify-between gap-5 p-8">
            <div>
              <h2 className="text-2xl text-primary-foreground">{t("Prefer to give freely?")}</h2>
              <p className="mt-2 max-w-xl text-sm text-primary-foreground/85">
                {t("Make a random donation of any amount and we'll direct it to where the community needs it most.")}
              </p>
            </div>
            <Button asChild variant="onHero" size="lg">
              <Link to="/donate">{t("Make a donation")}</Link>
            </Button>
          </CardContent>
        </Card>
      </FilterPage>
      <CampaignDialog campaign={selected} onClose={() => setSelected(null)} />
    </>
  );
}
