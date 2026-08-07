import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { brandQuery } from "@/lib/brand";
import { footerPhotosQuery, galleriesQuery, galleryPhotosQuery } from "@/lib/queries";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import whatsappUs from "@/assets/whatsapp-us.png";
import { TikTok } from "@/components/site/icons/TikTok";
import { SmartImage } from "@/components/site/SmartImage";

import galleryFallback from "@/assets/gallery-fallback.jpg";
import communityTogether from "@/assets/community-together.jpg";
import eventFallback from "@/assets/event-fallback.jpg";
import heroCommunity from "@/assets/hero-community.jpg";
import volunteerHero from "@/assets/volunteer-hero.jpg";
import surveyFallback from "@/assets/survey-fallback.jpg";

import logo from "@/assets/ccgms-wordmark.png?w=640&format=png";
import logoAvif from "@/assets/ccgms-wordmark.png?w=640&quality=70&format=avif";
import logoWebp from "@/assets/ccgms-wordmark.png?w=640&quality=80&format=webp";
import { Picture } from "@/components/site/Picture";
import flagsAsset from "@/assets/cm-uk-flags.jpg.asset.json";
import { useT } from "@/lib/i18n";
import { siteSettingsQuery, whatsappHref } from "@/lib/site-settings";
import { trackEvent } from "@/lib/analytics";

const FOOTER_PLACEHOLDERS = [
  galleryFallback,
  communityTogether,
  eventFallback,
  heroCommunity,
  volunteerHero,
  surveyFallback,
];

const columns = [
  {
    title: "Explore",
    links: [
      { label: "President's message", to: "/about" },
      { label: "Events", to: "/events" },
      { label: "Partners", to: "/partners" },
      { label: "Gallery", to: "/gallery" },
      { label: "Documents", to: "/documents" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
  {
    title: "Get Involve",
    links: [
      { label: "Membership", to: "/membership" },
      { label: "Get Support", to: "/refer" },
      { label: "Surveys", to: "/surveys" },
      { label: "Volunteer", to: "/volunteer" },
      { label: "Donate", to: "/donate" },
      { label: "Asset Rental", to: "/assets" },
    ],
  },
];

export function Footer() {
  const t = useT();
  const { data: brand } = useQuery(brandQuery);
  const { data: site } = useQuery(siteSettingsQuery);
  const { data: galleries = [] } = useQuery(galleriesQuery);
  const { data: photos = [] } = useQuery(galleryPhotosQuery);
  const { data: curated = [] } = useQuery(footerPhotosQuery);
  // Reshuffle only after hydration so server and client markup match.
  const [shuffleSeed, setShuffleSeed] = useState(0);
  useEffect(() => setShuffleSeed(Math.random()), []);
  const waHref = whatsappHref(
    site?.developer_whatsapp || site?.contact_whatsapp || site?.contact_phone,
    site?.whatsapp_message,
  );
  const showLogo = brand?.show_logo_footer ?? true;
  const customLogo = brand?.logo_url ?? null;

  // Six showcase photos for the desktop footer strip: prefer the
  // admin-chosen default gallery's photos, then any gallery photos, then
  // placeholders so the strip always looks complete.
  const galleryTiles = useMemo(() => {
    if (curated.length > 0) {
      const pool = [...curated];
      if (shuffleSeed) {
        for (let i = pool.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j]!, pool[i]!];
        }
      }
      return pool.slice(0, 6).map((p) => ({
        key: p.id,
        src: p.photo_url,
        alt: p.caption ?? "Community photo",
      }));
    }
    const defaultGallery = galleries.find((g) => g.is_default) ?? galleries[0];
    let real = photos
      .filter((p) => (defaultGallery ? p.gallery_id === defaultGallery.id : true))
      .map((p) => ({ key: p.id, src: p.photo_url, alt: p.caption ?? defaultGallery?.title ?? "Community photo" }));
    if (real.length === 0) {
      real = photos
        .slice(0, 6)
        .map((p) => ({ key: p.id, src: p.photo_url, alt: p.caption ?? "Community photo" }));
    }
    const fillers = FOOTER_PLACEHOLDERS.slice(0, Math.max(0, 6 - real.length)).map((src, i) => ({
      key: `placeholder-${i}`,
      src,
      alt: "Community photo",
    }));
    return [...real, ...fillers].slice(0, 6);
  }, [galleries, photos, curated, shuffleSeed]);
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container-page grid grid-cols-2 gap-8 py-12 sm:gap-10 lg:grid-cols-6">
        <div className="col-span-2 lg:col-span-2">
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
                  aria-label={t("Chat with CCGMs on WhatsApp")}
                  onClick={() => void trackEvent("whatsapp_us_click", { source: "footer" })}
                  className="block transition-transform hover:scale-[1.02]"
                >
                  <img
                    src={whatsappUs}
                    alt="Chat with CCGMs on WhatsApp"
                    loading="lazy"
                    width={1536}
                    height={512}
                    className="h-10 w-auto"
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
              aria-label={t("Call us")}
              onClick={() => void trackEvent("footer_contact_click", { channel: "phone" })}
              className="grid size-9 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
            >
              <Phone className="size-4" />
            </a>
            <a
              href={`mailto:${site?.contact_email ?? "hello@ccgms.org"}`}
              aria-label={t("Email us")}
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
            {site?.tiktok_url ? (
              <a
                href={site.tiktok_url}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                onClick={() => void trackEvent("footer_social_click", { channel: "tiktok" })}
                className="grid size-9 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
              >
                <TikTok className="size-4" />
              </a>
            ) : null}
          </div>
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

        <div className="col-span-2 lg:col-span-2">
          <p className="eyebrow text-gold">{t("From the gallery")}</p>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {galleryTiles.map((tile) => (
              <Link
                key={tile.key}
                to="/gallery"
                className="group block aspect-square overflow-hidden rounded-lg border border-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                aria-label={t("View gallery")}
              >
                <SmartImage
                  src={tile.src}
                  alt={tile.alt}
                  loading="lazy"
                  wrapperClassName="size-full"
                  className="size-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} CCGMs Community Association.{" "}
            {t("All rights reserved.")}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <Link to="/admin" className="hover:text-gold">
              {t("Admin")}
            </Link>
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
          </div>
        </div>
      </div>
    </footer>
  );
}