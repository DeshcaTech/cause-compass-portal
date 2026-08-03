import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type DrilldownDonation = {
  id: string;
  amount: number;
  created_at: string;
  email: string | null;
  donor_name: string | null;
  is_anonymous?: boolean | null;
  status: string;
};

const money = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "2-digit" });

export function CampaignDrilldown({ donations }: { donations: DrilldownDonation[] }) {
  const { series, supporters } = useMemo(() => {
    const sorted = [...donations].sort((a, b) => a.created_at.localeCompare(b.created_at));
    let running = 0;
    const byDay = new Map<string, { daily: number; count: number }>();
    for (const row of sorted) {
      const day = row.created_at.slice(0, 10);
      const entry = byDay.get(day) ?? { daily: 0, count: 0 };
      entry.daily += Number(row.amount ?? 0);
      entry.count += 1;
      byDay.set(day, entry);
    }
    const series = [...byDay.entries()].map(([day, v]) => {
      running += v.daily;
      return {
        day: dateFmt.format(new Date(day)),
        daily: Math.round(v.daily),
        cumulative: Math.round(running),
        donations: v.count,
      };
    });

    const map = new Map<
      string,
      { name: string; email: string | null; total: number; count: number; last: string }
    >();
    for (const row of sorted) {
      const anonymous = row.is_anonymous === true;
      const key = anonymous
        ? `anon:${row.id}`
        : (row.email ?? row.donor_name ?? row.id).trim().toLowerCase();
      const name = anonymous ? "Anonymous" : (row.donor_name ?? row.email ?? "Unknown supporter");
      const entry = map.get(key) ?? {
        name,
        email: anonymous ? null : row.email,
        total: 0,
        count: 0,
        last: row.created_at,
      };
      entry.total += Number(row.amount ?? 0);
      entry.count += 1;
      entry.last = row.created_at;
      map.set(key, entry);
    }

    return {
      series,
      supporters: [...map.entries()]
        .map(([key, v]) => ({ key, ...v }))
        .sort((a, b) => b.total - a.total),
    };
  }, [donations]);

  if (!donations.length) {
    return <p className="text-sm text-muted-foreground">No donations recorded for this campaign yet.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip formatter={(value: number) => money.format(value)} />
            <Area
              type="monotone"
              dataKey="cumulative"
              name="Cumulative raised"
              stroke="var(--color-primary)"
              fill="var(--color-primary)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold">Supporters ({supporters.length})</h4>
        <div className="max-h-72 overflow-y-auto rounded-md border border-border/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supporter</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Gifts</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Last gift</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supporters.map((s) => (
                <TableRow key={s.key}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.email ?? "—"}</TableCell>
                  <TableCell className="text-right">{s.count}</TableCell>
                  <TableCell className="text-right">{money.format(s.total)}</TableCell>
                  <TableCell className="text-right">
                    {dateFmt.format(new Date(s.last))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
