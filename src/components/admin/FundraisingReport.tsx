import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignProgress } from "@/components/admin/CampaignProgress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

type DonationRow = {
  id: string;
  amount: number;
  created_at: string;
  campaign_id: string | null;
  email: string | null;
  donor_name: string | null;
  status: string;
};

const money = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "2-digit",
  });
}

export function FundraisingReport() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["fundraising-report"],
    queryFn: async () => {
      const [donations, campaigns] = await Promise.all([
        supabase
          .from("donations")
          .select("id, amount, created_at, campaign_id, email, donor_name, status")
          .order("created_at", { ascending: true }),
        supabase
          .from("campaigns")
          .select("id, title, goal_amount, raised_amount, status, ends_at, created_at"),
      ]);
      if (donations.error) throw new Error(donations.error.message);
      if (campaigns.error) throw new Error(campaigns.error.message);
      return {
        donations: (donations.data ?? []) as DonationRow[],
        campaigns: campaigns.data ?? [],
      };
    },
  });

  const report = useMemo(() => {
    const donations = data?.donations ?? [];
    const campaigns = data?.campaigns ?? [];
    const titleById = new Map(campaigns.map((c) => [c.id, c.title]));

    const supporterKey = (row: DonationRow) =>
      (row.email ?? row.donor_name ?? row.id).trim().toLowerCase();

    const byCampaign = new Map<
      string,
      { name: string; total: number; count: number; supporters: Set<string>; goal: number }
    >();
    for (const campaign of campaigns) {
      byCampaign.set(campaign.id, {
        name: campaign.title,
        total: 0,
        count: 0,
        supporters: new Set(),
        goal: Number(campaign.goal_amount ?? 0),
        status: campaign.status,
        endsAt: campaign.ends_at,
        createdAt: campaign.created_at,
      });
    }
    byCampaign.set("general", {
      name: "General fund",
      total: 0,
      count: 0,
      supporters: new Set(),
      goal: 0,
      status: null,
      endsAt: null,
      createdAt: null,
    });

    const byMonth = new Map<string, { total: number; count: number; supporters: Set<string> }>();

    for (const row of donations) {
      const amount = Number(row.amount ?? 0);
      const key = row.campaign_id && titleById.has(row.campaign_id) ? row.campaign_id : "general";
      const campaign = byCampaign.get(key)!;
      campaign.total += amount;
      campaign.count += 1;
      campaign.supporters.add(supporterKey(row));

      const mKey = monthKey(row.created_at);
      const month = byMonth.get(mKey) ?? { total: 0, count: 0, supporters: new Set<string>() };
      month.total += amount;
      month.count += 1;
      month.supporters.add(supporterKey(row));
      byMonth.set(mKey, month);
    }

    const campaignRows = [...byCampaign.entries()]
      .map(([id, value]) => ({
        id,
        name: value.name,
        total: value.total,
        count: value.count,
        supporters: value.supporters.size,
        goal: value.goal,
        status: value.status,
        endsAt: value.endsAt,
        createdAt: value.createdAt,
      }))
      .filter((row) => row.count > 0 || row.goal > 0)
      .sort((a, b) => b.total - a.total);

    const monthRows = [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, value]) => ({
        month: monthLabel(key),
        total: Math.round(value.total),
        supporters: value.supporters.size,
        donations: value.count,
      }));

    const total = donations.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    const supporters = new Set(donations.map(supporterKey)).size;

    return {
      campaignRows,
      monthRows,
      total,
      supporters,
      count: donations.length,
      average: donations.length ? total / donations.length : 0,
    };
  }, [data]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading fundraising figures…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  }

  const stats = [
    { label: "Total raised", value: money.format(report.total) },
    { label: "Donations", value: String(report.count) },
    { label: "Supporters", value: String(report.supporters) },
    { label: "Average gift", value: money.format(report.average) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/70">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Donations by month</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {report.monthRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.monthRows}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip formatter={(value: number) => money.format(value)} />
                  <Bar dataKey="total" name="Raised" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No donations recorded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Supporters by month</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {report.monthRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.monthRows}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="supporters"
                    name="Supporters"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="donations"
                    name="Donations"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No donations recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Totals by campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead className="text-right">Raised</TableHead>
                <TableHead className="text-right">Goal</TableHead>
                <TableHead className="text-right">Donations</TableHead>
                <TableHead className="text-right">Supporters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.campaignRows.length ? (
                report.campaignRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-right">{money.format(row.total)}</TableCell>
                    <TableCell className="text-right">
                      {row.goal ? money.format(row.goal) : "—"}
                    </TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                    <TableCell className="text-right">{row.supporters}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    No campaigns or donations yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Monthly breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Raised</TableHead>
                <TableHead className="text-right">Donations</TableHead>
                <TableHead className="text-right">Supporters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.monthRows.length ? (
                [...report.monthRows].reverse().map((row) => (
                  <TableRow key={row.month}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell className="text-right">{money.format(row.total)}</TableCell>
                    <TableCell className="text-right">{row.donations}</TableCell>
                    <TableCell className="text-right">{row.supporters}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground">
                    No donations recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}