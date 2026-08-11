import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Mail, Phone, Users } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { FilterPage, FilterSelect } from "@/components/site/FilterPage";
import { SmartImage } from "@/components/site/SmartImage";
import { ShareButton } from "@/components/site/ShareButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { villageGroupsQuery, type VillageGroup } from "@/lib/queries";
import { useT } from "@/lib/i18n";
import { useDyn } from "@/lib/i18n/dynamic";
import { mergeShareMeta } from "@/lib/share-meta";
import { useDialogParam } from "@/lib/use-dialog-param";
import { fillTemplate, siteSettingsQuery, whatsappHref } from "@/lib/site-settings";
import { WhatsAppIcon } from "@/components/site/icons/WhatsApp";
import groupsBanner from "@/assets/community-together.jpg";

const SITE_ORIGIN = "https://cause-compass-portal.lovable.app";
const PAGE_URL = `${SITE_ORIGIN}/village-groups`;

const CATEGORIES = ["all", "village", "other"] as const;
type CategoryKey = (typeof CATEGORIES)[number];

const searchSchema = z.object({
  category: fallback(z.string(), "all").default("all"),
  group: z.string().optional(),
  st: z.string().optional(),
  si: z.string().optional(),
});

export const Route = createFileRoute("/village-groups")({
  validateSearch: zodValidator(searchSchema),
  head: ({ match }) => ({
    meta: mergeShareMeta([
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
    ], match.search as Record<string, unknown>),
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: VillageGroupsPage,
});

function VillageGroupsPage() {
  const t = useT();
  const dyn = useDyn();
  const navigate = useNavigate({ from: "/village-groups" });
  const search = Route.useSearch();
  const category: CategoryKey = CATEGORIES.includes(search.category as CategoryKey)
    ? (search.category as CategoryKey)
    : "all";
  const { data: groups = [] } = useQuery(villageGroupsQuery);
  // The open group lives in the URL so the popup can be shared as a link.
  const selected = groups.find((g) => g.id === search.group) ?? null;
  const openGroup = useDialogParam("group");
  const setSelected = (group: VillageGroup | null) => openGroup(group?.id ?? null);

  const categories = [
    { key: "all" as const, label: t("All groups") },
    { key: "village" as const, label: t("Village-based Groups") },
    { key: "other" as const, label: t("Other Groups") },
  ];
  const inCategory = (key: CategoryKey) =>
    key === "all"
      ? groups
      : groups.filter((g) => (g.group_category === "other" ? "other" : "village") === key);
  const visible = inCategory(category);

  return (
    <>
      <PageHeader
        eyebrow={t("About CCGMs")}
        title={t("Our Groups")}
        description={t("Community groups within CCGMs. Click a group to see meeting details and contacts.")}
      />
      <FilterPage
        filters={(
          <FilterSelect
            label={t("Category")}
            value={category}
            onChange={(value) =>
              navigate({
                search: (prev: { category?: string }) => ({
                  ...prev,
                  category: value === "all" ? undefined : value,
                }),
                replace: true,
              })
            }
            options={categories.map((item) => ({
              value: item.key,
              label: item.label,
              meta: `${inCategory(item.key).length} ${t("groups")}`,
            }))}
          />
        )}
      >
        <div>
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
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                        <p className="mt-2 text-sm text-muted-foreground">{dyn(group.short_description)}</p>
                      ) : null}
                      {group.meeting_info ? (
                        <p className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                          <CalendarDays className="size-4 shrink-0" /> {dyn(group.meeting_info)}
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
        </div>
      </FilterPage>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected ? (
            <div className="space-y-4">
              <SmartImage
                src={selected.image_url ?? groupsBanner}
                alt={selected.name}
                loading="lazy"
                wrapperClassName="max-h-[60vh] w-full overflow-hidden rounded-xl"
                className="max-h-[60vh] w-full object-contain"
              />
              <DialogHeader>
                <DialogTitle className="text-2xl">{selected.name}</DialogTitle>
              </DialogHeader>
              <Badge variant="secondary">{selected.region}</Badge>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {dyn(selected.description ?? selected.short_description)}
              </p>
              <ul className="space-y-2 text-sm">
                {selected.meeting_info ? (
                  <li className="flex items-center gap-2">
                    <CalendarDays className="size-4" /> {dyn(selected.meeting_info)}
                  </li>
                ) : null}
                {selected.contact_name ? (
                  <li className="flex items-center gap-2">
                    <Users className="size-4" /> {selected.contact_name}
                  </li>
                ) : null}
                {selected.contact_phone ? (
                  <li>
                    <a
                      href={`tel:${selected.contact_phone.replace(/\s+/g, "")}`}
                      className="flex items-center gap-2 underline-offset-4 hover:underline"
                    >
                      <Phone className="size-4 shrink-0" /> {selected.contact_phone}
                    </a>
                  </li>
                ) : null}
                {whatsappHref(selected.contact_phone) ? (
                  <li>
                    <a
                      href={whatsappHref(selected.contact_phone)!}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 underline-offset-4 hover:underline"
                    >
                      <WhatsAppIcon className="size-4 shrink-0 text-[#25D366]" />{" "}
                      {t("Message on WhatsApp")}
                    </a>
                  </li>
                ) : null}
                {selected.contact_email ? (
                  <li>
                    <a
                      href={`mailto:${selected.contact_email}`}
                      className="flex items-center gap-2 break-all underline-offset-4 hover:underline"
                    >
                      <Mail className="size-4 shrink-0" /> {selected.contact_email}
                    </a>
                  </li>
                ) : null}
              </ul>
              <ShareButton
                title={selected.name}
                path={`/village-groups?group=${selected.id}`}
                image={selected.image_url ?? null}
                label={t("Share group")}
                className="w-full"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
