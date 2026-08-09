import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock,
  MapPin,
  PoundSterling,
  Share2,
  Tag,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SmartImage } from "@/components/site/SmartImage";
import { AddToCalendarButton } from "@/components/site/AddToCalendarButton";
import { supabase } from "@/integrations/supabase/client";
import { submitEventRsvp } from "@/lib/rsvp.functions";
import { formatDate, formatMoney, type EventRow } from "@/lib/queries";
import { useT } from "@/lib/i18n";
import { useDyn } from "@/lib/i18n/dynamic";
import { withShareMeta } from "@/lib/share-meta";
import eventFallback from "@/assets/event-fallback.jpg";
import communityTogether from "@/assets/community-together.jpg";

const IMAGE_FALLBACKS = [eventFallback, communityTogether];

export function eventFallbackImage(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 997;
  return IMAGE_FALLBACKS[hash % IMAGE_FALLBACKS.length]!;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-border/70 bg-card px-4 py-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="block break-words text-sm text-foreground">{value}</span>
      </span>
    </li>
  );
}

const rsvpSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(30).optional(),
  membership_number: z.string().trim().max(30).optional(),
  guests: z.coerce.number().int().min(0).max(20).default(0),
  note: z.string().trim().max(500).optional(),
});

function RsvpForm({ event }: { event: EventRow }) {
  const t = useT();
  const [status, setStatus] = useState<"going" | "interested">("going");
  const [guests, setGuests] = useState(0);
  const requiresPayment =
    event.event_type === "ccgms" && Number(event.fee) > 0 && status === "going";
  const isPaidCcgms = event.event_type === "ccgms" && Number(event.fee) > 0;
  const totalFee = (guests + 1) * Number(event.fee ?? 0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [editUrl, setEditUrl] = useState<string | null>(null);
  const sendRsvp = useServerFn(submitEventRsvp);

  useEffect(() => {
    setDone(false);
    setStatus("going");
    setGuests(0);
    setEditUrl(null);
  }, [event.id]);

  async function onSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const parsed = rsvpSchema.safeParse(
      Object.fromEntries(new FormData(formEvent.currentTarget)),
    );
    if (!parsed.success) {
      toast.error(t(parsed.error.issues[0]?.message ?? "Please check the form"));
      return;
    }
    setSaving(true);
    const { data: session } = await supabase.auth.getSession();
    try {
      const result = await sendRsvp({
        data: {
          event_id: event.id,
          user_id: session.session?.user.id ?? null,
          full_name: parsed.data.full_name,
          email: parsed.data.email,
          phone: parsed.data.phone ?? "",
          membership_number: parsed.data.membership_number ?? "",
          guests: parsed.data.guests,
          note: parsed.data.note ?? "",
          status,
        },
      });
      setEditUrl(`${window.location.origin}/rsvp/${result.editToken}`);
    } catch {
      setSaving(false);
      toast.error(t("Your RSVP could not be sent. Please try again."));
      return;
    }
    setSaving(false);
    setDone(true);
    toast.success(t("Thanks — we've emailed you a confirmation."));
  }

  if (done) {
    return (
      <div className="space-y-3 rounded-xl border border-primary/40 bg-accent px-4 py-3">
        <div className="flex items-start gap-3">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm">
            {status === "going"
              ? t("You're on the list. See you there!")
              : t("Thanks for registering your interest.")}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("We've emailed a confirmation with the event details and a link to edit your response.")}
        </p>
        <AddToCalendarButton event={event} className="w-full" />
        {editUrl ? (
          <Button
            type="button"
            variant="soft"
            size="sm"
            onClick={() => window.open(editUrl, "_self")}
          >
            {t("Edit my response")}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border/70 p-4">
      <div>
        <h3 className="text-sm font-semibold">{t("RSVP for this event")}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("Let us know you're coming so we can plan seating and catering.")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label={t("Your response")}>
        {(["going", "interested"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            aria-pressed={status === value}
            className={`min-h-9 rounded-full border px-4 text-sm transition-colors ${
              status === value
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border hover:bg-secondary"
            }`}
          >
            {value === "going" ? t("I'm going") : t("Interested")}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`rsvp-name-${event.id}`}>{t("Your name")}</Label>
          <Input id={`rsvp-name-${event.id}`} name="full_name" required maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`rsvp-email-${event.id}`}>{t("Your email")}</Label>
          <Input
            id={`rsvp-email-${event.id}`}
            name="email"
            type="email"
            required
            maxLength={255}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`rsvp-phone-${event.id}`}>{t("Your phone (optional)")}</Label>
          <Input id={`rsvp-phone-${event.id}`} name="phone" maxLength={30} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`rsvp-guests-${event.id}`}>{t("Extra guests")}</Label>
          <Input
            id={`rsvp-guests-${event.id}`}
            name="guests"
            type="number"
            min={0}
            max={20}
            value={guests}
            onChange={(e) => {
              const n = Number(e.target.value);
              setGuests(Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0);
            }}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`rsvp-member-${event.id}`}>
            {t("Membership number (Recommend)")}
          </Label>
          <Input
            id={`rsvp-member-${event.id}`}
            name="membership_number"
            placeholder="CCGM-1000"
            maxLength={30}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`rsvp-note-${event.id}`}>{t("Anything we should know? (optional)")}</Label>
          <Textarea id={`rsvp-note-${event.id}`} name="note" rows={2} maxLength={500} />
        </div>
      </div>

      <div className="flex flex-row flex-wrap items-center justify-between gap-3">
        {isPaidCcgms ? (
          <div className="text-sm">
            <span className="text-muted-foreground">{t("Total fee")}: </span>
            <span className="text-[1.75rem] font-bold leading-none">{formatMoney(totalFee)}</span>
            <span className="block text-xs text-muted-foreground">
              {`${guests + 1} × ${formatMoney(Number(event.fee))}`}
            </span>
          </div>
        ) : null}
        <Button
          type="submit"
          variant="hero"
          className={isPaidCcgms ? "flex-1 min-w-[9rem]" : "w-full"}
          disabled={saving}
        >
          {saving ? t("Sending…") : requiresPayment ? t("Book Now") : t("Send RSVP")}
        </Button>
      </div>
    </form>
  );
}

export function EventDialog({
  event,
  onOpenChange,
  shareUrl,
}: {
  event: EventRow | null;
  onOpenChange: (open: boolean) => void;
  /** Link copied by the share button — usually the events page with current filters. */
  shareUrl?: string | undefined;
}) {
  const t = useT();
  const dyn = useDyn();
  const isCcgms = event?.event_type === "ccgms";

  async function share() {
    if (!event) return;
    const basePath = shareUrl ?? `/events?event=${event.id}`;
    const withMeta = withShareMeta(
      basePath,
      dyn(event.title),
      event.image_url ?? eventFallbackImage(event.id),
    );
    const url = /^https?:\/\//i.test(withMeta)
      ? withMeta
      : typeof window !== "undefined"
        ? `${window.location.origin}${withMeta}`
        : withMeta;
    try {
      if (navigator.share) {
        await navigator.share({ title: dyn(event.title), url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success(t("Event link copied — paste it to invite others."));
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <Dialog open={!!event} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        {event ? (
          <div className="absolute right-12 top-6 flex h-7 items-center">
            <span className="rounded-full border border-primary/30 bg-accent px-3 py-1 text-xs font-semibold text-foreground">
              <span className="text-muted-foreground">{t("Entry fee")}: </span>
              {Number(event.fee) > 0 ? formatMoney(Number(event.fee)) : t("Free")}
            </span>
          </div>
        ) : null}
        <DialogHeader>
          <DialogTitle className="text-left">{dyn(event?.title)}</DialogTitle>
          <DialogDescription className="text-left">
            {event
              ? `${formatDate(event.start_at, true)}${event.location ? ` · ${dyn(event.location)}` : ""}`
              : null}
          </DialogDescription>
        </DialogHeader>
        {event ? (
          <div className="space-y-4">
            <SmartImage
              src={event.image_url ?? eventFallbackImage(event.id)}
              alt={event.image_url ? dyn(event.title) : t("Community members celebrating together")}
              loading="lazy"
              width={1280}
              height={720}
              wrapperClassName="aspect-[16/9] w-full rounded-xl border border-border/70"
              className="size-full object-cover"
            />
            <p className="text-sm text-foreground/85">{dyn(event.description)}</p>
            <div className="flex flex-wrap gap-2">
              <AddToCalendarButton event={event} className="flex-1" />
              <Button
                type="button"
                variant="soft"
                className="flex-1"
                onClick={share}
                aria-label={t("Share this event")}
              >
                <Share2 aria-hidden="true" /> {t("Share event")}
              </Button>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              <DetailRow
                icon={CalendarDays}
                label={t("Date & time")}
                value={formatDate(event.start_at, true)}
              />
              {event.end_at ? (
                <DetailRow icon={Clock} label={t("Ends")} value={formatDate(event.end_at, true)} />
              ) : null}
              <DetailRow
                icon={MapPin}
                label={t("Location")}
                value={event.location ? dyn(event.location) : t("To be confirmed")}
              />
              {event.organiser ? (
                <DetailRow icon={UserRound} label={t("Organiser")} value={event.organiser} />
              ) : null}
              <DetailRow
                icon={PoundSterling}
                label={t("Entry fee")}
                value={
                  Number(event.fee) > 0
                    ? `${formatMoney(Number(event.fee))}${isCcgms ? ` · ${t("Payable online")}` : ""}`
                    : t("Free")
                }
              />
              <li className="flex items-start gap-3 rounded-xl border border-border/70 bg-card px-4 py-3">
                <Tag className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t("Type")}
                  </span>
                  <Badge
                    className={
                      isCcgms
                        ? "mt-1 bg-primary text-primary-foreground"
                        : "mt-1 bg-terracotta text-terracotta-foreground"
                    }
                  >
                    {isCcgms ? t("CCGMs event") : t("Other event")}
                  </Badge>
                </span>
              </li>
            </ul>
            <RsvpForm key={event.id} event={event} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
