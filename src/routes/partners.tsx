import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Globe, Mail, MapPin, Phone } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { FilterPage, FilterSelect } from "@/components/site/FilterPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { partnersQuery, type Partner } from "@/lib/queries";
import businessFallback from "@/assets/business-fallback.jpg";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/partners")({
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
  const { data: partners = [] } = useQuery(partnersQuery);
  const [selected, setSelected] = useState<Partner | null>(null);
  const [category, setCategory] = useState("All");
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
              label: item === "All" ? t("All") : item,
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
                  {partner.category}
                </Badge>
                <p className="mt-3 text-sm text-muted-foreground">{partner.short_description}</p>
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

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.business_name}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4">
              <img
                src={selected.logo_url ?? businessFallback}
                alt={selected.business_name}
                className="aspect-[16/9] w-full rounded-xl object-cover"
              />
              <Badge variant="secondary">{selected.category}</Badge>
              <p className="text-sm text-foreground/85">{selected.description}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {selected.phone ? (
                  <li className="flex items-center gap-2">
                    <Phone className="size-4" /> {selected.phone}
                  </li>
                ) : null}
                {selected.email ? (
                  <li className="flex items-center gap-2">
                    <Mail className="size-4" /> {selected.email}
                  </li>
                ) : null}
                {selected.address ? (
                  <li className="flex items-center gap-2">
                    <MapPin className="size-4" /> {selected.address}
                  </li>
                ) : null}
              </ul>
              {selected.website ? (
                <Button asChild variant="hero" className="w-full">
                  <a href={selected.website} target="_blank" rel="noreferrer">
                    <Globe /> {t("Visit website")}
                  </a>
                </Button>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
