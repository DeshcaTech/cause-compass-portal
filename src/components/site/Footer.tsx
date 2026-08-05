import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { brandQuery } from "@/lib/brand";
import { ChevronDown, Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
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
    title: "Explore",
    links: [
      { label: "President's message", to: "/about" },
      { label: "Membership", to: "/membership" },
      { label: "Events", to: "/events" },
      { label: "Partners", to: "/partners" },
      { label: "Gallery", to: "/gallery" },
      { label: "Documents", to: "/documents" },
    ],
  },
  {
    title: "Quick links",
    links: [
      { label: "Get Support", to: "/refer" },
      { label: "Surveys", to: "/surveys" },
      { label: "Become a Volunteer", to: "/volunteer" },
      { label: "Donate", to: "/donate" },
      { label: "Asset Rental", to: "/assets" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
];

/**
 * A footer section that is collapsible on mobile (accordion) and always
 * expanded on desktop. The `header` node is reused as the toggle label on
 * mobile and rendered plainly on desktop.
 */
function FooterSection({
  header,
  children,
  defaultOpen = false,
  className,
}: {
  header: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={className}>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-1 lg:hidden"
      >
        {header}
        <ChevronDown
          className={`size-5 shrink-0 text-gold transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {/* Desktop header (always visible, no toggle) */}
      <div className="hidden lg:block">{header}</div>
      <div className={`${open ? "block" : "hidden"} lg:block`}>{children}</div>
    </div>
  );
}

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

  const brandingHeader = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {showLogo ? (
        customLogo ? (
          <img
            src={customLogo}
            alt=""
            className="h-12 w-auto max-w-[12rem] shrink-0 object-contain sm:max-w-[16rem]"
            loading="lazy"
            decoding="async"
          />
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
  );

  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container-page grid grid-cols-2 gap-8 py-12 sm:gap-10 lg:grid-cols-6">
        <div className="col-span-2 lg:col-span-2">
          <FooterSection header={brandingHeader} defaultOpen>
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
              <li className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-2">
                  <Phone className="size-4" /> {site?.contact_phone ?? "07700 900000"}
                </span>
                {site?.show_contact_whatsapp !== false &&
                whatsappHref(site?.contact_whatsapp || site?.contact_phone, site?.whatsapp_message) ? (
                  <a
                    href={whatsappHref(site?.contact_whatsapp || site?.contact_phone, site?.whatsapp_message)!}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Chat with CCGMs on WhatsApp"
                    onClick={() => void trackEvent("whatsapp_us_click", { source: "footer" })}
                    className="block transition-transform hover:scale-[1.02]"
                  >
                    <img
                      src={whatsappUs}
                      alt="Chat with CCGMs on WhatsApp"
                      loading="lazy"
                      width={1536}
                      height={512}
                      className="h-7 w-auto"
                    />
                  </a>
                ) : null}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4" /> {site?.contact_email ?? "hello@ccgms.org"}
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <a
                href={`tel:${(site?.contact_phone ?? "07700900000").replace(/[^\d]/g, "")}`}
                aria-label="Call us"
                onClick={() => void trackEvent("footer_contact_click", { channel: "phone" })}
                className="grid size-9 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
              >
                <Phone className="size-4" />
              </a>
              <a
                href={`mailto:${site?.contact_email ?? "hello@ccgms.org"}`}
                aria-label="Email us"
                onClick={() => void trackEvent("footer_contact_click", { channel: "email" })}
                className="grid size-9 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
              >
                <Mail className="size-4" />
              </a>
              {site?.facebook_url ? (
                <a
                  href={site.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  onClick={() => void trackEvent("footer_social_click", { channel: "facebook" })}
                  className="grid size-9 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                >
                  <Facebook className="size-4" />
                </a>
              ) : null}
              {site?.instagram_url ? (
                <a
                  href={site.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  onClick={() => void trackEvent("footer_social_click", { channel: "instagram" })}
                  className="grid size-9 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                >
                  <Instagram className="size-4" />
                </a>
              ) : null}
              {site?.x_url ? (
                <a
                  href={site.x_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X (Twitter)"
                  onClick={() => void trackEvent("footer_social_click", { channel: "x" })}
                  className="grid size-9 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                >
                  <Twitter className="size-4" />
                </a>
              ) : null}
              {site?.youtube_url ? (
                <a
                  href={site.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  onClick={() => void trackEvent("footer_social_click", { channel: "youtube" })}
                  className="grid size-9 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                >
                  <Youtube className="size-4" />
                </a>
              ) : null}
            </div>
          </FooterSection>
        </div>

        {columns.map((column) => (
          <FooterSection
            key={column.title}
            header={<p className="eyebrow text-gold">{t(column.title)}</p>}
            defaultOpen={false}
          >
            <ul className="mt-4 space-y-2 text-sm lg:mt-0">
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
          </FooterSection>
        ))}
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} CCGMs Community Association.{" "}
            {t("All rights reserved.")}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
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
      </div>
    </footer>
  );
}
