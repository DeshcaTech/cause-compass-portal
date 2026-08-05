import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { brandQuery } from "@/lib/brand";
import { Mail, MapPin, Phone } from "lucide-react";
import whatsappUs from "@/assets/whatsapp-us.png";

import logo from "@/assets/ccgms-wordmark.png?w=640&format=png";
import logoAvif from "@/assets/ccgms-wordmark.png?w=640&quality=70&format=avif";
import logoWebp from "@/assets/ccgms-wordmark.png?w=640&quality=80&format=webp";
import { Picture } from "@/components/site/Picture";
import flagsAsset from "@/assets/cm-uk-flags.jpg.asset.json";
import { useT } from "@/lib/i18n";
import { siteSettingsQuery, whatsappHref } from "@/lib/site-settings";
import { trackEvent } from "@/lib/analytics";

const columns = [
  {
    title: "About CCGMs",
    links: [
      { label: "President's message", to: "/about" },
      { label: "Board", to: "/board" },
      { label: "Downloads", to: "/documents" },
      { label: "Assets rent", to: "/assets" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Membership", to: "/membership" },
      { label: "Events", to: "/events" },
      { label: "Partners", to: "/partners" },
      { label: "Gallery", to: "/gallery" },
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
    ],
  },
  {
    title: "Quick links",
    links: [
      { label: "Donate", to: "/donate" },
      { label: "Fundraising", to: "/fundraising" },
      { label: "Support Our Causes", to: "/fundraising" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

export function Footer() {
  const t = useT();
  const { data: brand } = useQuery(brandQuery);
  const { data: site } = useQuery(siteSettingsQuery);
  const waHref = whatsappHref(
    site?.developer_whatsapp || site?.contact_whatsapp || site?.contact_phone,
    site?.whatsapp_message,
  );
  const showLogo = brand?.show_logo_footer ?? true;
  const customLogo = brand?.logo_url ?? null;
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container-page grid gap-8 py-12 sm:gap-10 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {showLogo ? (
              customLogo ? (
                <img src={customLogo} alt="" className="h-12 w-auto max-w-[12rem] shrink-0 object-contain sm:max-w-[16rem]" loading="lazy" decoding="async" />
              ) : (
                <Picture
                  avif={logoAvif}
                  webp={logoWebp}
                  src={logo}
                  alt=""
                  width={640}
                  height={162}
                  className="h-12 w-auto max-w-[12rem] shrink-0 rounded-md bg-background/95 px-2 py-1 object-contain sm:max-w-[16rem]"
                  loading="lazy"
                  decoding="async"
                />
              )
            ) : null}
            <span className={`font-display text-xl font-semibold ${showLogo ? "sr-only" : ""}`}>CCGMs</span>
            <img
              src={flagsAsset.url}
              alt="Cameroon and United Kingdom flags"
              loading="lazy"
              decoding="async"
              className="ml-auto h-10 w-auto max-w-[5rem] shrink-0 rounded-md object-cover sm:max-w-[6rem]"
            />
          </div>
          <p className="mt-4 max-w-sm text-sm text-primary-foreground/75">
            {site
              ? site.footer_blurb
              : t(
                  "A community association bringing families together — supporting one another, celebrating our culture and building a stronger future for the next generation.",
                )}
          </p>
          <ul className="mt-6 space-y-2 text-sm text-primary-foreground/75">
            <li className="flex items-center gap-2">
              <MapPin className="size-4" /> {site?.contact_address ?? "CCGMs Centre, 24 Unity Road"}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4" /> {site?.contact_phone ?? "07700 900000"}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4" /> {site?.contact_email ?? "hello@ccgms.org"}
            </li>
          </ul>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="eyebrow text-gold">{t(column.title)}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={`${link.to}-${link.label}`}>
                  <Link
                    to={link.to}
                    className="text-primary-foreground/75 transition-colors hover:text-gold"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} CCGMs Community Association.{" "}
            {t("All rights reserved.")}
          </p>
          <p className="text-primary-foreground/70">
            {t("Powered by")}{" "}
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void trackEvent("deshcatech_whatsapp_click", { source: "footer" })}
                className="font-semibold text-gold underline-offset-4 hover:underline"
              >
                DeshcaTech
              </a>
            ) : (
              <span className="font-semibold text-gold">DeshcaTech</span>
            )}
          </p>
          <span className="flex gap-4">
            <Link to="/contact" className="hover:text-gold">
              {t("Contact us")}
            </Link>
            <Link to="/admin" className="hover:text-gold">
              {t("Admin")}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}