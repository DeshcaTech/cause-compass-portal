import { CalendarDays, Clock, MapPin, Tag, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, type EventRow } from "@/lib/queries";
import { useT } from "@/lib/i18n";
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

export function EventDialog({
  event,
  onOpenChange,
}: {
  event: EventRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const isCcgms = event?.event_type === "ccgms";

  return (
    <Dialog open={!!event} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-left">{event?.title}</DialogTitle>
          <DialogDescription className="text-left">
            {event
              ? `${formatDate(event.start_at, true)}${event.location ? ` · ${event.location}` : ""}`
              : null}
          </DialogDescription>
        </DialogHeader>
        {event ? (
          <div className="space-y-4">
            <img
              src={event.image_url ?? eventFallbackImage(event.id)}
              alt={event.image_url ? event.title : t("Community members celebrating together")}
              loading="lazy"
              width={1280}
              height={720}
              className="aspect-[16/9] w-full rounded-xl border border-border/70 bg-secondary object-cover"
            />
            <p className="text-sm text-foreground/85">{event.description}</p>
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
                value={event.location ?? t("To be confirmed")}
              />
              {event.organiser ? (
                <DetailRow icon={UserRound} label={t("Organiser")} value={event.organiser} />
              ) : null}
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
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
