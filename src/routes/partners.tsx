import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/site/PageHeader";
import { FilterPage, FilterSelect } from "@/components/site/FilterPage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PartnerDialog } from "@/components/site/PartnerDialog";
import { partnersQuery, type Partner } from "@/lib/queries";
import businessFallback from "@/assets/business-fallback.jpg";
import { useT } from "@/lib/i18n";
import { useDyn } from "@/lib/i18n/dynamic";
import { searchString, useSearchFilter } from "@/lib/use-search-filter";

export const Route = createFileRoute("/partners")({
  validateSearch: (search: Record<string, unknown>): { category?: string | undefined; partner?: string | undefined} => ({
    category: searchString(search, "category"),
    partner: searchString(search, "partner"),
  }),
  head: () => ({
    meta: [
      { title: "Partners — Businesses Owned by CCGMs Members" },
      {
        name: "description",
        content:
          "Discover and support businesses owned by members of the CCGMs community: catering, legal, beauty, building, travel and more.",
      },
      { property: "og:title", content: "Partners — Businesses Owned by CCGMs Members" },
      { property: "og:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { name: "twitter:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      {
        property: "og:description",
        content: "A directory of member-owned businesses serving the community.",
      },
    ],
  }),
  component: PartnersPage,
});

function PartnersPage() {
  const t = useT();
  const dyn = useDyn();
  const { data: partners = [] } = useQuery(partnersQuery);
  // The open business lives in the URL so the popup can be shared as a link.
  const navigate = useNavigate({ from: "/partners" });
  const search = Route.useSearch();
  const selected = partners.find((p) => p.id === search.partner) ?? null;
  const setSelected = (partner: Partner | null) =>
    navigate({
      search: (prev: Record<string, string | undefined>) => ({ ...prev, partner: partner?.id }),
      replace: !partner,
    });
  const [category, setCategory] = useSearchFilter("category", "All");
  const categories = ["All", ...Array.from(new Set(partners.map((p) => p.category)))];
  const filtered = category === "All" ? partners : partners.filter((p) => p.category === category);
  return (
    <>
      <PageHeader
        eyebrow={t("Partners")}
        title={t("Businesses owned by our members")}
        description={t("Shop, hire and refer within the community. Click a business to see full details.")}
      />
      <FilterPage
        filters={(
          <FilterSelect
            label={t("Category")}
            value={category}
            onChange={setCategory}
            options={categories.map((item) => ({
              value: item,
              label: item === "All" ? t("All") : dyn(item),
              meta: `${
                item === "All"
                  ? partners.length
                  : partners.filter((p) => p.category === item).length
              } ${t("businesses")}`,
            }))}
          />
        )}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {filtered.map((partner) => (
            <Card
              key={partner.id}
              onClick={() => setSelected(partner)}
              className="cursor-pointer border-border/70 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
            >
              <CardContent className="p-6">
                <img
                  src={partner.logo_url ?? businessFallback}
                  alt={partner.business_name}
                  loading="lazy"
                  className="mb-4 aspect-[16/9] w-full rounded-xl object-cover"
                />
                <h2 className="mt-4 text-lg">{partner.business_name}</h2>
                <Badge variant="secondary" className="mt-2">
                  {dyn(partner.category)}
                </Badge>
                <p className="mt-3 text-sm text-muted-foreground">{dyn(partner.short_description)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            {t("No businesses in this category yet.")}
          </p>
        ) : null}
      </FilterPage>

      <PartnerDialog partner={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </>
  );
}
