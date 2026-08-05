import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, ChevronDown } from "lucide-react";

import logo from "@/assets/ccgms-wordmark.png?w=640&format=png";
import logoAvif from "@/assets/ccgms-wordmark.png?w=640&quality=70&format=avif";
import logoWebp from "@/assets/ccgms-wordmark.png?w=640&quality=80&format=webp";
import { Picture } from "@/components/site/Picture";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useT } from "@/lib/i18n";
import { brandQuery } from "@/lib/brand";

type NavItem = { label: string; to: string };
type NavGroup = { label: string; to?: string; items?: NavItem[] };

export const NAV: NavGroup[] = [
  {
    label: "About CCGMs",
    items: [
      { label: "President's message", to: "/about" },
      { label: "Board Members", to: "/board" },
      { label: "News", to: "/news" },
      { label: "Our Groups", to: "/village-groups" },
      { label: "Documents", to: "/documents" },
      { label: "Assets rent", to: "/assets" },
    ],
  },
  { label: "Membership", to: "/membership" },
  { label: "Events", to: "/events" },
  {
    label: "Partners",
    items: [
      { label: "Our Businesses", to: "/partners" },
      { label: "Jobs", to: "/jobs" },
    ],
  },
  { label: "Gallery", to: "/gallery" },
  {
    label: "Get involved",
    items: [
      { label: "Fundraising", to: "/fundraising" },
      { label: "Donate", to: "/donate" },
      { label: "Surveys", to: "/surveys" },
      { label: "Become a volunteer", to: "/volunteer" },
      { label: "Get Support", to: "/refer" },
    ],
  },
  { label: "Contact", to: "/contact" },
];

const linkClass =
  "rounded-md px-2.5 py-2 text-nav font-bold text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap";

export function Header() {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const t = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPathActive = (to: string) =>
    pathname === to || pathname.startsWith(to + "/");
  const { data: brand } = useQuery(brandQuery);
  const showLogo = brand?.show_logo_header ?? true;
  const customLogo = brand?.logo_url ?? null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container-page flex items-center justify-between gap-4 py-2.5">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          {showLogo ? (
            customLogo ? (
              <img src={customLogo} alt="CCGMs logo" className="h-11 w-auto max-w-[15rem] object-contain" decoding="async" />
            ) : (
              <Picture
                avif={logoAvif}
                webp={logoWebp}
                src={logo}
                alt="CCGMs — Cameroon Community of Greater Manchester & Surrounding areas"
                width={640}
                height={162}
                className="h-11 w-auto max-w-[15rem] object-contain sm:h-12 sm:max-w-[19rem]"
                fetchPriority="high"
                decoding="async"
              />
            )
          ) : null}
          <span className={`leading-tight ${showLogo ? "sr-only" : ""}`}>
            <span className="block font-display text-lg font-semibold text-primary">CCGMs</span>
            <span className="block text-[11px] text-muted-foreground">
              {t("Community Association")}
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {NAV.map((group) =>
            group.items ? (
              <div key={group.label} className="group relative">
                <button
                  className={`${linkClass} inline-flex items-center gap-1 font-bold ${
                    group.items!.some((it) => isPathActive(it.to))
                      ? "text-primary"
                      : ""
                  }`}
                  type="button"
                >
                  {t(group.label)}
                  <ChevronDown className="size-3.5" />
                </button>
                <div className="invisible absolute left-0 top-full w-56 translate-y-1 rounded-xl border border-border bg-popover p-1.5 opacity-0 shadow-[var(--shadow-lift)] transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {group.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block rounded-lg px-3 py-2 text-nav text-foreground/85 hover:bg-accent hover:text-accent-foreground"
                      activeOptions={{ exact: false }}
                      activeProps={{
                        className:
                          "bg-accent/80 font-semibold text-accent-foreground ring-1 ring-primary/40",
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {isPathActive(item.to) && (
                          <span className="size-1.5 rounded-full bg-primary" />
                        )}
                        {t(item.label)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={group.to}
                to={group.to!}
                className={linkClass}
                activeOptions={{ exact: group.to === "/" }}
                activeProps={{ className: "bg-accent text-accent-foreground" }}
              >
                {t(group.label)}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <Button asChild variant="soft" size="sm">
            <Link to="/membership">{t("Join")}</Link>
          </Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/donate">{t("Donate")}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setOpenGroup(null); }}>
        <SheetContent side="right" className="w-80 overflow-y-auto">
          <div className="mt-8 flex flex-col gap-1">
            {NAV.map((group) =>
              group.items ? (
                <div key={group.label}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroup((g) => (g === group.label ? null : group.label))
                    }
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-nav font-bold ${
                      group.items!.some((it) => isPathActive(it.to))
                        ? "text-primary"
                        : ""
                    }`}
                    aria-expanded={openGroup === group.label}
                  >
                    {t(group.label)}
                    <ChevronDown
                      className={`size-4 transition-transform ${
                        openGroup === group.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openGroup === group.label && (
                    <div className="mt-0.5 flex flex-col gap-0.5 pl-3">
                      {group.items.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className="block rounded-lg px-3 py-2 text-nav text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                          activeOptions={{ exact: false }}
                          activeProps={{
                            className: "bg-accent font-semibold text-accent-foreground",
                          }}
                        >
                          {t(item.label)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={group.to}
                  to={group.to!}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-nav font-bold"
                >
                  {t(group.label)}
                </Link>
              ),
            )}
            <div className="mt-6 flex gap-2 px-3">
              <Button asChild variant="soft" className="flex-1">
                <Link to="/membership" onClick={() => setOpen(false)}>
                  {t("Join")}
                </Link>
              </Button>
              <Button asChild variant="hero" className="flex-1">
                <Link to="/donate" onClick={() => setOpen(false)}>
                  {t("Donate")}
                </Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}