import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays, Mail, Phone, Users } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { SidebarNavItem, SidebarPage, SidebarSection } from "@/components/site/SidebarPage";
import { SmartImage } from "@/components/site/SmartImage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { villageGroupsQuery, type VillageGroup } from "@/lib/queries";
import { useT } from "@/lib/i18n";
import groupsBanner from "@/assets/community-together.jpg";

const SITE_ORIGIN = "https://cause-compass-portal.lovable.app";
const PAGE_URL = `${SITE_ORIGIN}/village-groups`;

export const Route = createFileRoute("/village-groups")({
  head: () => ({
    meta: [
      { title: "Our Groups — CCGMs Community" },
      {
        name: "description",
        content:
          "Find the CCGMs groups in Greater Manchester: meeting times, regions and contacts for each community group.",
      },
      { property: "og:title", content: "Our Groups — CCGMs Community" },
      {
        property: "og:description",
        content: "Community groups within CCGMs, with meeting details and contacts.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: PAGE_URL },
      { property: "og:image", content: `${SITE_ORIGIN}/og-ccgms.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Our Groups — CCGMs Community" },
      {
        name: "twitter:description",
        content: "Community groups within CCGMs, with meeting details and contacts.",
      },
      { name: "twitter:image", content: `${SITE_ORIGIN}/og-ccgms.jpg` },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: VillageGroupsPage,
});

function VillageGroupsPage() {
  const t = useT();
  const { data: groups = [] } = useQuery(villageGroupsQuery);
  const [selected, setSelected] = useState<VillageGroup | null>(null);
  const [category, setCategory] = useState<"all" | "village" | "other">("all");

  const categories = [
    { key: "all" as const, label: t("All groups") },
    { key: "village" as const, label: t("Village-based Groups") },
    { key: "other" as const, label: t("Other Groups") },
  ];
  const inCategory = (key: "all" | "village" | "other") =>
    key === "all"
      ? groups
      : groups.filter((g) => (g.group_category === "other" ? "other" : "village") === key);
  const visible = inCategory(category);
  const activeLabel = categories.find((c) => c.key === category)?.label ?? t("All groups");
  const thumbFor = (key: "all" | "village" | "other") =>
    inCategory(key).find((g) => g.image_url)?.image_url ?? groupsBanner;

  return (
    <>
      <PageHeader
        eyebrow={t("About CCGMs")}
        title={t("Our Groups")}
        description={t("Community groups within CCGMs. Click a group to see meeting details and contacts.")}
      />
      <SidebarPage
        banner={{
          image: thumbFor(category),
          title: activeLabel,
          description: t("Community groups within CCGMs."),
        }}
        sidebar={
          <SidebarSection label={t("Categories")}>
            {categories.map((item) => (
              <SidebarNavItem
                key={item.key}
                icon={<Users className="size-5" />}
                title={item.label}
                meta={`${inCategory(item.key).length} ${t("groups")}`}
                active={category === item.key}
                onClick={() => setCategory(item.key)}
              />
            ))}
          </SidebarSection>
        }
      >
        {(category === "all" ? (["village", "other"] as const) : [category]).map((key) => {
          const rows = inCategory(key);
          if (rows.length === 0) return null;
          return (
            <div key={key} className="mb-10 last:mb-0">
              {category === "all" ? (
                <h2 className="mb-4 text-xl font-medium">
                  {key === "village" ? t("Village-based Groups") : t("Other Groups")}
                </h2>
              ) : null}
              <div className="grid gap-5 sm:grid-cols-2">
                {rows.map((group) => (
                  <Card
                    key={group.id}
                    onClick={() => setSelected(group)}
                    className="cursor-pointer border-border/70 transition-shadow hover:shadow-[var(--shadow-lift)]"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-medium leading-snug">{group.name}</h3>
                        <Badge variant="secondary">{group.region}</Badge>
                      </div>
                      {group.short_description ? (
                        <p className="mt-2 text-sm text-muted-foreground">{group.short_description}</p>
                      ) : null}
                      {group.meeting_info ? (
                        <p className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                          <CalendarDays className="size-4 shrink-0" /> {group.meeting_info}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {visible.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">{t("No groups listed yet.")}</p>
        ) : null}
      </SidebarPage>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected ? (
            <div className="space-y-4">
              <SmartImage
                src={selected.image_url ?? groupsBanner}
                alt={selected.name}
                loading="lazy"
                wrapperClassName="aspect-[16/9] w-full overflow-hidden rounded-xl"
                className="size-full object-cover"
              />
              <DialogHeader>
                <DialogTitle className="text-2xl">{selected.name}</DialogTitle>
              </DialogHeader>
              <Badge variant="secondary">{selected.region}</Badge>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {selected.description ?? selected.short_description}
              </p>
              <ul className="space-y-2 text-sm">
                {selected.meeting_info ? (
                  <li className="flex items-center gap-2">
                    <CalendarDays className="size-4" /> {selected.meeting_info}
                  </li>
                ) : null}
                {selected.contact_name ? (
                  <li className="flex items-center gap-2">
                    <Users className="size-4" /> {selected.contact_name}
                  </li>
                ) : null}
                {selected.contact_phone ? (
                  <li className="flex items-center gap-2">
                    <Phone className="size-4" /> {selected.contact_phone}
                  </li>
                ) : null}
                {selected.contact_email ? (
                  <li className="flex items-center gap-2">
                    <Mail className="size-4" /> {selected.contact_email}
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
