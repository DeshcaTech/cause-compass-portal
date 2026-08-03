import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Globe, Mail, MapPin, Phone, Store } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { partnersQuery, type Partner } from "@/lib/queries";

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
      {
        property: "og:description",
        content: "A directory of member-owned businesses serving the community.",
      },
    ],
  }),
  component: PartnersPage,
});

function PartnersPage() {
  const { data: partners = [] } = useQuery(partnersQuery);
  const [selected, setSelected] = useState<Partner | null>(null);
  const [category, setCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(partners.map((p) => p.category)))];
  const filtered = category === "All" ? partners : partners.filter((p) => p.category === category);

  return (
    <>
      <PageHeader
        eyebrow="Partners"
        title="Businesses owned by our members"
        description="Shop, hire and refer within the community. Click a business to see full details."
      />
      <section className="container-page py-14">
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                category === item
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((partner) => (
            <Card
              key={partner.id}
              onClick={() => setSelected(partner)}
              className="cursor-pointer border-border/70 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
            >
              <CardContent className="p-6">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-[image:var(--gradient-gold)] text-gold-foreground">
                  <Store className="size-5" />
                </span>
                <h2 className="mt-4 text-lg">{partner.business_name}</h2>
                <Badge variant="secondary" className="mt-2">
                  {partner.category}
                </Badge>
                <p className="mt-3 text-sm text-muted-foreground">{partner.short_description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.business_name}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4">
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
                    <Globe /> Visit website
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