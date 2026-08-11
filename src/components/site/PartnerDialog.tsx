import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Partner } from "@/lib/queries";
import { fillTemplate, siteSettingsQuery, whatsappHref } from "@/lib/site-settings";
import { useT } from "@/lib/i18n";
import { useDyn } from "@/lib/i18n/dynamic";
import { ShareButton } from "@/components/site/ShareButton";
import { WhatsAppIcon } from "@/components/site/icons/WhatsApp";
import businessFallback from "@/assets/business-fallback.jpg";

/** Admins often type "example.com" — make sure it opens as an external site. */
function externalUrl(raw: string) {
  const url = raw.trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (/^\/\//.test(url)) return `https:${url}`;
  return `https://${url.replace(/^\/+/, "")}`;
}

/** Shared business popup used on the home page and the partners directory. */
export function PartnerDialog({
  partner,
  onOpenChange,
}: {
  partner: Partner | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const dyn = useDyn();
  const { data: site } = useQuery(siteSettingsQuery);
  const waHref = whatsappHref(
    partner?.whatsapp,
    fillTemplate(site?.business_whatsapp_message, { business: partner?.business_name }),
  );
  const website = externalUrl(partner?.website ?? "");
  return (
    <Dialog open={!!partner} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-left">{partner?.business_name}</DialogTitle>
        </DialogHeader>
        {partner ? (
          <div className="space-y-4">
            <img
              src={partner.logo_url ?? businessFallback}
              alt={`${partner.business_name} logo`}
              className="max-h-[60vh] w-full rounded-xl bg-secondary object-contain"
            />
            <Badge variant="secondary">{dyn(partner.category)}</Badge>
            <p className="text-sm text-foreground/85">
              {dyn(partner.description ?? partner.short_description)}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {partner.phone ? (
                <li>
                  <a
                    href={`tel:${partner.phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-2 underline-offset-4 hover:text-foreground hover:underline"
                  >
                    <Phone className="size-4 shrink-0" /> {partner.phone}
                  </a>
                </li>
              ) : null}
              {waHref ? (
                <li>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 underline-offset-4 hover:text-foreground hover:underline"
                  >
                    <WhatsAppIcon className="size-4 shrink-0 text-[#25D366]" />{" "}
                    {partner.whatsapp}
                  </a>
                </li>
              ) : null}
              {partner.email ? (
                <li>
                  <a
                    href={`mailto:${partner.email}`}
                    className="flex items-center gap-2 break-all underline-offset-4 hover:text-foreground hover:underline"
                  >
                    <Mail className="size-4 shrink-0" /> {partner.email}
                  </a>
                </li>
              ) : null}
              {partner.address ? (
                <li>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partner.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 underline-offset-4 hover:text-foreground hover:underline"
                  >
                    <MapPin className="size-4 shrink-0" /> {dyn(partner.address)}
                  </a>
                </li>
              ) : null}
            </ul>
            <div className="flex flex-wrap gap-2">
              {website ? (
                <Button asChild variant="hero" className="flex-1">
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer external"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(website, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <Globe /> {t("View website")}
                  </a>
                </Button>
              ) : waHref ? (
                <Button asChild variant="hero" className="flex-1">
                  <a href={waHref} target="_blank" rel="noreferrer">
                    <WhatsAppIcon className="size-4" /> {t("Contact")}
                  </a>
                </Button>
              ) : null}
              <ShareButton
                title={partner.business_name}
                path={`/partners?partner=${partner.id}`}
                image={partner.logo_url ?? null}
                label={t("Share business")}
                className="flex-1"
              />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
