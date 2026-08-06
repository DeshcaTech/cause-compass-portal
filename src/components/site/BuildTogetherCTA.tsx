import { Link, useRouter } from "@tanstack/react-router";

import { useT } from "@/lib/i18n";

export function BuildTogetherCTA() {
  const t = useT();
  const pathname = useRouter().state.location.pathname.replace(/\/$/, "") || "/";
  if (pathname === "/membership") return null;

  return (
    <div className="container-page flex justify-center py-10">
      <Link
        to="/membership"
        className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-terracotta-foreground shadow-sm transition-transform hover:scale-[1.03]"
      >
        {t("Let's Build It Together!")}
      </Link>
    </div>
  );
}
