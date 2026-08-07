import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { assetsQuery, formatMoney, type CommunityAsset } from "@/lib/queries";
import assetFallback from "@/assets/asset-fallback.jpg";
import { useT } from "@/lib/i18n";
import { useDyn } from "@/lib/i18n/dynamic";

export const Route = createFileRoute("/assets")({
  head: () => ({
    meta: [
      { title: "Assets Rent — CCGMs Community Equipment" },
      {
        name: "description",
        content:
          "Members can request community assets such as chairs, tables, marquees and PA systems for their events.",
      },
      { property: "og:title", content: "Assets Rent — CCGMs Community Equipment" },
      { property: "og:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { name: "twitter:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      {
        property: "og:description",
        content: "Request chairs, tables, cooking pots, marquees and sound equipment.",
      },
    ],
  }),
  component: AssetsPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(6, "Enter a phone number").max(30),
  membership_number: z.string().trim().max(30).optional(),
  quantity: z.coerce.number().int().min(1).max(50),
  start_date: z.string().min(1, "Choose a start date"),
  end_date: z.string().min(1, "Choose a return date"),
  purpose: z.string().trim().max(500).optional(),
});

function AssetsPage() {
  const t = useT();
  const dyn = useDyn();
  const { data: assets = [] } = useQuery(assetsQuery);
  const [selected, setSelected] = useState<CommunityAsset | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      toast.error(t(parsed.error.issues[0]?.message ?? "Please check the form"));
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("asset_requests").insert({
      asset_id: selected?.id ?? null,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      membership_number: parsed.data.membership_number || null,
      quantity: parsed.data.quantity,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      purpose: parsed.data.purpose || null,
    });
    setSaving(false);
    if (error) {
      toast.error(t("Your request could not be sent. Please try again."));
      return;
    }
    toast.success(t("Request received — the assets team will confirm availability by email."));
    setSelected(null);
  }

  return (
    <>
      <PageHeader
        eyebrow={t("About CCGMs")}
        title={t("Rent community assets")}
        description={t("Equipment bought and maintained by the community, available to members at reduced rates.")}
      />
      <section className="container-page py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset.id} className="flex flex-col border-border/70">
              <CardContent className="flex flex-1 flex-col p-6">
                <img
                  src={asset.image_url ?? assetFallback}
                  alt={dyn(asset.name)}
                  loading="lazy"
                  className="aspect-[16/9] w-full rounded-xl object-cover"
                />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <h2 className="text-lg">{dyn(asset.name)}</h2>
                  <Badge variant={asset.is_available ? "secondary" : "outline"}>
                    {asset.quantity} {t("available")}
                  </Badge>
                </div>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{dyn(asset.description)}</p>
                <dl className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t("Member rate")}</dt>
                    <dd className="font-medium">{formatMoney(asset.member_price ?? 0)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t("Non-member")}</dt>
                    <dd>{formatMoney(asset.non_member_price ?? 0)}</dd>
                  </div>
                </dl>
                <Button variant="hero" className="mt-5" onClick={() => setSelected(asset)}>
                  {t("Request this asset")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("Request:")} {dyn(selected?.name)}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="membership_number">{t("Membership number (optional, recommended)")}</Label>
              <Input id="membership_number" name="membership_number" placeholder="CCGM-1000" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t("Full name")}</Label>
                <Input id="full_name" name="full_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("Email")}</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("Phone")}</Label>
                <Input id="phone" name="phone" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">{t("Quantity")}</Label>
                <Input id="quantity" name="quantity" type="number" min={1} defaultValue={1} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">{t("Collection date")}</Label>
                <Input id="start_date" name="start_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">{t("Return date")}</Label>
                <Input id="end_date" name="end_date" type="date" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">{t("What is it for?")}</Label>
              <Textarea id="purpose" name="purpose" rows={3} maxLength={500} />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={saving}>
              {saving ? t("Sending…") : t("Send request")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
