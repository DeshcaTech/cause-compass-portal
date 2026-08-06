import { Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Partner } from "@/lib/queries";
import { useT } from "@/lib/i18n";
import { ShareButton } from "@/components/site/ShareButton";
import businessFallback from "@/assets/business-fallback.jpg";

/** Shared business popup used on the home page and the partners directory. */
export function PartnerDialog({
  partner,
  onOpenChange,
}: {
  partner: Partner | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const whatsapp = partner?.whatsapp?.replace(/[^\d]/g, "") ?? "";
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
              className="aspect-[16/9] w-full rounded-xl object-cover"
            />
            <Badge variant="secondary">{partner.category}</Badge>
            <p className="text-sm text-foreground/85">
              {partner.description ?? partner.short_description}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {partner.phone ? (
                <li className="flex items-center gap-2">
                  <Phone className="size-4" /> {partner.phone}
                </li>
              ) : null}
              {partner.email ? (
                <li className="flex items-center gap-2">
                  <Mail className="size-4" /> {partner.email}
                </li>
              ) : null}
              {partner.address ? (
                <li className="flex items-center gap-2">
                  <MapPin className="size-4" /> {partner.address}
                </li>
              ) : null}
            </ul>
            <div className="flex flex-wrap gap-2">
              {partner.website ? (
                <Button asChild variant="hero" className="flex-1">
                  <a href={partner.website} target="_blank" rel="noreferrer">
                    <Globe /> {t("View website")}
                  </a>
                </Button>
              ) : whatsapp ? (
                <Button asChild variant="hero" className="flex-1">
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
                    <MessageCircle /> {t("Contact")}
                  </a>
                </Button>
              ) : null}
              <ShareButton
                title={partner.business_name}
                path={`/partners?partner=${partner.id}`}
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
