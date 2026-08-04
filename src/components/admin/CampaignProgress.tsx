import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ChevronRight, PartyPopper, Target, TrendingDown } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CampaignDrilldown, type DrilldownDonation } from "@/components/admin/CampaignDrilldown";
import { recordAlerts } from "@/lib/notifications";

export type CampaignProgressRow = {
  id: string;
  name: string;
  total: number;
  goal: number;
  status?: string | null;
  createdAt?: string | null;
  endsAt?: string | null;
};

const money = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const MILESTONES = [25, 50, 75, 100];

/** How far behind the expected pace a campaign may fall before we flag it. */
const BEHIND_TOLERANCE = 15;

export type CampaignSignal = {
  id: string;
  name: string;
  pct: number;
  raised: number;
  goal: number;
  milestone: number | null;
  expectedPct: number | null;
  behindBy: number | null;
  daysLeft: number | null;
};

export function analyseCampaigns(rows: CampaignProgressRow[]): CampaignSignal[] {
  const now = Date.now();
  return rows
    .filter((row) => row.goal > 0)
    .map((row) => {
      const pct = Math.min(999, Math.round((row.total / row.goal) * 100));
      const milestone = [...MILESTONES].reverse().find((m) => pct >= m) ?? null;

      let expectedPct: number | null = null;
      let daysLeft: number | null = null;
      if (row.endsAt) {
        const end = new Date(row.endsAt).getTime();
        const start = row.createdAt ? new Date(row.createdAt).getTime() : end - 90 * 86400000;
        daysLeft = Math.ceil((end - now) / 86400000);
        if (end > start) {
          expectedPct = Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
        }
      }

      const behindBy =
        expectedPct !== null && pct < 100 && expectedPct - pct > BEHIND_TOLERANCE
          ? expectedPct - pct
          : null;

      return {
        id: row.id,
        name: row.name,
        pct,
        raised: row.total,
        goal: row.goal,
        milestone,
        expectedPct,
        behindBy,
        daysLeft,
      };
    })
    .sort((a, b) => b.pct - a.pct);
}

export function CampaignProgress({
  rows,
  donationsByCampaign = {},
  openCampaignId,
  onOpenCampaignChange,
}: {
  rows: CampaignProgressRow[];
  donationsByCampaign?: Record<string, DrilldownDonation[]>;
  /** Controlled campaign id for the drilldown dialog (used by deep links). */
  openCampaignId?: string | null;
  onOpenCampaignChange?: (id: string | null) => void;
}) {
  const signals = useMemo(() => analyseCampaigns(rows), [rows]);
  const notified = useRef(false);
  const [internalId, setInternalId] = useState<string | null>(null);
  const controlled = openCampaignId !== undefined;
  const openId = controlled ? (openCampaignId ?? null) : internalId;
  const setOpenId = (id: string | null) => {
    if (!controlled) setInternalId(id);
    onOpenCampaignChange?.(id);
  };
  const active = signals.find((s) => s.id === openId) ?? null;

  const reached = signals.filter((s) => s.pct >= 100);
  const behind = signals.filter((s) => s.behindBy !== null);

  useEffect(() => {
    if (notified.current || !signals.length) return;
    notified.current = true;
    // Only alert on events not already logged in the notification centre.
    for (const alert of recordAlerts(signals)) {
      if (alert.kind === "milestone") toast.success(alert.title, { description: alert.body });
      else toast.warning(alert.title, { description: alert.body });
    }
  }, [signals]);

  if (!signals.length) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Target progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add a goal amount to a campaign to track progress here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reached.length > 0 && (
        <Alert className="border-primary/40 bg-primary/5">
          <PartyPopper className="h-4 w-4" />
          <AlertTitle>Target reached</AlertTitle>
          <AlertDescription>
            {reached.map((s) => `${s.name} (${s.pct}%)`).join(", ")} — time to celebrate and thank
            supporters.
          </AlertDescription>
        </Alert>
      )}

      {behind.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {behind
              .map(
                (s) =>
                  `${s.name} is ${s.behindBy}% behind pace (${s.pct}% raised vs ${s.expectedPct}% expected)`,
              )
              .join("; ")}
            .
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" /> Target progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {signals.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setOpenId(s.id)}
              aria-label={`View donations and supporters for ${s.name}`}
              className="w-full space-y-2 rounded-md p-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1 font-medium">
                  {s.name}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </p>
                <div className="flex items-center gap-2">
                  {s.behindBy !== null && (
                    <Badge variant="destructive" className="gap-1">
                      <TrendingDown className="h-3 w-3" /> {s.behindBy}% behind
                    </Badge>
                  )}
                  {s.milestone !== null && (
                    <Badge variant="secondary">{s.milestone}% milestone</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {money.format(s.raised)} / {money.format(s.goal)}
                  </span>
                </div>
              </div>
              <Progress value={Math.min(100, s.pct)} className="h-2.5" />
              <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                <span>{s.pct}% of target</span>
                <span>
                  {s.expectedPct !== null ? `Expected ${s.expectedPct}% by now` : "No end date set"}
                  {s.daysLeft !== null &&
                    (s.daysLeft > 0 ? ` · ${s.daysLeft} days left` : " · closed")}
                </span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setOpenId(null)}>
        {/* key by campaign id so back/forward fully remounts the dialog content */}
        <DialogContent key={active?.id ?? "none"} className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{active?.name ?? "Campaign"}</DialogTitle>
            <DialogDescription>
              {active
                ? `${money.format(active.raised)} of ${money.format(active.goal)} raised (${active.pct}%)`
                : null}
            </DialogDescription>
          </DialogHeader>
          {active && (
            <CampaignDrilldown
              key={active.id}
              donations={donationsByCampaign[active.id] ?? []}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
