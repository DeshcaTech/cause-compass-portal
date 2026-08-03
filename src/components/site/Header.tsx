import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ChevronDown } from "lucide-react";

import logo from "@/assets/ccgms-logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = { label: string; to: string };
type NavGroup = { label: string; to?: string; items?: NavItem[] };

export const NAV: NavGroup[] = [
  { label: "Home", to: "/" },
  {
    label: "About CCGMs",
    items: [
      { label: "President's message", to: "/about" },
      { label: "Board", to: "/board" },
      { label: "Downloads", to: "/documents" },
      { label: "Assets rent", to: "/assets" },
    ],
  },
  { label: "Membership", to: "/membership" },
  { label: "Events", to: "/events" },
  { label: "Partners", to: "/partners" },
  { label: "Gallery", to: "/gallery" },
  {
    label: "Get involved",
    items: [
      { label: "Fundraising", to: "/fundraising" },
      { label: "Donate", to: "/donate" },
      { label: "Surveys", to: "/surveys" },
      { label: "Become a volunteer", to: "/volunteer" },
      { label: "Refer someone", to: "/refer" },
    ],
  },
  { label: "Contact", to: "/contact" },
];

const linkClass =
  "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="CCGMs logo" width={44} height={44} className="h-11 w-11" />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold text-primary">CCGMs</span>
            <span className="block text-[11px] text-muted-foreground">Community Association</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((group) =>
            group.items ? (
              <div key={group.label} className="group relative">
                <button className={`${linkClass} inline-flex items-center gap-1`} type="button">
                  {group.label}
                  <ChevronDown className="size-3.5" />
                </button>
                <div className="invisible absolute left-0 top-full w-56 translate-y-1 rounded-xl border border-border bg-popover p-1.5 opacity-0 shadow-[var(--shadow-lift)] transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {group.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block rounded-lg px-3 py-2 text-sm text-foreground/85 hover:bg-accent hover:text-accent-foreground"
                      activeProps={{ className: "bg-accent text-accent-foreground" }}
                    >
                      {item.label}
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
                {group.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="soft" size="sm">
            <Link to="/membership">Join</Link>
          </Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/donate">Donate</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto">
            <div className="mt-8 flex flex-col gap-1">
              {NAV.map((group) =>
                group.items ? (
                  <div key={group.label} className="mt-3">
                    <p className="eyebrow px-3 py-1 text-muted-foreground">{group.label}</p>
                    {group.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={group.to}
                    to={group.to!}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    {group.label}
                  </Link>
                ),
              )}
              <div className="mt-6 flex gap-2 px-3">
                <Button asChild variant="soft" className="flex-1">
                  <Link to="/membership" onClick={() => setOpen(false)}>
                    Join
                  </Link>
                </Button>
                <Button asChild variant="hero" className="flex-1">
                  <Link to="/donate" onClick={() => setOpen(false)}>
                    Donate
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}