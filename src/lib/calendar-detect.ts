export type CalendarTarget = "google" | "apple" | "outlook";

const STORAGE_KEY = "ccgms:preferred-calendar";

/** Remembered choice wins — it is the strongest signal of the account the user actually uses. */
export function getRememberedCalendar(): CalendarTarget | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "google" || value === "apple" || value === "outlook" ? value : null;
}

export function rememberCalendar(target: CalendarTarget) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, target);
}

/**
 * Best guess of the calendar the visitor uses, from the device/platform:
 * iOS & macOS -> Apple Calendar, Windows -> Outlook, everything else -> Google.
 */
export function detectCalendarTarget(): CalendarTarget {
  if (typeof navigator === "undefined") return "google";
  const ua = navigator.userAgent || "";
  const platform = (navigator as Navigator & { platform?: string }).platform || "";
  const isApple =
    /iPhone|iPad|iPod|Macintosh/i.test(ua) ||
    /Mac|iPhone|iPad|iPod/i.test(platform) ||
    (/Mac/i.test(platform) && (navigator.maxTouchPoints ?? 0) > 1);
  if (isApple) return "apple";
  if (/Android|CrOS/i.test(ua)) return "google";
  if (/Windows|Win32|Win64/i.test(ua + platform)) return "outlook";
  return "google";
}

export function preferredCalendarTarget(): CalendarTarget {
  return getRememberedCalendar() ?? detectCalendarTarget();
}

export const calendarLabels: Record<CalendarTarget, string> = {
  google: "Google Calendar",
  apple: "Apple Calendar",
  outlook: "Outlook",
};
