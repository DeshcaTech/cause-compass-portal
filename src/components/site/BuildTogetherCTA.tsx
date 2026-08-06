import { Link, useRouter } from "@tanstack/react-router";

import { useT } from "@/lib/i18n";

export function BuildTogetherCTA() {
  const t = useT();
  const pathname = useRouter().state.location.pathname.replace(/\/$/, "") || "/";
  const onMembership = pathname === "/membership";
  const onVolunteer = pathname === "/volunteer";

  return (
    <div className="container-page flex flex-wrap items-center justify-center gap-3 py-10">
      {!onVolunteer && (
      <Link
        to="/volunteer"
        className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-terracotta-foreground shadow-sm transition-transform hover:scale-[1.03]"
      >
        {t("Let's Build It Together!")}
      </Link>
      )}
      {!onMembership && (
        <Link
          to="/membership"
          className={
            onVolunteer
              ? "inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-terracotta-foreground shadow-sm transition-transform hover:scale-[1.03]"
              : "inline-flex items-center justify-center rounded-full bg-[image:var(--gradient-gold)] px-6 py-2.5 text-sm font-semibold text-gold-foreground shadow-[var(--shadow-soft)] transition-transform hover:scale-[1.03]"
          }
        >
          {t("Join your Community")}
        </Link>
      )}
    </div>
  );
}
