import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

import logo from "@/assets/ccgms-logo.png";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Home", to: "/" },
      { label: "President's message", to: "/about" },
      { label: "Board members", to: "/board" },
      { label: "News", to: "/news" },
      { label: "Membership", to: "/membership" },
      { label: "Events", to: "/events" },
      { label: "Partners", to: "/partners" },
      { label: "Gallery", to: "/gallery" },
      { label: "Downloads", to: "/documents" },
      { label: "Assets rent", to: "/assets" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { label: "Fundraising", to: "/fundraising" },
      { label: "Donate", to: "/donate" },
      { label: "Surveys", to: "/surveys" },
      { label: "Volunteer", to: "/volunteer" },
      { label: "Refer someone", to: "/refer" },
      { label: "Contact us", to: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" width={44} height={44} className="h-11 w-11" loading="lazy" />
            <span className="font-display text-xl font-semibold">CCGMs</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-primary-foreground/75">
            A community association bringing families together — supporting one another,
            celebrating our culture and building a stronger future for the next generation.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-primary-foreground/75">
            <li className="flex items-center gap-2">
              <MapPin className="size-4" /> CCGMs Centre, 24 Unity Road
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4" /> 07700 900000
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4" /> hello@ccgms.org
            </li>
          </ul>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="eyebrow text-gold">{column.title}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-primary-foreground/75 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CCGMs Community Association. All rights reserved.</p>
          <p className="text-primary-foreground/70">
            Powered by <span className="font-semibold text-gold">DeshcaTech</span>
          </p>
          <span className="flex gap-4">
            <Link to="/contact" className="hover:text-gold">
              Contact us
            </Link>
            <Link to="/admin" className="hover:text-gold">
              Admin
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}