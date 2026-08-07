import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { subscribeToNews } from "@/lib/news.functions";
import { useT } from "@/lib/i18n";

export function NewsSubscribe() {
  const t = useT();
  const subscribe = useServerFn(subscribeToNews);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [membershipNumber, setMembershipNumber] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await subscribe({
        data: {
          email,
          full_name: fullName || undefined,
          membership_number: membershipNumber || undefined,
        },
      });
      toast.success(t("You're subscribed — we'll email you when new news is published."));
      setEmail("");
      setFullName("");
      setMembershipNumber("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("Could not subscribe, please try again."),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-border/70 bg-muted/30">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-5" />
          </span>
          <div>
            <h2 className="text-h4 text-balance">{t("Get news by email")}</h2>
            <p className="text-body-sm text-muted-foreground">
              {t("Subscribe and we'll send you every new announcement.")}
            </p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-4">
          <Input
            type="email"
            required
            placeholder={t("Email address")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label={t("Email address")}
          />
          <Input
            placeholder={t("Full name (optional)")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-label={t("Full name")}
          />
          <Input
            placeholder={t("Membership number (optional)")}
            value={membershipNumber}
            onChange={(e) => setMembershipNumber(e.target.value)}
            aria-label={t("Membership number")}
          />
          <Button type="submit" disabled={busy}>
            {busy ? t("Subscribing…") : t("Subscribe")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
