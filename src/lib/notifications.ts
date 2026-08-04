import type { CampaignSignal } from "@/components/admin/CampaignProgress";

export type NotificationKind = "milestone" | "behind";

export type StoredNotification = {
  id: string;
  kind: NotificationKind;
  campaignId: string;
  campaignName: string;
  title: string;
  body: string;
  firstSeen: string;
  read: boolean;
};

const STORAGE_KEY = "ccgm.fundraising.notifications.v1";
const EVENT = "ccgm-notifications-changed";

const money = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function readNotifications(): StoredNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredNotification[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: StoredNotification[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function subscribeNotifications(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

/** Turns the current campaign signals into stable alert records. */
export function buildAlerts(signals: CampaignSignal[]) {
  const alerts: Omit<StoredNotification, "firstSeen" | "read">[] = [];
  for (const s of signals) {
    if (s.milestone !== null) {
      alerts.push({
        id: `${s.id}:milestone:${s.milestone}`,
        kind: "milestone",
        campaignId: s.id,
        campaignName: s.name,
        title:
          s.milestone >= 100
            ? `${s.name} hit its target`
            : `${s.name} passed ${s.milestone}% of its target`,
        body: `${money.format(s.raised)} raised of ${money.format(s.goal)} (${s.pct}%).`,
      });
    }
    if (s.behindBy !== null) {
      alerts.push({
        id: `${s.id}:behind:${Math.round(s.behindBy / 5) * 5}`,
        kind: "behind",
        campaignId: s.id,
        campaignName: s.name,
        title: `${s.name} is behind schedule`,
        body: `${s.pct}% raised versus ${s.expectedPct}% expected by now${
          s.daysLeft !== null && s.daysLeft > 0 ? ` — ${s.daysLeft} days left.` : "."
        }`,
      });
    }
  }
  return alerts;
}

/**
 * Records any alerts not seen before and returns the newly created ones so the
 * caller can toast only genuinely new events.
 */
export function recordAlerts(signals: CampaignSignal[]): StoredNotification[] {
  const existing = readNotifications();
  const known = new Set(existing.map((n) => n.id));
  const created = buildAlerts(signals)
    .filter((a) => !known.has(a.id))
    .map<StoredNotification>((a) => ({ ...a, firstSeen: new Date().toISOString(), read: false }));
  if (created.length) write([...created, ...existing]);
  return created;
}

export function markRead(id: string, read = true) {
  write(readNotifications().map((n) => (n.id === id ? { ...n, read } : n)));
}

export function markAllRead() {
  write(readNotifications().map((n) => ({ ...n, read: true })));
}

export function clearNotifications() {
  write([]);
}