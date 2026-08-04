import { buildEventIcs, slugify } from "@/lib/ics";
import type { EventRow } from "@/lib/queries";

function stamp(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function endOf(event: EventRow) {
  return (
    event.end_at ??
    new Date(new Date(event.start_at).getTime() + 2 * 60 * 60 * 1000).toISOString()
  );
}

/** One-click "add to Google Calendar" link. */
export function googleCalendarUrl(event: EventRow) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${stamp(event.start_at)}/${stamp(endOf(event))}`,
  });
  if (event.description) params.set("details", event.description);
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Outlook / Office 365 web calendar link. */
export function outlookCalendarUrl(event: EventRow) {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: new Date(event.start_at).toISOString(),
    enddt: new Date(endOf(event)).toISOString(),
  });
  if (event.description) params.set("body", event.description);
  if (event.location) params.set("location", event.location);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Apple Calendar opens .ics files directly, so the deep link is a data URL of
 * the calendar file — one tap on iOS/macOS adds the event.
 */
export function appleCalendarUrl(event: EventRow) {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(buildEventIcs(event))}`;
}

export function icsFileName(event: EventRow) {
  return `${slugify(event.title)}.ics`;
}
