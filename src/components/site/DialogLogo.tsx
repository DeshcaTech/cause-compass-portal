import { useQuery } from "@tanstack/react-query";

import { Picture } from "@/components/site/Picture";
import { brandQuery } from "@/lib/brand";
import logo from "@/assets/ccgms-wordmark.png?w=320&format=png";
import logoAvif from "@/assets/ccgms-wordmark.png?w=320&quality=70&format=avif";
import logoWebp from "@/assets/ccgms-wordmark.png?w=320&quality=80&format=webp";

/** Small brand mark shown at the top of every popup window. */
export function DialogLogo() {
  const { data: brand } = useQuery(brandQuery);
  const customLogo = brand?.logo_url ?? null;
  return (
    <div className="flex items-center" aria-hidden="true">
      {customLogo ? (
        <img
          src={customLogo}
          alt=""
          decoding="async"
          className="h-7 w-auto max-w-[9rem] object-contain"
        />
      ) : (
        <Picture
          avif={logoAvif}
          webp={logoWebp}
          src={logo}
          alt=""
          width={320}
          height={80}
          className="h-7 w-auto max-w-[9rem] object-contain"
        />
      )}
    </div>
  );
}
