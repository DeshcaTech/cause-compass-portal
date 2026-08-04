import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, RefreshCw, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listNewsSubscribers } from "@/lib/news.functions";

type Subscriber = {
  id: string;
  email: string;
  full_name: string | null;
  membership_number: string | null;
  is_active: boolean;
  created_at: string;
  unsubscribed_at: string | null;
};

export function SubscriberList() {
  const load = useServerFn(listNewsSubscribers);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");

  const { data = [], isLoading } = useQuery({
    queryKey: ["news_subscribers_list"],
    queryFn: async () => (await load({})) as Subscriber[],
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((s) => {
      if (filter === "active" && !s.is_active) return false;
      if (filter === "inactive" && s.is_active) return false;
      if (!q) return true;
      return [s.email, s.full_name, s.membership_number]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [data, search, filter]);

  const activeCount = data.filter((s) => s.is_active).length;

  function exportCsv() {
    const header = "email,full_name,membership_number,status,subscribed_at,unsubscribed_at";
    const body = rows
      .map((s) =>
        [
          s.email,
          s.full_name ?? "",
          s.membership_number ?? "",
          s.is_active ? "active" : "unsubscribed",
          s.created_at,
          s.unsubscribed_at ?? "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([`${header}\n${body}`], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "news-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="mb-8 border-border/70">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg">News subscribers</h3>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4" />
              {activeCount} active · {data.length - activeCount} unsubscribed
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["news_subscribers_list"] })}
            >
              <RefreshCw className="size-4" /> Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
              <Download className="size-4" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search email, name or membership number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {(["active", "inactive", "all"] as const).map((key) => (
            <Button
              key={key}
              size="sm"
              variant={filter === key ? "default" : "outline"}
              onClick={() => setFilter(key)}
            >
              {key === "active" ? "Active" : key === "inactive" ? "Unsubscribed" : "All"}
            </Button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading subscribers…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subscribers match this view.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Membership</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-t border-border/60">
                    <td className="py-2 pr-4">{s.email}</td>
                    <td className="py-2 pr-4">{s.full_name ?? "—"}</td>
                    <td className="py-2 pr-4">{s.membership_number ?? "—"}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={s.is_active ? "default" : "secondary"}>
                        {s.is_active ? "Active" : "Unsubscribed"}
                      </Badge>
                    </td>
                    <td className="py-2">
                      {new Date(s.created_at).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}