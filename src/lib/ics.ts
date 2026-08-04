import type { EventRow } from "@/lib/queries";

function toIcsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function fold(line: string) {
  if (line.length <= 74) return line;
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  parts.push(rest);
  return parts.join("\r\n");
}

export function buildEventIcs(event: EventRow) {
  const start = toIcsDate(event.start_at);
  const end = toIcsDate(
    event.end_at ?? new Date(new Date(event.start_at).getTime() + 2 * 60 * 60 * 1000).toISOString(),
  );
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CCGMs//Community Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@ccgms`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeText(event.title)}`,
    event.description ? `DESCRIPTION:${escapeText(event.description)}` : null,
    event.location ? `LOCATION:${escapeText(event.location)}` : null,
    event.organiser ? `ORGANIZER;CN=${escapeText(event.organiser)}:MAILTO:hello@ccgms.org` : null,
    event.ticket_url ? `URL:${escapeText(event.ticket_url)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => Boolean(line));

  return lines.map(fold).join("\r\n");
}

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "event"
  );
}

export function downloadEventIcs(event: EventRow) {
  const blob = new Blob([buildEventIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(event.title)}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
