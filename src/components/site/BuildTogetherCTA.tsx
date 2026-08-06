import { Link, useRouter } from "@tanstack/react-router";

import { useT } from "@/lib/i18n";

export function BuildTogetherCTA() {
  const t = useT();
  const pathname = useRouter().state.location.pathname.replace(/\/$/, "") || "/";
  if (pathname === "/membership") return null;

  return (
    <div className="container-page flex flex-wrap items-center justify-center gap-3 py-10">
      <Link
        to="/membership"
        className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-terracotta-foreground shadow-sm transition-transform hover:scale-[1.03]"
      >
        {t("Let's Build It Together!")}
      </Link>
      <Link
        to="/volunteer"
        className="inline-flex items-center justify-center rounded-full border border-terracotta/40 bg-background px-6 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-transform hover:scale-[1.03]"
      >
        {t("Become a volunteer")}
      </Link>
    </div>
  );
}
