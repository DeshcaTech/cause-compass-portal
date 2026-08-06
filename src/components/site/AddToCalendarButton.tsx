import { useEffect, useState } from "react";
import { Apple, CalendarDays, CalendarPlus, ChevronDown, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadEventIcs } from "@/lib/ics";
import { googleCalendarUrl, outlookCalendarUrl } from "@/lib/calendar-links";
import {
  calendarLabels,
  preferredCalendarTarget,
  rememberCalendar,
  type CalendarTarget,
} from "@/lib/calendar-detect";
import { useT } from "@/lib/i18n";
import type { EventRow } from "@/lib/queries";

/**
 * Split button that always reads "Add to calendar" — the primary click sends the
 * event to the calendar we detect for this device (Apple on iOS/macOS, Outlook on
 * Windows with an Outlook account, Google elsewhere); the chevron overrides it.
 */
export function AddToCalendarButton({
  event,
  className,
  variant = "soft",
}: {
  event: EventRow;
  className?: string;
  variant?: "soft" | "hero" | "outline";
}) {
  const t = useT();
  // Detected on the client only (SSR has no navigator).
  const [target, setTarget] = useState<CalendarTarget | null>(null);
  useEffect(() => setTarget(preferredCalendarTarget()), []);

  function addToCalendar(choice: CalendarTarget) {
    rememberCalendar(choice);
    setTarget(choice);
    if (choice === "google") {
      window.open(googleCalendarUrl(event), "_blank", "noopener,noreferrer");
      return;
    }
    if (choice === "outlook") {
      window.open(outlookCalendarUrl(event), "_blank", "noopener,noreferrer");
      return;
    }
    // Apple Calendar (and any desktop default handler) opens the .ics file directly.
    downloadEventIcs(event);
  }

  return (
    <div className={`flex min-w-0 ${className ?? ""}`}>
      <Button
        type="button"
        variant={variant}
        className="flex-1 rounded-r-none"
        onClick={() => addToCalendar(target ?? "google")}
        title={target ? `${t("Add to")} ${t(calendarLabels[target])}` : t("Add to calendar")}
      >
        <CalendarPlus aria-hidden="true" />
        <span className="truncate">{t("Add to calendar")}</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant={variant}
            size="icon"
            className="rounded-l-none border-l border-border/60"
            aria-label={t("Choose another calendar")}
          >
            <ChevronDown aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onSelect={() => addToCalendar("google")}>
            <CalendarDays aria-hidden="true" /> {t("Google Calendar")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => addToCalendar("apple")}>
            <Apple aria-hidden="true" /> {t("Apple Calendar")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => addToCalendar("outlook")}>
            <CalendarDays aria-hidden="true" /> {t("Outlook")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => downloadEventIcs(event)}>
            <Download aria-hidden="true" /> {t("Download .ics file")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}