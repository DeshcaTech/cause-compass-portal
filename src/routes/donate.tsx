import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { campaignsQuery, formatMoney } from "@/lib/queries";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/donate")({
  validateSearch: (search: Record<string, unknown>): { campaign?: string | undefined } => ({
    campaign: typeof search['campaign'] === "string" ? search['campaign'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Donate — Give to the CCGMs Community" },
      {
        name: "description",
        content:
          "Make a one-off donation to CCGMs or give to an active fundraising campaign. Membership number optional but recommended.",
      },
      { property: "og:title", content: "Donate — Give to the CCGMs Community" },
      { property: "og:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { name: "twitter:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { property: "og:description", content: "Give any amount, to any active campaign." },
    ],
  }),
  component: DonatePage,
});

const PRESETS = [10, 25, 50, 100, 250];

const schema = z.object({
  amount: z.coerce.number().positive("Enter an amount greater than zero").max(100000),
  donor_name: z.string().trim().max(120).optional(),
  email: z.string().trim().email("Enter a valid email").max(255),
  membership_number: z.string().trim().max(30).optional(),
  message: z.string().trim().max(500).optional(),
});

function DonatePage() {
  const t = useT();
  const { campaign: campaignParam } = Route.useSearch();
  const { data: campaigns = [] } = useQuery(campaignsQuery);
  const active = campaigns.filter((c) => c.status === "active");

  const [campaignId, setCampaignId] = useState<string>(campaignParam ?? "general");
  const [amount, setAmount] = useState("25");
  const [customAmount, setCustomAmount] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = schema.safeParse({ ...values, amount });
    if (!parsed.success) {
      toast.error(t(parsed.error.issues[0]?.message ?? "Please check the form"));
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("donations").insert({
      campaign_id: campaignId === "general" ? null : campaignId,
      amount: parsed.data.amount,
      donor_name: anonymous ? null : parsed.data.donor_name || null,
      email: parsed.data.email,
      membership_number: parsed.data.membership_number || null,
      message: parsed.data.message || null,
      is_anonymous: anonymous,
    });
    setSaving(false);
    if (error) {
      toast.error(t("We couldn't record your donation. Please try again."));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <>
        <PageHeader eyebrow={t("Donate")} title={t("Thank you")} />
        <section className="container-page py-16">
          <Card className="mx-auto max-w-xl border-border/70 text-center">
            <CardContent className="p-10">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[image:var(--gradient-gold)] text-gold-foreground">
                <Heart className="size-7" />
              </span>
              <h2 className="mt-6 text-2xl">{t("Your pledge of {amount} is recorded").replace("{amount}", formatMoney(Number(amount)))}</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {t("The treasurer will email you payment instructions and a receipt. Thank you for standing with the community.")}
              </p>
            </CardContent>
          </Card>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={t("Get involved")}
        title={t("Make a donation")}
        description={t("Give freely, or direct your gift to one of our active fundraising campaigns.")}
      />
      <section className="container-page py-14">
        <Card className="mx-auto max-w-2xl border-border/70">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gift-destination">{t("Where should your gift go?")}</Label>
                <Select value={campaignId} onValueChange={setCampaignId}>
                  <SelectTrigger id="gift-destination" className="w-full">
                    <SelectValue placeholder={t("Choose a destination")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      {t("General community fund (random donation)")}
                    </SelectItem>
                    {active.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t("Amount (GBP)")}</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setCustomAmount(false);
                        setAmount(String(preset));
                      }}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                        !customAmount && amount === String(preset)
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      {formatMoney(preset)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setCustomAmount(true);
                      setAmount("");
                    }}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      customAmount
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {t("Other")}
                  </button>
                </div>
                {customAmount ? (
                  <Input
                    id="amount"
                    type="number"
                    min={1}
                    step="1"
                    autoFocus
                    placeholder={t("Enter your amount")}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="membership_number">
                  {t("Membership number (Recommend)")}
                </Label>
                <Input id="membership_number" name="membership_number" placeholder="CCGM-1000" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="donor_name">{t("Your name")}</Label>
                  <Input id="donor_name" name="donor_name" disabled={anonymous} maxLength={120} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("Email")}</Label>
                  <Input id="email" name="email" type="email" required maxLength={255} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="anonymous"
                  checked={anonymous}
                  onCheckedChange={(value) => setAnonymous(value === true)}
                />
                <Label htmlFor="anonymous" className="font-normal">
                  {t("Give anonymously")}
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t("Message (optional)")}</Label>
                <Textarea id="message" name="message" rows={3} maxLength={500} />
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={saving}>
                {saving ? t("Submitting…") : `${t("Donate")} ${formatMoney(Number(amount) || 0)}`}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {t("Donations are recorded here and confirmed by the treasurer, who will send payment instructions and a receipt by email.")}
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
