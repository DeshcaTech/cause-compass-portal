import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { FilterPage, FilterSelect } from "@/components/site/FilterPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { eventsQuery, formatDate, formatMoney, type EventRow } from "@/lib/queries";
import { EventDialog, eventFallbackImage } from "@/components/site/EventDialog";
import { SmartImage } from "@/components/site/SmartImage";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/events")({
  // Filters, the open tab and the open event live in the URL so links can be shared.
  validateSearch: (search: Record<string, unknown>): { event?: string | undefined; type?: "all" | "ccgms" | "other" | undefined; tab?: "all" | "calendar" | "coming" | "past" | undefined} => ({
    event: typeof search['event'] === "string" ? search['event'] : undefined,
    type:
      search['type'] === "ccgms" || search['type'] === "other" || search['type'] === "all"
        ? (search['type'] as "all" | "ccgms" | "other")
        : undefined,
    tab:
      search['tab'] === "coming" ||
      search['tab'] === "past" ||
      search['tab'] === "all" ||
      search['tab'] === "calendar"
        ? (search['tab'] as "coming" | "past" | "all" | "calendar")
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Events — CCGMs Community Calendar" },
      {
        name: "description",
        content:
          "Coming events, past events and a monthly calendar of CCGMs events and other community events.",
      },
      { property: "og:title", content: "Events — CCGMs Community Calendar" },
      { property: "og:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      { name: "twitter:image", content: "https://cause-compass-portal.lovable.app/og-ccgms.jpg" },
      {
        property: "og:description",
        content: "Browse coming and past events, or explore the monthly community calendar.",
      },
    ],
  }),
  component: EventsPage,
});

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function TypeBadge({ type }: { type: EventRow["event_type"] }) {
  const t = useT();
  return (
    <Badge className={type === "ccgms" ? "bg-primary text-primary-foreground" : "bg-terracotta text-terracotta-foreground"}>
      {type === "ccgms" ? t("CCGMs event") : t("Other event")}
    </Badge>
  );
}

function EventCard({ event, onOpen }: { event: EventRow; onOpen: () => void }) {
  const t = useT();
  return (
    <Card
      className="cursor-pointer border-border/70 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label={`${t("View event details")}: ${event.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <CardContent className="p-6">
        <SmartImage
          src={event.image_url ?? eventFallbackImage(event.id)}
          alt={event.image_url ? event.title : t("Community members celebrating together")}
          loading="lazy"
          width={1280}
          height={720}
          wrapperClassName="mb-4 aspect-[16/9] w-full rounded-xl"
          className="size-full object-cover"
        />
        <div className="flex items-start justify-between gap-3">
          <p className="eyebrow text-primary">{formatDate(event.start_at)}</p>
          <TypeBadge type={event.event_type} />
        </div>
        <h3 className="mt-3 text-lg">{event.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{event.description}</p>
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="size-3.5" /> {event.location}
        </p>
        <p className="mt-2 text-xs font-semibold text-foreground">
          {Number(event.fee) > 0 ? formatMoney(Number(event.fee)) : t("Free")}
        </p>
      </CardContent>
    </Card>
  );
}

type EventsSearch = {
  event?: string | undefined;
  type?: "all" | "ccgms" | "other" | undefined;
  tab?: "coming" | "past" | "all" | "calendar" | undefined;
};

function EventsPage() {
  const t = useT();
  const navigate = useNavigate({ from: "/events" });
  const search = Route.useSearch();
  const { data: events = [] } = useQuery(eventsQuery);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [calendarScope, setCalendarScope] = useState<"upcoming" | "past">("upcoming");

  const typeFilter = search.type ?? "all";
  const tab = search.tab ?? "coming";

  const setTypeFilter = (value: "all" | "ccgms" | "other") =>
    navigate({
      search: (prev: EventsSearch) => ({ ...prev, type: value === "all" ? undefined : value }),
      replace: true,
    });
  const setTab = (value: string) =>
    navigate({
      search: (prev: EventsSearch) => ({ ...prev, tab: value === "coming" ? undefined : (value as never) }),
      replace: true,
    });

  const selected = useMemo(
    () => events.find((e) => e.id === search.event) ?? null,
    [events, search.event],
  );
  const openEvent = (event: EventRow | null) =>
    navigate({ search: (prev: EventsSearch) => ({ ...prev, event: event?.id }) });

  // Shared link keeps the open event plus the current type filter and tab.
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !selected) return undefined;
    const params = new URLSearchParams({ event: selected.id });
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (tab !== "coming") params.set("tab", tab);
    return `${window.location.origin}/events?${params.toString()}`;
  }, [selected, typeFilter, tab]);

  const now = new Date();
  const visible = useMemo(
    () => (typeFilter === "all" ? events : events.filter((e) => e.event_type === typeFilter)),
    [events, typeFilter],
  );
  const upcoming = visible.filter((e) => new Date(e.start_at) >= now);
  const past = visible.filter((e) => new Date(e.start_at) < now).reverse();

  const cursor = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthLabel = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const listForTab: EventRow[] = tab === "coming" ? upcoming : tab === "past" ? past : visible;
  const tabLabel =
    tab === "coming"
      ? t("Coming events")
      : tab === "past"
        ? t("Past events")
        : tab === "all"
          ? t("All events")
          : t("Calendar");

  const grid = useMemo(() => {
    const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const lead = (firstDay.getDay() + 6) % 7;
    const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
    }
    return cells;
  }, [cursor.getFullYear(), cursor.getMonth()]);

  function eventsOn(date: Date) {
    return visible.filter((e) => {
      const start = new Date(e.start_at);
      const isPast = start < now;
      if (calendarScope === "upcoming" && isPast) return false;
      if (calendarScope === "past" && !isPast) return false;
      return (
        start.getFullYear() === date.getFullYear() &&
        start.getMonth() === date.getMonth() &&
        start.getDate() === date.getDate()
      );
    });
  }

  const dayEvents = selectedDay
    ? visible.filter((e) => {
        if (new Date(e.start_at).toDateString() !== selectedDay) return false;
        const isPast = new Date(e.start_at) < now;
        return calendarScope === "upcoming" ? !isPast : isPast;
      })
    : [];

  return (
    <>
      <PageHeader
        eyebrow={t("Events")}
        title={t("What's happening in the community")}
        description={t("CCGMs events and other community events — browse the lists or use the monthly calendar.")}
      />

      <FilterPage
        filters={(
          <>
            <FilterSelect
              label={t("Browse")}
              value={tab}
              onChange={setTab}
              options={[
                { value: "coming", label: t("Coming events"), meta: `${upcoming.length}` },
                { value: "past", label: t("Past events"), meta: `${past.length}` },
                { value: "all", label: t("All events"), meta: `${visible.length}` },
                { value: "calendar", label: t("Calendar"), meta: monthLabel },
              ]}
            />
            <FilterSelect
              label={t("Filter by type")}
              value={typeFilter}
              onChange={(value) => setTypeFilter(value as "all" | "ccgms" | "other")}
              options={[
                { value: "all", label: t("All types") },
                { value: "ccgms", label: t("CCGMs event") },
                { value: "other", label: t("Other event") },
              ]}
            />
          </>
        )}
      >
        {tab === "calendar" ? (
            <Card className="border-border/70">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl">{monthLabel}</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="soft"
                      size="icon"
                      aria-label={t("Previous month")}
                      onClick={() => setMonthOffset((v) => v - 1)}
                    >
                      <ChevronLeft />
                    </Button>
                    <Button
                      variant="soft"
                      size="icon"
                      aria-label={t("Next month")}
                      onClick={() => setMonthOffset((v) => v + 1)}
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2" role="group" aria-label={t("Show events")}>
                    {(["upcoming", "past"] as const).map((scope) => (
                      <button
                        key={scope}
                        type="button"
                        onClick={() => {
                          setCalendarScope(scope);
                          setSelectedDay(null);
                        }}
                        aria-pressed={calendarScope === scope}
                        className={`min-h-9 rounded-full border px-4 text-sm transition-colors ${
                          calendarScope === scope
                            ? "border-transparent bg-primary text-primary-foreground"
                            : "border-border hover:bg-secondary"
                        }`}
                      >
                        {scope === "upcoming" ? t("Upcoming") : t("Past")}
                      </button>
                    ))}
                  </div>
                  <ul className="flex items-center gap-4 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-primary" aria-hidden="true" />
                      {t("CCGMs event")}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-terracotta" aria-hidden="true" />
                      {t("Other event")}
                    </li>
                  </ul>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                  {WEEKDAYS.map((day) => (
                    <div key={day} className="py-2 font-medium">
                      {t(day)}
                    </div>
                  ))}
                  {grid.map((date, index) => {
                    if (!date) return <div key={`empty-${index}`} />;
                    const dayItems = eventsOn(date);
                    const isSelected = selectedDay === date.toDateString();
                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => setSelectedDay(date.toDateString())}
                        className={`min-h-20 rounded-lg border p-1.5 text-left transition-colors ${
                          isSelected
                            ? "border-primary bg-accent"
                            : "border-border/60 hover:bg-secondary"
                        }`}
                      >
                        <span className="text-sm font-medium text-foreground">
                          {date.getDate()}
                        </span>
                        <span className="mt-1 block space-y-1">
                          {dayItems.slice(0, 2).map((item) => (
                            <span
                              key={item.id}
                              className={`block truncate rounded px-1 py-0.5 text-[10px] ${
                                item.event_type === "ccgms"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-terracotta text-terracotta-foreground"
                              }`}
                            >
                              {item.title}
                            </span>
                          ))}
                          {dayItems.length > 2 ? (
                            <span className="block text-[10px]">{`+${dayItems.length - 2} ${t("more")}`}</span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedDay ? (
                  <div className="mt-6 border-t border-border pt-6">
                    <p className="eyebrow text-terracotta">{selectedDay}</p>
                    {dayEvents.length === 0 ? (
                      <p className="mt-2 text-sm text-muted-foreground">{t("No events on this day.")}</p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {dayEvents.map((event) => (
                          <li key={event.id}>
                            <button
                              type="button"
                              onClick={() => openEvent(event)}
                              className="w-full rounded-lg border border-border/70 px-4 py-3 text-left text-sm hover:bg-secondary"
                            >
                              <span className="font-medium">{event.title}</span>
                              <span className="block text-xs text-muted-foreground">
                                {event.location}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
        ) : (
          <>
            {listForTab.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("No events match these filters.")}</p>
            ) : null}
            <div className="grid gap-5 sm:grid-cols-2">
              {listForTab.map((event) => (
                <EventCard key={event.id} event={event} onOpen={() => openEvent(event)} />
              ))}
            </div>
          </>
        )}
      </FilterPage>

      <EventDialog
        event={selected}
        onOpenChange={(open) => !open && openEvent(null)}
        shareUrl={shareUrl}
      />
    </>
  );
}
